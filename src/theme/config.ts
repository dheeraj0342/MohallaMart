import type { ThemeTokens, TypographyScale, ThemeMode } from "./types";

export const tokens: ThemeTokens = {
  background: "var(--background)",
  foreground: "var(--foreground)",
  card: "var(--card)",
  cardForeground: "var(--card-foreground)",
  popover: "var(--popover)",
  popoverForeground: "var(--popover-foreground)",
  primary: "var(--primary)",
  primaryForeground: "var(--primary-foreground)",
  secondary: "var(--secondary)",
  secondaryForeground: "var(--secondary-foreground)",
  muted: "var(--muted)",
  mutedForeground: "var(--muted-foreground)",
  accent: "var(--accent)",
  accentForeground: "var(--accent-foreground)",
  destructive: "var(--destructive)",
  destructiveForeground: "var(--destructive-foreground)",
  border: "var(--border)",
  input: "var(--input)",
  ring: "var(--ring)",
  radius: "var(--radius)",
  sidebar: "var(--sidebar)",
  sidebarForeground: "var(--sidebar-foreground)",
  sidebarPrimary: "var(--sidebar-primary)",
  sidebarPrimaryForeground: "var(--sidebar-primary-foreground)",
  sidebarAccent: "var(--sidebar-accent)",
  sidebarAccentForeground: "var(--sidebar-accent-foreground)",
  sidebarBorder: "var(--sidebar-border)",
  sidebarRing: "var(--sidebar-ring)",
  link: "var(--link)",
  linkHover: "var(--link-hover)",
  chart1: "var(--chart-1)",
  chart2: "var(--chart-2)",
  chart3: "var(--chart-3)",
  chart4: "var(--chart-4)",
  chart5: "var(--chart-5)",
};

export const typography: TypographyScale = {
  h1: "text-4xl md:text-5xl font-bold",
  h2: "text-3xl md:text-4xl font-bold",
  h3: "text-2xl md:text-3xl font-semibold",
  h4: "text-xl md:text-2xl font-semibold",
  h5: "text-lg font-medium",
  h6: "text-base font-medium",
  body: "text-base leading-relaxed",
  caption: "text-sm text-muted-foreground",
};

export const getSystemPrefersDark = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
};

export const applyTheme = (mode: ThemeMode): void => {
  const html = document.documentElement;
  if (mode === "system") {
    const prefersDark = getSystemPrefersDark();
    html.classList.toggle("dark", prefersDark);
    localStorage.setItem("theme", prefersDark ? "dark" : "light");
    return;
  }
  html.classList.toggle("dark", mode === "dark");
  localStorage.setItem("theme", mode);
};
