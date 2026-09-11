export interface Project {
  slug: string;
  title: string;
  client: string;
  category: string;
  year: string;
  description: string;
  metric: string;
  metricLabel: string;
  accent: string;
  layout: "landscape" | "portrait" | "full" | "split";
  tags: string[];
}

export const PROJECTS: Project[] = [
  {
    slug: "alibaba-growth",
    title: "Alibaba",
    client: "Alibaba Group",
    category: "Brand · Campaign · Digital",
    year: "2025",
    description:
      "A full-funnel brand and campaign system built to turn global attention into measurable demand.",
    metric: "1.99B+",
    metricLabel: "Impressions",
    accent: "#891FFB",
    layout: "landscape",
    tags: ["Branding", "Campaign", "Web UI/UX"],
  },
  {
    slug: "janitorial-leads-pro",
    title: "Janitorial Leads Pro",
    client: "JLP · B2B SaaS",
    category: "Software UI/UX · Growth",
    year: "2025",
    description:
      "CRM-first lead platform with conversion-obsessed UX — from landing to pipeline in three clicks.",
    metric: "5,000+",
    metricLabel: "B2B Leads Generated",
    accent: "#507AF4",
    layout: "portrait",
    tags: ["SaaS UI/UX", "Web UI/UX"],
  },
  {
    slug: "nova-fintech",
    title: "Nova Bank",
    client: "Nova Financial",
    category: "Mobile App · Design System",
    year: "2024",
    description:
      "A mobile banking experience rebuilt around clarity — onboarding to transfer in under 40 seconds.",
    metric: "+212%",
    metricLabel: "Activation Rate",
    accent: "#1BE2EB",
    layout: "full",
    tags: ["Mobile App UI/UX", "Design System"],
  },
  {
    slug: "atelier-noir",
    title: "Atelier Noir",
    client: "Atelier Noir",
    category: "Branding · Web UI/UX",
    year: "2024",
    description:
      "Editorial luxury identity with a cinematic commerce site — restraint, rhythm, and revenue.",
    metric: "3.1x",
    metricLabel: "Revenue Growth",
    accent: "#891FFB",
    layout: "split",
    tags: ["Branding", "Web UI/UX"],
  },
];
