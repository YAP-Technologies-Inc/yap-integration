// YapIcon.tsx
// This component renders the YAP logo icon used in the app header and other places.

import yapLogo from "@/assets/YAP.webp";
import Image from "next/image";
export default function YapIcon() {
  return (
    <Image
      src={yapLogo}
      alt="YAP Logo"
      className="h-10 w-auto mx-auto"
      width={40}
      height={40}
      loading="lazy"
      decoding="async"
      style={{ display: "block" }}
    />
  );
}
