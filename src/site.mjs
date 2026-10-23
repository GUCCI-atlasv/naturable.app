// Site-wide settings. Fill the two TODO links before launch; the build warns while they're empty.
export const SITE = {
  origin: "https://naturable.app",
  name: "Naturable",
  // Public naturable-rules repository (rules/README/Skill). Empty = links point to the rules page on this site.
  githubUrl: "https://github.com/GUCCI-atlasv/naturable-rules",
  // TODO: Chrome Web Store listing. Empty = "Add to Chrome" points to /en/chrome-extension/ (shows "coming soon").
  chromeStoreUrl: "",
  contactEmail: "privacy@naturable.app",
  // Set to true once naturable-rules is on npm; until then the CLI runs straight from the GitHub repo.
  npmPublished: false,
};

export const githubHref = () => SITE.githubUrl || "/en/how-it-works/#rules";
export const githubFileHref = (path) => (SITE.githubUrl ? `${SITE.githubUrl}/blob/main/${path}` : `/${path}`);
export const chromeHref = () => SITE.chromeStoreUrl || "/en/chrome-extension/";

/** CLI invocation shown on the site. Its only bin is naturable-check, so npx runs it from the package name. */
export const cliCmd = (args) => `npx ${SITE.npmPublished ? "naturable-rules" : "github:GUCCI-atlasv/naturable-rules"} ${args}`;
/** Label for Chrome CTAs: an install promise only once the store listing exists. */
export const chromeLabel = () => (SITE.chromeStoreUrl ? "Add to Chrome" : "Chrome extension (coming soon)");
