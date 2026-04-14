"use client";

import { AnchorHTMLAttributes } from "react";

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  restaurantId: string;
  actionType: "whatsapp_click" | "waiter_call";
};

export default function TrackedLink({
  restaurantId,
  actionType,
  onClick,
  ...props
}: TrackedLinkProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        void fetch("/api/action-click", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            restaurantId,
            actionType
          })
        });

        onClick?.(event);
      }}
    />
  );
}
