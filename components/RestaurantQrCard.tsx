"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

type RestaurantQrCardProps = {
  restaurantName: string;
  guestUrl: string;
};

export default function RestaurantQrCard({
  restaurantName,
  guestUrl
}: RestaurantQrCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copy Link");
  const isLocalOnlyUrl = useMemo(() => {
    try {
      const parsed = new URL(guestUrl);
      return (
        parsed.hostname === "localhost" ||
        parsed.hostname === "127.0.0.1" ||
        parsed.hostname === "::1"
      );
    } catch {
      return false;
    }
  }, [guestUrl]);

  const printTitle = useMemo(
    () => `${restaurantName} Menu QR`,
    [restaurantName]
  );

  useEffect(() => {
    let active = true;

    QRCode.toDataURL(guestUrl, {
      errorCorrectionLevel: "H",
      margin: 4,
      width: 800,
      color: {
        dark: "#000000",
        light: "#ffffff"
      }
    })
      .then((url) => {
        if (active) {
          setQrDataUrl(url);
        }
      })
      .catch(() => {
        if (active) {
          setQrDataUrl("");
        }
      });

    return () => {
      active = false;
    };
  }, [guestUrl]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(guestUrl);
      setCopyLabel("Copied");
      window.setTimeout(() => setCopyLabel("Copy Link"), 1800);
    } catch {
      setCopyLabel("Copy Failed");
      window.setTimeout(() => setCopyLabel("Copy Link"), 1800);
    }
  };

  const downloadQr = () => {
    if (!qrDataUrl) {
      return;
    }

    const anchor = document.createElement("a");
    anchor.href = qrDataUrl;
    anchor.download = `${restaurantName.toLowerCase().replace(/\s+/g, "-")}-qr.png`;
    anchor.click();
  };

  const printQr = () => {
    if (!qrDataUrl) {
      return;
    }

    const printWindow = window.open("", "_blank", "width=900,height=700");

    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${printTitle}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #f7f1e8;
              color: #0b1220;
            }
            .card {
              text-align: center;
              padding: 32px;
              border: 2px solid #0b1220;
              border-radius: 24px;
              background: white;
              max-width: 420px;
            }
            img {
              width: 280px;
              height: 280px;
            }
            h1 {
              margin: 0 0 12px;
              font-size: 28px;
            }
            p {
              margin: 10px 0 0;
              font-size: 14px;
              word-break: break-word;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>${restaurantName}</h1>
            <img src="${qrDataUrl}" alt="${restaurantName} QR code" />
            <p>Scan to view the menu</p>
            <p>${guestUrl}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="rounded-[32px] border border-gold-200/20 bg-gradient-to-br from-gold-200/10 via-white/5 to-transparent p-6">
      <p className="tf-eyebrow">
        Table QR
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-ivory">
        Print the code your guests will scan
      </h2>
      <p className="mt-2 text-sm text-ivory/65">
        Place it on tables, counters, or receipts so guests can open your menu in a moment.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="flex items-center justify-center rounded-[28px] border border-white/10 bg-ivory p-5">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`${restaurantName} QR code`}
              className="h-60 w-60 rounded-2xl"
            />
          ) : (
            <div className="flex h-60 w-60 items-center justify-center rounded-2xl border border-dashed border-ink/20 text-sm text-ink/60">
              Getting it ready...
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-ivory/45">
              Menu Link
            </p>
            <p className="mt-3 break-all text-sm text-ivory">{guestUrl}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={copyLink} className="tf-button-secondary px-5 py-3">
              {copyLabel}
            </button>
            <button type="button" onClick={downloadQr} className="tf-button-secondary px-5 py-3">
              Download PNG
            </button>
            <button type="button" onClick={printQr} className="tf-button-primary px-5 py-3">
              Print QR
            </button>
          </div>

          <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-4 text-sm text-ivory/60">
            Use this code wherever guests are likely to reach for the menu first.
          </div>
        </div>
      </div>
    </div>
  );
}
