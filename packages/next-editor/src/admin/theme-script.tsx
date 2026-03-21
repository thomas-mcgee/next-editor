const themeScript = `
(() => {
  const key = "ne-admin-theme";
  const root = document.documentElement;
  const stored = localStorage.getItem(key);
  const theme = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
  root.dataset.neTheme = theme;
})();
`;

export function NeThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
