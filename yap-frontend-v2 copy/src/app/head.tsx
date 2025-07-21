// This file is used to define the HTML head for the application, including metadata and links to favicons and manifest files.
// We can do it dynamically by using a manifest.ts file in the app directory but this is a simpler approach.

export default function Head() {
  return (
    <>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, viewport-fit=cover"
      />

      <link rel="manifest" href="/manifest.json" />

      {/* Favicons */}
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/icons/favicon-16x16.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/icons/favicon-32x32.png"
      />
      <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

      {/* Android PWA icons */}
      <link
        rel="icon"
        type="image/png"
        sizes="192x192"
        href="/icons/android-chrome-192x192.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="512x512"
        href="/icons/android-chrome-512x512.png"
      />

      <meta name="theme-color" content="#000000" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
    </>
  );
}
