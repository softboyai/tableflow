"use client";

import { useEffect } from "react";

type RestaurantScanTrackerProps = {
  restaurantId: string;
  slug: string;
};

export default function RestaurantScanTracker({
  restaurantId,
  slug
}: RestaurantScanTrackerProps) {
  useEffect(() => {
    const track = async () => {
      await fetch("/api/track-scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          restaurantId,
          slug
        })
      });
    };

    void track();
  }, [restaurantId, slug]);

  return null;
}
