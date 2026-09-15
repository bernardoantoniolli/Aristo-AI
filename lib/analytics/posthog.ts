import posthog from "posthog-js";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (
  typeof window !== "undefined" &&
  key &&
  !posthog.__loaded
) {
  posthog.init(key, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST ||
      "https://us.i.posthog.com",

    capture_pageview: true,
    capture_pageleave: true,

    persistence: "localStorage",

    autocapture: false,
  });
}

export function track(
  event: string,
  properties?: Record<string, any>
) {
  if (typeof window === "undefined") {
    return;
  }

  if (!key) {
    return;
  }

  posthog.capture(event, properties);
}
