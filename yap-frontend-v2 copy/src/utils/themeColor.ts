// Allows us to set the colour of hte bg dyamically since we render components conditionally
// And setting the bg around the notch was causing issues before this was added
export function setThemeColor(color: string) {
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', color);
}

export const themeColors = {
  secondary: '#2F1A1B',
  backgroundPrimary: '#F0EBE1',
};
