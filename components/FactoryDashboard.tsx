"use client";

import {
  Activity,
  ArrowDownToLine,
  Blocks,
  CheckCircle2,
  ClipboardList,
  FileCode2,
  Gauge,
  Loader2,
  Radar,
  Rocket,
  Search
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { FactoryRun } from "@/lib/types";

type Tab = "patterns" | "plan" | "qa";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "patterns", label: "Patterns" },
  { id: "plan", label: "Plan" },
  { id: "qa", label: "QA" }
];

export function FactoryDashboard() {
  const [url, setUrl] = useState("https://linear.app");
  const [industry, setIndustry] = useState("AI SaaS");
  const [targetAudience, setTargetAudience] = useState("startup founders");
  const [style, setStyle] = useState("minimal dark");
  const [activeTab, setActiveTab] = useState<Tab>("patterns");
  const [result, setResult] = useState<FactoryRun | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");

  const payload = useMemo(
    () => ({
      url,
      industry,
      targetAudience,
      style
    }),
    [industry, style, targetAudience, url]
  );

  async function runAnalysis() {
    setIsRunning(true);
    setError("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analysis failed");
    } finally {
      setIsRunning(false);
    }
  }

  async function exportProject() {
    const response = await fetch("/api/export", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const blob = await response.blob();
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `${result?.project.repoName || "generated-project"}.json`;
    link.click();
    URL.revokeObjectURL(href);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <Image
            className="brand-logo"
            src="/ai-website-factory-mark.svg"
            alt="AI Website Factory"
            width={96}
            height={96}
            priority
          />
        </div>
        <div className="status-pill">
          <Activity size={16} />
          MVP pipeline online
        </div>
      </header>

      <section className="hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Analyzer + planner + generator + QA</span>
          <h1>Turn a high-performing site into an original deployable project.</h1>
          <p>
            Enter a URL, extract conversion patterns, generate a new brand and site plan, then export a
            Next.js project manifest that can be committed and deployed.
          </p>
        </div>

        <form
          className="control-panel"
          onSubmit={(event) => {
            event.preventDefault();
            void runAnalysis();
          }}
        >
          <div className="field-grid">
            <div className="field">
              <label htmlFor="url">Source URL</label>
              <input id="url" value={url} onChange={(event) => setUrl(event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="industry">Industry</label>
              <input id="industry" value={industry} onChange={(event) => setIndustry(event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="audience">Target audience</label>
              <input
                id="audience"
                value={targetAudience}
                onChange={(event) => setTargetAudience(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="style">Style direction</label>
              <input id="style" value={style} onChange={(event) => setStyle(event.target.value)} />
            </div>
          </div>
          <div className="action-row">
            <button className="button button-primary" type="submit" disabled={isRunning}>
              {isRunning ? <Loader2 size={18} /> : <Search size={18} />}
              Analyze
            </button>
            <button className="button button-secondary" type="button" onClick={exportProject} disabled={!result}>
              <ArrowDownToLine size={18} />
              Export
            </button>
          </div>
          {error ? <p className="error">{error}</p> : null}
        </form>
      </section>

      <section className="dashboard-grid">
        <div className="result-panel">
          <div className="tabs">
            {tabs.map((tab) => (
              <button
                className={`tab ${activeTab === tab.id ? "tab-active" : ""}`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          {!result ? (
            <div className="empty-state">
              Run an analysis to see extracted patterns, the generated brand plan, QA checks, and project files.
            </div>
          ) : (
            <ResultView activeTab={activeTab} result={result} />
          )}
        </div>

        <aside className="code-panel">
          <h2 className="section-title">
            <FileCode2 size={20} />
            Project export
          </h2>
          {result ? (
            <>
              <p className="muted">{result.project.repoName}</p>
              <div className="file-list">
                {result.project.files.map((file) => (
                  <div className="file-item" key={file.path}>
                    <span className="file-path">{file.path}</span>
                    <CheckCircle2 color="var(--teal)" size={17} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="muted">Generated files appear here after analysis.</p>
          )}
        </aside>
      </section>
    </main>
  );
}

function ResultView({ activeTab, result }: { activeTab: Tab; result: FactoryRun }) {
  if (activeTab === "patterns") {
    return (
      <>
        <h2 className="section-title">
          <Radar size={20} />
          Structural analysis
        </h2>
        <div className="pattern-grid">
          <Pattern label="Hero" value={result.patterns.heroType} />
          <Pattern label="CTA" value={result.patterns.ctaPosition} />
          <Pattern label="Navigation" value={result.patterns.navigationStyle} />
          <Pattern label="Pricing" value={result.patterns.pricingStructure} />
        </div>
        <h3 className="section-title">
          <Blocks size={18} />
          Section flow
        </h3>
        <div className="flow">
          {result.patterns.sectionFlow.map((section) => (
            <div className="flow-step" key={section}>
              <span>{section}</span>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (activeTab === "plan") {
    return (
      <>
        <h2 className="section-title">
          <ClipboardList size={20} />
          Generated site plan
        </h2>
        <div className="plan-grid">
          <Plan label="Brand" value={result.plan.brandName} />
          <Plan label="Headline" value={result.plan.headline} />
          <Plan label="Differentiator" value={result.plan.differentiator} />
          {result.plan.siteStructure.map((section) => (
            <Plan key={section.id} label={section.title} value={section.purpose} />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="section-title">
        <Gauge size={20} />
        Automated QA
      </h2>
      <div className="qa-list">
        {result.qa.checks.map((check) => (
          <div className="qa-row" key={check.name}>
            <span>{check.status.toUpperCase()}</span>
            <strong>{check.name}</strong>
            <p className="muted">{check.detail}</p>
          </div>
        ))}
      </div>
      <div className="action-row">
        <span className="status-pill">
          <Rocket size={16} />
          {result.qa.passed ? "Ready for deploy step" : "Needs review"}
        </span>
      </div>
    </>
  );
}

function Pattern({ label, value }: { label: string; value: string }) {
  return (
    <article className="pattern-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Plan({ label, value }: { label: string; value: string }) {
  return (
    <article className="plan-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
