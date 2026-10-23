// Site-wide settings. Fill the two TODO links before launch; the build warns while they're empty.
export const SITE = {
  origin: "https://naturable.app",
  name: "Naturable",
  // Public naturable-rules repository (rules/README/Skill). Empty = links point to the rules page on this site.
  githubUrl: "https://github.com/GUCCI-atlasv/naturable-rules",
  // TODO: Chrome Web Store listing. Empty = "Add to Chrome" points to /en/chrome-extension/ (shows "coming soon").
  chromeStoreUrl: "",
  contactEmail: "privacy@naturable.app",
};

export const githubHref = () => SITE.githubUrl || "/en/how-it-works/#rules";
export const githubFileHref = (path) => (SITE.githubUrl ? `${SITE.githubUrl}/blob/main/${path}` : `/${path}`);
export const chromeHref = () => SITE.chromeStoreUrl || "/en/chrome-extension/";
