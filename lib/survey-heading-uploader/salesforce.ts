import crypto from "crypto";
import type { SurveyHeadingRow } from "./schema";

const SURVEY_OBJECT = "Survey__c";
const SURVEY_HEADING_OBJECT = "Survey_Heading__c";

const API_VERSION = "v62.0";
const SOBJECT_COLLECTIONS_CHUNK_SIZE = 200; // Salesforce's per-request limit

interface CachedToken {
  accessToken: string;
  instanceUrl: string;
  expiresAt: number;
}

let cached: CachedToken | null = null;

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function signJwtAssertion(): string {
  const loginUrl = requireEnv("SF_SURVEY_LOGIN_URL");
  const clientId = requireEnv("SF_SURVEY_CLIENT_ID");
  const username = requireEnv("SF_SURVEY_USERNAME");
  const privateKey = requireEnv("SF_SURVEY_PRIVATE_KEY").replace(/\\n/g, "\n");

  const header = base64url(JSON.stringify({ alg: "RS256" }));
  const payload = base64url(
    JSON.stringify({
      iss: clientId,
      sub: username,
      aud: loginUrl,
      exp: Math.floor(Date.now() / 1000) + 180,
    })
  );

  const signature = crypto.sign("RSA-SHA256", Buffer.from(`${header}.${payload}`), privateKey);
  return `${header}.${payload}.${base64url(signature)}`;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

async function getAccessToken(): Promise<CachedToken> {
  if (cached && cached.expiresAt > Date.now()) return cached;

  const loginUrl = requireEnv("SF_SURVEY_LOGIN_URL");
  const assertion = signJwtAssertion();

  const res = await fetch(`${loginUrl}/services/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!res.ok) {
    throw new Error(`Salesforce auth failed: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as { access_token: string; instance_url: string };
  cached = {
    accessToken: json.access_token,
    instanceUrl: json.instance_url,
    expiresAt: Date.now() + 25 * 60 * 1000,
  };
  return cached;
}

async function sfFetch(path: string, init?: RequestInit): Promise<Response> {
  const { accessToken, instanceUrl } = await getAccessToken();
  return fetch(`${instanceUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

function escapeSoql(value: string): string {
  return value.replace(/'/g, "\\'");
}

export interface Survey {
  id: string;
  name: string;
}

export async function findSurveyByDocumentId(documentId: string): Promise<Survey | null> {
  const soql = `SELECT Id, Name FROM ${SURVEY_OBJECT} WHERE Document_ID__c = '${escapeSoql(documentId)}' LIMIT 1`;
  const res = await sfFetch(`/services/data/${API_VERSION}/query?q=${encodeURIComponent(soql)}`);
  if (!res.ok) throw new Error(`Survey lookup failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { records: { Id: string; Name: string }[] };
  const record = json.records[0];
  return record ? { id: record.Id, name: record.Name } : null;
}

export async function countHeadingsForSurvey(surveyId: string): Promise<number> {
  const soql = `SELECT COUNT() FROM ${SURVEY_HEADING_OBJECT} WHERE Survey2__c = '${surveyId}'`;
  const res = await sfFetch(`/services/data/${API_VERSION}/query?q=${encodeURIComponent(soql)}`);
  if (!res.ok) throw new Error(`Heading count failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { totalSize: number };
  return json.totalSize;
}

export async function deleteHeadingsForSurvey(surveyId: string): Promise<number> {
  const soql = `SELECT Id FROM ${SURVEY_HEADING_OBJECT} WHERE Survey2__c = '${surveyId}'`;
  const queryRes = await sfFetch(`/services/data/${API_VERSION}/query?q=${encodeURIComponent(soql)}`);
  if (!queryRes.ok) throw new Error(`Heading lookup failed: ${queryRes.status} ${await queryRes.text()}`);
  const { records } = (await queryRes.json()) as { records: { Id: string }[] };

  let deleted = 0;
  for (let i = 0; i < records.length; i += SOBJECT_COLLECTIONS_CHUNK_SIZE) {
    const chunk = records.slice(i, i + SOBJECT_COLLECTIONS_CHUNK_SIZE);
    const ids = chunk.map((r) => r.Id).join(",");
    const res = await sfFetch(
      `/services/data/${API_VERSION}/composite/sobjects?ids=${ids}&allOrNone=false`,
      { method: "DELETE" }
    );
    if (!res.ok) throw new Error(`Delete failed: ${res.status} ${await res.text()}`);
    const results = (await res.json()) as { success: boolean }[];
    deleted += results.filter((r) => r.success).length;
  }
  return deleted;
}

export interface InsertOutcome {
  row: number;
  success: boolean;
  error?: string;
}

export async function insertHeadings(
  surveyId: string,
  rows: { rowNumber: number; data: SurveyHeadingRow }[]
): Promise<InsertOutcome[]> {
  const outcomes: InsertOutcome[] = [];

  for (let i = 0; i < rows.length; i += SOBJECT_COLLECTIONS_CHUNK_SIZE) {
    const chunk = rows.slice(i, i + SOBJECT_COLLECTIONS_CHUNK_SIZE);
    const res = await sfFetch(`/services/data/${API_VERSION}/composite/sobjects`, {
      method: "POST",
      body: JSON.stringify({
        allOrNone: false,
        records: chunk.map(({ data }) => ({
          attributes: { type: SURVEY_HEADING_OBJECT },
          Name: data.location,
          Figure_Number__c: data.figureNumber,
          Survey2__c: surveyId,
        })),
      }),
    });

    if (!res.ok) throw new Error(`Insert failed: ${res.status} ${await res.text()}`);

    const results = (await res.json()) as { success: boolean; errors: { message: string }[] }[];
    results.forEach((result, idx) => {
      outcomes.push({
        row: chunk[idx].rowNumber,
        success: result.success,
        error: result.success ? undefined : result.errors.map((e) => e.message).join("; "),
      });
    });
  }

  return outcomes;
}
