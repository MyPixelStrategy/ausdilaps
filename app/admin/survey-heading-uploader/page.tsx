"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface RowErrorItem {
  row: number;
  message: string;
}

interface UploadResponse {
  ok: boolean;
  error?: string;
  surveyName?: string;
  created?: number;
  errors?: RowErrorItem[];
}

interface DeletePreviewResponse {
  ok: boolean;
  error?: string;
  preview?: boolean;
  surveyName?: string;
  count?: number;
  deleted?: number;
}

export default function SurveyHeadingUploaderPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [surveyNumber, setSurveyNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const [dangerOpen, setDangerOpen] = useState(false);
  const [deleteSurveyNumber, setDeleteSurveyNumber] = useState("");
  const [deletePreview, setDeletePreview] = useState<DeletePreviewResponse | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteResult, setDeleteResult] = useState<DeletePreviewResponse | null>(null);

  function chooseFile(f: File | null) {
    setError(null);
    setResult(null);
    setFile(f);
  }

  async function upload() {
    if (!file) {
      setError("Choose a CSV file first.");
      return;
    }
    if (!surveyNumber.trim()) {
      setError("Enter the Survey Document ID.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("surveyNumber", surveyNumber.trim());

      const res = await fetch("/api/survey-heading-upload", { method: "POST", body });
      const json = (await res.json()) as UploadResponse;

      if (!json.ok) {
        setError(json.error ?? "Something went wrong.");
        if (json.errors) setResult(json);
        return;
      }
      setResult(json);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function checkExistingHeadings() {
    if (!deleteSurveyNumber.trim()) {
      setDeleteError("Enter the Survey Document ID.");
      return;
    }
    setDeleteLoading(true);
    setDeleteError(null);
    setDeletePreview(null);
    setDeleteResult(null);
    setDeleteConfirmText("");
    try {
      const res = await fetch("/api/survey-heading-upload/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ surveyNumber: deleteSurveyNumber.trim() }),
      });
      const json = (await res.json()) as DeletePreviewResponse;
      if (!json.ok) {
        setDeleteError(json.error ?? "Something went wrong.");
        return;
      }
      setDeletePreview(json);
    } catch (e) {
      setDeleteError((e as Error).message);
    } finally {
      setDeleteLoading(false);
    }
  }

  async function confirmDelete() {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/survey-heading-upload/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ surveyNumber: deleteSurveyNumber.trim(), confirm: deleteConfirmText.trim() }),
      });
      const json = (await res.json()) as DeletePreviewResponse;
      if (!json.ok) {
        setDeleteError(json.error ?? "Something went wrong.");
        return;
      }
      setDeleteResult(json);
      setDeletePreview(null);
      setDeleteConfirmText("");
    } catch (e) {
      setDeleteError((e as Error).message);
    } finally {
      setDeleteLoading(false);
    }
  }

  function exportErrorsCsv() {
    if (!result?.errors?.length) return;
    const lines = ["Row,Reason", ...result.errors.map((e) => `${e.row},"${e.message.replace(/"/g, '""')}"`)];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "survey-heading-errors.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <p className="text-xs uppercase tracking-[0.15em] text-ad-steel">AusDilaps · Field Tools</p>
      <h1 className="mt-1 text-3xl font-semibold text-ad-ink">Survey Heading Uploader</h1>
      <p className="mt-2 max-w-2xl text-ad-muted">
        Upload the CSV export from the Survey Heading macro straight into Salesforce — no more copying
        rows by hand.
      </p>

      <div className="mt-8 rounded-xl border border-ad-border bg-white p-5">
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInput.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            const f = e.dataTransfer.files?.[0];
            if (f && (f.name.endsWith(".csv") || f.type === "text/csv")) chooseFile(f);
            else setError("That doesn't look like a CSV file.");
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors",
            dragActive ? "border-ad-orange bg-ad-orange/10" : "border-ad-border hover:bg-ad-surface"
          )}
        >
          <input
            ref={fileInput}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => chooseFile(e.target.files?.[0] ?? null)}
          />
          <p className="font-medium text-ad-ink">
            {file ? file.name : dragActive ? "Drop it here" : "Drag & drop the CSV export here"}
          </p>
          <p className="text-sm text-ad-muted">{file ? "Click to choose a different file" : "or click to browse"}</p>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ad-muted">
            Survey Document ID
          </label>
          <input
            value={surveyNumber}
            onChange={(e) => setSurveyNumber(e.target.value)}
            placeholder="e.g. 25824-00031076-01"
            className="w-full max-w-xs rounded-lg border border-ad-border p-2.5 text-sm text-ad-ink outline-none focus:border-ad-steel"
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            className={cn(buttonVariants({ variant: "accent", size: "md" }), loading && "opacity-60")}
            onClick={upload}
            disabled={loading}
          >
            {loading ? "Uploading…" : "Upload"}
          </button>
          {error && <span className="text-sm text-ad-orange">{error}</span>}
        </div>
      </div>

      {result?.ok && (
        <div className="mt-8 rounded-xl border border-ad-border bg-white p-5">
          <p className="text-sm text-ad-muted">
            Survey: <span className="font-medium text-ad-ink">{result.surveyName}</span>
          </p>
          <div className="mt-2 flex gap-6">
            <div>
              <p className="text-2xl font-semibold text-ad-ink">{result.created}</p>
              <p className="text-xs uppercase tracking-wide text-ad-muted">Created</p>
            </div>
            <div>
              <p className={cn("text-2xl font-semibold", result.errors?.length ? "text-ad-orange" : "text-ad-ink")}>
                {result.errors?.length ?? 0}
              </p>
              <p className="text-xs uppercase tracking-wide text-ad-muted">Errors</p>
            </div>
          </div>
        </div>
      )}

      {result?.errors && result.errors.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-ad-ink">Row errors</p>
            <button className={cn(buttonVariants({ variant: "outline", size: "sm" }))} onClick={exportErrorsCsv}>
              Export as CSV
            </button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-ad-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-ad-surface text-left text-ad-muted">
                  <th className="px-3 py-2 font-medium">Row</th>
                  <th className="px-3 py-2 font-medium">Reason</th>
                </tr>
              </thead>
              <tbody>
                {result.errors.map((e, i) => (
                  <tr key={i} className="border-t border-ad-border">
                    <td className="px-3 py-2 text-ad-ink">{e.row}</td>
                    <td className="px-3 py-2 text-ad-muted">{e.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="mt-12 border-t border-ad-border pt-6">
        <button
          className="text-sm font-medium text-destructive hover:underline"
          onClick={() => setDangerOpen((v) => !v)}
        >
          {dangerOpen ? "Hide" : "Bulk Delete Survey Headings"}
        </button>

        {dangerOpen && (
          <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/5 p-5">
            <p className="text-sm font-semibold text-destructive">Delete all Survey Headings</p>
            <p className="mt-1 max-w-xl text-sm text-ad-muted">
              Permanently deletes every Survey Heading on a Survey. This cannot be undone from this tool —
              only use it to redo a botched upload.
            </p>

            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ad-muted">
                Survey Document ID
              </label>
              <input
                value={deleteSurveyNumber}
                onChange={(e) => {
                  setDeleteSurveyNumber(e.target.value);
                  setDeletePreview(null);
                  setDeleteResult(null);
                  setDeleteConfirmText("");
                }}
                placeholder="e.g. 25824-00031076-01"
                className="w-full max-w-xs rounded-lg border border-ad-border p-2.5 text-sm text-ad-ink outline-none focus:border-destructive"
              />
            </div>

            <div className="mt-3 flex items-center gap-3">
              <button
                className={cn(
                  "rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10",
                  deleteLoading && "opacity-60"
                )}
                onClick={checkExistingHeadings}
                disabled={deleteLoading}
              >
                {deleteLoading && !deletePreview ? "Checking…" : "Check existing headings"}
              </button>
              {deleteError && <span className="text-sm text-destructive">{deleteError}</span>}
            </div>

            {deletePreview?.preview && (
              <div className="mt-4 rounded-lg border border-destructive/40 bg-white p-4">
                <p className="text-sm text-ad-ink">
                  <span className="font-medium">{deletePreview.surveyName}</span> has{" "}
                  <span className="font-semibold text-destructive">{deletePreview.count}</span> existing
                  heading{deletePreview.count === 1 ? "" : "s"}.
                </p>
                {deletePreview.count === 0 ? (
                  <p className="mt-1 text-sm text-ad-muted">Nothing to delete.</p>
                ) : (
                  <>
                    <label className="mt-3 mb-1 block text-xs font-medium uppercase tracking-wide text-ad-muted">
                      Type the Survey Document ID to confirm
                    </label>
                    <input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder={deleteSurveyNumber.trim()}
                      className="w-full max-w-xs rounded-lg border border-ad-border p-2.5 text-sm text-ad-ink outline-none focus:border-destructive"
                    />
                    <div className="mt-3">
                      <button
                        className={cn(
                          "rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white transition-opacity",
                          (deleteLoading || deleteConfirmText.trim() !== deleteSurveyNumber.trim()) &&
                            "cursor-not-allowed opacity-50"
                        )}
                        onClick={confirmDelete}
                        disabled={deleteLoading || deleteConfirmText.trim() !== deleteSurveyNumber.trim()}
                      >
                        {deleteLoading ? "Deleting…" : `Delete ${deletePreview.count} heading${deletePreview.count === 1 ? "" : "s"}`}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {deleteResult && (
              <p className="mt-4 text-sm text-ad-ink">
                Deleted <span className="font-semibold">{deleteResult.deleted}</span> heading
                {deleteResult.deleted === 1 ? "" : "s"} from{" "}
                <span className="font-medium">{deleteResult.surveyName}</span>.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
