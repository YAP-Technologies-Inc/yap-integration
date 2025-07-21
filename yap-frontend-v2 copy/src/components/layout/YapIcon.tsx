// YapIcon.tsx
// This component renders the YAP logo icon used in the app header and other places.

import yapLogo from "@/assets/YAP.png";

export default function YapIcon() {
  return (
    <img
      src={yapLogo.src}
      alt="YAP Logo"
      className="h-10 w-auto mx-auto"
    />
  );
}
