"use client";

import { useState } from "react";
import Script from "next/script";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FormValues = {
  name: string;
  email: string;
  phone: string;
  role: string;
  company: string;
  projectName: string;
  projectLocation: string;
  adjoiningCount: string;
  requiredStart: string;
  daConditionRef: string;
  notes: string;
  company_website: string; // honeypot
};

const inputCls =
  "mt-1.5 w-full rounded-md border border-ad-border bg-white px-4 py-2.5 text-[0.95rem] text-ad-ink placeholder:text-ad-muted/60 focus:border-ad-accent focus:outline-none focus:ring-2 focus:ring-ad-accent/30";
const labelCls = "block text-sm font-medium text-ad-ink";

export function QuoteForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [serverError, setServerError] = useState("");

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  async function onSubmit(values: FormValues) {
    setStatus("idle");
    setServerError("");
    const turnstileToken =
      (document.querySelector('[name="cf-turnstile-response"]') as HTMLInputElement | null)?.value ?? "";
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          turnstileToken,
          sourcePage: typeof window !== "undefined" ? window.location.pathname : "",
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus("success");
        reset();
      } else {
        setStatus("error");
        setServerError(data.error ?? "Something went wrong. Please try again or call us.");
      }
    } catch {
      setStatus("error");
      setServerError("Network error. Please try again or call us on 1800 345 277.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-ad-border bg-white p-8 text-center">
        <div className="rule-accent mx-auto mb-5 w-12" />
        <h3 className="font-heading text-2xl font-semibold text-ad-ink">Request received.</h3>
        <p className="mx-auto mt-3 max-w-md text-ad-muted">
          Thanks — we&apos;ve got your project details and will scope it and come back to you,
          typically within 48 hours. If it&apos;s urgent, call us on{" "}
          <a href="tel:1800345277" className="font-medium text-ad-accent">
            1800 345 277
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-ad-border bg-white p-6 sm:p-8">
      {/* Honeypot — hidden from users, catches bots */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px]" tabIndex={-1}>
        <label>
          Company website
          <input type="text" tabIndex={-1} autoComplete="off" {...register("company_website")} />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="name">
            Name <span className="text-ad-orange">*</span>
          </label>
          <input
            id="name"
            className={cn(inputCls, errors.name && "border-ad-orange")}
            {...register("name", { required: "Please enter your name" })}
          />
          {errors.name && <p className="mt-1 text-xs text-ad-orange">{errors.name.message}</p>}
        </div>
        <div>
          <label className={labelCls} htmlFor="email">
            Email <span className="text-ad-orange">*</span>
          </label>
          <input
            id="email"
            type="email"
            className={cn(inputCls, errors.email && "border-ad-orange")}
            {...register("email", {
              required: "Enter your email",
              pattern: { value: /.+@.+\..+/, message: "Enter a valid email address" },
            })}
          />
          {errors.email && <p className="mt-1 text-xs text-ad-orange">{errors.email.message}</p>}
        </div>
        <div>
          <label className={labelCls} htmlFor="phone">
            Phone
          </label>
          <input id="phone" type="tel" className={inputCls} {...register("phone")} />
        </div>
        <div>
          <label className={labelCls} htmlFor="role">
            Your role
          </label>
          <input
            id="role"
            placeholder="e.g. Contracts Administrator"
            className={inputCls}
            {...register("role")}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="company">
            Company
          </label>
          <input id="company" className={inputCls} {...register("company")} />
        </div>
        <div>
          <label className={labelCls} htmlFor="projectName">
            Project name
          </label>
          <input id="projectName" className={inputCls} {...register("projectName")} />
        </div>
        <div>
          <label className={labelCls} htmlFor="projectLocation">
            Project location
          </label>
          <input
            id="projectLocation"
            placeholder="Suburb / city / state"
            className={inputCls}
            {...register("projectLocation")}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="adjoiningCount">
            Adjoining properties
          </label>
          <input
            id="adjoiningCount"
            type="number"
            min={0}
            placeholder="Approx. number"
            className={inputCls}
            {...register("adjoiningCount")}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="requiredStart">
            Required start date
          </label>
          <input id="requiredStart" type="date" className={inputCls} {...register("requiredStart")} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="daConditionRef">
            DA condition / contract clause reference
          </label>
          <input
            id="daConditionRef"
            placeholder="If your consent or contract requires a dilapidation report"
            className={inputCls}
            {...register("daConditionRef")}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="notes">
            Project notes
          </label>
          <textarea id="notes" rows={4} className={inputCls} {...register("notes")} />
        </div>
      </div>

      {siteKey && (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
          <div className="cf-turnstile mt-5" data-sitekey={siteKey} />
        </>
      )}

      {status === "error" && (
        <p className="mt-5 rounded-md border border-ad-orange/40 bg-ad-orange/5 px-4 py-3 text-sm text-ad-orange">
          {serverError}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" variant="accent" className={cn(isSubmitting && "opacity-70")}>
          {isSubmitting ? "Sending…" : "Request a Quote"}
        </Button>
        <p className="text-xs text-ad-muted">
          We&apos;ll scope your project and reply within 48 hours.
        </p>
      </div>
    </form>
  );
}
