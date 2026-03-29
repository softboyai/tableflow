"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type AdminQrPreviewProps = {
  url: string;
  restaurantName: string;
};

export default function AdminQrPreview({
  url,
  restaurantName
}: AdminQrPreviewProps) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let cancelled = false;

    void QRCode.toDataURL(url, {
      width: 220,
      margin: 4,
      color: {
        dark: "#000000",
        light: "#ffffff"
      }
    }).then((dataUrl) => {
      if (!cancelled) {
        setSrc(dataUrl);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="rounded-[18px] border border-white/10 bg-white px-4 py-4 text-center text-ink">
      {src ? (
        <img
          src={src}
          alt={`QR code for ${restaurantName}`}
          className="mx-auto h-[220px] w-[220px] rounded-xl"
        />
      ) : (
        <div className="mx-auto flex h-[220px] w-[220px] items-center justify-center rounded-xl border border-ink/10 bg-ink/5 text-sm text-ink/50">
          Generating QR...
        </div>
      )}
      <p className="mt-3 text-xs text-ink/55">{url}</p>
    </div>
  );
}
