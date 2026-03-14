const themeScript = `
(() => {
  const storageKey = "next-editor-demo-theme";
  const root = document.documentElement;
  const stored = localStorage.getItem(storageKey);
  const theme = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
  root.dataset.theme = theme;
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
