export type SiteInput = {
  url: string;
  industry?: string;
  targetAudience?: string;
  style?: string;
};

export type SiteSnapshot = {
  url: string;
  title: string;
  industry: string;
  colors: string[];
  sections: string[];
  ctaStyle: string;
  fonts: string[];
  layoutType: string;
  headings: string[];
  screenshotUrl?: string;
};

export type PatternAnalysis = {
  heroType: string;
  ctaPosition: string;
  sectionFlow: string[];
  navigationStyle: string;
  testimonialPattern: string;
  pricingStructure: string;
  footerDesign: string;
  animations: string[];
  visualRhythm: string;
};

export type SitePlan = {
  brandName: string;
  headline: string;
  subheadline: string;
  tone: string;
  targetAudience: string;
  industry: string;
  differentiator: string;
  siteStructure: Array<{
    id: string;
    title: string;
    purpose: string;
    content: string[];
  }>;
  palette: string[];
};

export type GeneratedProject = {
  repoName: string;
  files: Array<{
    path: string;
    content: string;
  }>;
};

export type FactoryRun = {
  snapshot: SiteSnapshot;
  patterns: PatternAnalysis;
  plan: SitePlan;
  project: GeneratedProject;
  qa: {
    passed: boolean;
    checks: Array<{
      name: string;
      status: "pass" | "warn" | "fail";
      detail: string;
    }>;
  };
};
