import { z } from "zod";
import type { FactoryRun, PatternAnalysis, SiteInput, SitePlan, SiteSnapshot } from "@/lib/types";
import { generateProject } from "@/lib/site-generator";

const inputSchema = z.object({
  url: z.string().url(),
  industry: z.string().optional(),
  targetAudience: z.string().optional(),
  style: z.string().optional()
});

const colorPattern = /#(?:[0-9a-fA-F]{3}){1,2}\b|rgb\([^)]+\)|hsl\([^)]+\)/g;
const ctaWords = ["start", "try", "book", "demo", "signup", "sign up", "get started", "join", "buy", "contact"];
const sectionSignals = ["hero", "features", "pricing", "testimonials", "faq", "integrations", "security", "footer"];

export async function runFactory(input: SiteInput): Promise<FactoryRun> {
  const parsed = inputSchema.parse(input);
  const snapshot = await analyzeSourceWebsite(parsed);
  const patterns = extractPatterns(snapshot);
  const plan = createSitePlan(parsed, snapshot, patterns);
  const project = generateProject(plan, patterns);
  const qa = runQa(snapshot, patterns, plan, project);

  return {
    snapshot,
    patterns,
    plan,
    project,
    qa
  };
}

async function analyzeSourceWebsite(input: SiteInput): Promise<SiteSnapshot> {
  const fallbackTitle = domainToTitle(input.url);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(input.url, {
      signal: controller.signal,
      headers: {
        "user-agent": "AI Website Factory MVP"
      }
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Fetch failed with ${response.status}`);
    }

    const html = await response.text();
    const title = extractTag(html, "title") || extractMeta(html, "og:title") || fallbackTitle;
    const headings = extractHeadings(html);
    const colors = unique((html.match(colorPattern) || []).slice(0, 8));
    const sections = inferSections(html, headings);
    const fonts = inferFonts(html);

    return {
      url: input.url,
      title,
      industry: input.industry || inferIndustry(title, headings),
      colors: colors.length ? colors : ["#101828", "#16a34a", "#f59e0b"],
      sections,
      ctaStyle: inferCtaStyle(html),
      fonts,
      layoutType: inferLayoutType(html, sections),
      headings
    };
  } catch {
    return {
      url: input.url,
      title: fallbackTitle,
      industry: input.industry || "AI SaaS",
      colors: ["#111827", "#10b981", "#f97316"],
      sections: ["hero", "social_proof", "features", "pricing", "faq", "footer"],
      ctaStyle: "prominent primary button above the fold",
      fonts: ["system-ui"],
      layoutType: "conversion-focused SaaS landing page",
      headings: [fallbackTitle, "Features", "Pricing", "Customer stories"]
    };
  }
}

function extractPatterns(snapshot: SiteSnapshot): PatternAnalysis {
  const hasPricing = snapshot.sections.includes("pricing");
  const hasTestimonials = snapshot.sections.includes("testimonials") || snapshot.sections.includes("social_proof");

  return {
    heroType: snapshot.layoutType.includes("split") ? "split_saas" : "centered_saas",
    ctaPosition: snapshot.ctaStyle.includes("above") ? "above_fold" : "repeated_inline",
    sectionFlow: normalizeFlow(snapshot.sections),
    navigationStyle: snapshot.sections.includes("pricing") ? "sticky product nav with pricing CTA" : "simple brand nav",
    testimonialPattern: hasTestimonials ? "logo strip plus concise proof quotes" : "metric-led trust band",
    pricingStructure: hasPricing ? "three-tier SaaS cards" : "single conversion plan with enterprise CTA",
    footerDesign: "compact footer with product, company, and legal links",
    animations: ["subtle reveal on scroll", "button hover lift", "metric count emphasis"],
    visualRhythm: snapshot.layoutType.includes("dense") ? "compact alternating bands" : "spacious bands with strong CTA repetition"
  };
}

function createSitePlan(input: SiteInput, snapshot: SiteSnapshot, patterns: PatternAnalysis): SitePlan {
  const industry = input.industry || snapshot.industry;
  const audience = input.targetAudience || "startup founders";
  const brandName = makeBrandName(industry, snapshot.title);

  return {
    brandName,
    headline: `Launch sharper ${industry.toLowerCase()} websites before the market moves`,
    subheadline:
      "An automated production pipeline that turns market signals into original, conversion-ready sites with QA and deployment built in.",
    tone: input.style || "modern, focused, confident",
    targetAudience: audience,
    industry,
    differentiator: "Pattern intelligence plus daily shipping, not generic page generation.",
    palette: ["#121212", "#f5f1e8", "#14b8a6", "#f97316", "#eab308"],
    siteStructure: [
      {
        id: "hero",
        title: "Signal-led website generation",
        purpose: "Make the offer obvious and conversion-oriented above the fold.",
        content: [patterns.heroType, "Primary CTA", "Proof metric", "Generated site preview"]
      },
      {
        id: "proof",
        title: "Pattern intelligence",
        purpose: "Show that the system learns structure without copying source code.",
        content: ["Trend scanner", "Structural extractor", "Conversion pattern library"]
      },
      {
        id: "workflow",
        title: "Daily production loop",
        purpose: "Explain the automated flow from URL or trend to deployment.",
        content: ["Analyze", "Plan", "Generate", "QA", "Deploy"]
      },
      {
        id: "pricing",
        title: "Plans for repeatable output",
        purpose: "Give the generated brand a monetizable conversion section.",
        content: ["Starter", "Growth", "Factory"]
      },
      {
        id: "faq",
        title: "Practical questions",
        purpose: "Handle objections about originality, QA, and deployment.",
        content: ["Does it copy sites?", "Can it deploy automatically?", "How is quality checked?"]
      }
    ]
  };
}

function runQa(
  snapshot: SiteSnapshot,
  patterns: PatternAnalysis,
  plan: SitePlan,
  project: FactoryRun["project"]
): FactoryRun["qa"] {
  const checks = [
    {
      name: "Source analysis",
      status: snapshot.title ? "pass" as const : "fail" as const,
      detail: snapshot.title ? `Captured ${snapshot.sections.length} structural signals.` : "No title or structure captured."
    },
    {
      name: "Originality",
      status: plan.brandName !== snapshot.title ? "pass" as const : "warn" as const,
      detail: "Generated a new brand, headline, palette, and content structure."
    },
    {
      name: "Conversion flow",
      status: patterns.sectionFlow.includes("hero") && patterns.sectionFlow.includes("pricing") ? "pass" as const : "warn" as const,
      detail: `Flow: ${patterns.sectionFlow.join(" -> ")}`
    },
    {
      name: "Exportable project",
      status: project.files.length >= 5 ? "pass" as const : "fail" as const,
      detail: `${project.files.length} files ready for a Next.js export.`
    }
  ];

  return {
    passed: checks.every((check) => check.status !== "fail"),
    checks
  };
}

function extractTag(html: string, tag: string) {
  return html.match(new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, "is"))?.[1]?.trim().replace(/\s+/g, " ");
}

function extractMeta(html: string, property: string) {
  const pattern = new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, "i");
  return html.match(pattern)?.[1]?.trim();
}

function extractHeadings(html: string) {
  const headings = [...html.matchAll(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gis)]
    .map((match) => stripTags(match[1]).trim())
    .filter(Boolean)
    .slice(0, 12);
  return headings.length ? headings : ["Hero", "Features", "Pricing"];
}

function inferSections(html: string, headings: string[]) {
  const source = `${html} ${headings.join(" ")}`.toLowerCase();
  const found = sectionSignals.filter((signal) => source.includes(signal));

  if (source.includes("customer") || source.includes("trusted by") || source.includes("testimonial")) {
    found.push("social_proof");
  }

  return normalizeFlow(found.length ? unique(found) : ["hero", "features", "pricing", "faq", "footer"]);
}

function inferFonts(html: string) {
  const fontMatches = [...html.matchAll(/font-family:\s*([^;"'}]+)/gi)].map((match) => match[1].trim());
  return unique(fontMatches).slice(0, 4).length ? unique(fontMatches).slice(0, 4) : ["system-ui"];
}

function inferCtaStyle(html: string) {
  const lower = html.toLowerCase();
  const hasCta = ctaWords.some((word) => lower.includes(word));
  const hasButton = lower.includes("<button") || lower.includes("btn") || lower.includes("button");
  if (hasCta && hasButton) return "prominent primary button above the fold";
  if (hasCta) return "text-led CTA links repeated through page";
  return "soft CTA with limited urgency";
}

function inferLayoutType(html: string, sections: string[]) {
  const lower = html.toLowerCase();
  if (lower.includes("grid") && lower.includes("hero")) return "split conversion layout";
  if (sections.length > 6) return "dense editorial SaaS layout";
  return "centered conversion landing page";
}

function inferIndustry(title: string, headings: string[]) {
  const text = `${title} ${headings.join(" ")}`.toLowerCase();
  if (text.includes("ai")) return "AI SaaS";
  if (text.includes("finance") || text.includes("bank")) return "Fintech";
  if (text.includes("health")) return "Healthtech";
  if (text.includes("design")) return "Design software";
  return "B2B SaaS";
}

function normalizeFlow(sections: string[]) {
  const preferred = ["hero", "social_proof", "features", "workflow", "pricing", "faq", "footer"];
  const normalized = unique(["hero", ...sections.map((section) => section.replace("testimonials", "social_proof"))]);
  return preferred.filter((section) => normalized.includes(section));
}

function makeBrandName(industry: string, title: string) {
  const cleanIndustry = industry.replace(/[^a-z]/gi, "");
  const seed = cleanIndustry || title.replace(/[^a-z]/gi, "") || "Signal";
  return `${seed.slice(0, 5)}Forge`;
}

function domainToTitle(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host.split(".")[0].replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  } catch {
    return "Source Website";
  }
}

function stripTags(value: string) {
  return value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ");
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}
