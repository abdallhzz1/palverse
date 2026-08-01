import type { ReactNode } from "react";
import { Globe } from "lucide-react";

const iconClass = "h-5 w-5";

function Svg({ children, title }: { children: ReactNode; title: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      className={iconClass}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export function SocialPlatformIcon({ platform }: { platform?: string | null }) {
  const key = (platform || "other").toLowerCase().trim();

  switch (key) {
    case "facebook":
      return (
        <Svg title="Facebook">
          <path d="M14 8h3V4.5C16.3 4.3 15.2 4 13.8 4 11.1 4 9.2 5.7 9.2 8.8V11H6v4h3.2v9H13v-9h3.1l.5-4H13V9c0-1.1.3-1.8 1.5-1.8z" />
        </Svg>
      );
    case "instagram":
      return (
        <Svg title="Instagram">
          <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9zm9.25 1.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
        </Svg>
      );
    case "tiktok":
      return (
        <Svg title="TikTok">
          <path d="M16.5 3c.5 2.2 1.9 3.8 4 4.3v2.5c-1.4-.1-2.7-.5-3.9-1.2v5.8c0 3.5-2.8 6.3-6.3 6.3S4 17.9 4 14.4s2.8-6.3 6.3-6.3c.3 0 .7 0 1 .1v2.7c-.3-.1-.7-.1-1-.1-2 0-3.6 1.6-3.6 3.6s1.6 3.6 3.6 3.6 3.6-1.6 3.6-3.6V3h2.6z" />
        </Svg>
      );
    case "youtube":
      return (
        <Svg title="YouTube">
          <path d="M23.5 7.2a3 3 0 0 0-2.1-2.1C19.5 4.5 12 4.5 12 4.5s-7.5 0-9.4.6A3 3 0 0 0 .5 7.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-4.8zM9.8 15.5v-7l6.3 3.5-6.3 3.5z" />
        </Svg>
      );
    case "linkedin":
      return (
        <Svg title="LinkedIn">
          <path d="M6.9 8.7H3.5V20h3.4V8.7zM5.2 4A2 2 0 1 0 5.2 8 2 2 0 0 0 5.2 4zM20.5 20h-3.4v-5.5c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V20H9.8V8.7h3.3v1.5h.1c.5-.9 1.6-1.8 3.3-1.8 3.5 0 4.1 2.3 4.1 5.3V20z" />
        </Svg>
      );
    case "x":
    case "twitter":
      return (
        <Svg title="X">
          <path d="M18.2 3H21l-6.6 7.5L22 21h-5.5l-4.3-5.6L7 21H4.2l7-8L2 3h5.6l3.9 5.1L18.2 3zm-1 16.2h1.5L7 4.7H5.4l11.8 14.5z" />
        </Svg>
      );
    case "telegram":
      return (
        <Svg title="Telegram">
          <path d="M21.9 4.3 2.7 11.7c-1.3.5-1.3 1.3-.2 1.6l4.9 1.5 11.4-7.2c.5-.3 1-.1.6.2l-9.2 8.3-.3 4.9c.5 0 .7-.2 1-.5l2.4-2.3 5 3.7c.9.5 1.6.2 1.8-.9l3.3-15.5c.3-1.3-.5-1.9-1.5-1.5z" />
        </Svg>
      );
    case "snapchat":
      return (
        <Svg title="Snapchat">
          <path d="M12 2c2.4 0 4.4 1.9 4.6 4.3.1.8.1 2.4.2 3.3.1.5.4.8.9 1 .7.2 1.5.2 2.2.5.6.3.8.8.5 1.3-.3.6-1.1 1-1.8 1.3-.3.1-.5.3-.5.6 0 .9.7 1.7 1.4 2.4.5.5.6 1.1.1 1.5-.4.4-1 .3-1.5.2-.4-.1-.7 0-1 .3-1 .9-2.2 1.6-3.6 1.9-.3.1-.5.3-.5.6v.8c0 .6-.5 1-1 1s-1-.4-1-1v-.8c0-.3-.2-.5-.5-.6-1.4-.3-2.6-1-3.6-1.9-.3-.3-.6-.4-1-.3-.5.1-1.1.2-1.5-.2-.5-.4-.4-1 .1-1.5.7-.7 1.4-1.5 1.4-2.4 0-.3-.2-.5-.5-.6-.7-.3-1.5-.7-1.8-1.3-.3-.5-.1-1 .5-1.3.7-.3 1.5-.3 2.2-.5.5-.2.8-.5.9-1 .1-.9.1-2.5.2-3.3C7.6 3.9 9.6 2 12 2z" />
        </Svg>
      );
    default:
      return <Globe className={iconClass} aria-hidden />;
  }
}

export function socialPlatformLabel(platform?: string | null): string {
  switch ((platform || "").toLowerCase()) {
    case "facebook":
      return "فيسبوك";
    case "instagram":
      return "انستغرام";
    case "tiktok":
      return "تيك توك";
    case "youtube":
      return "يوتيوب";
    case "linkedin":
      return "لينكد إن";
    case "x":
    case "twitter":
      return "X";
    case "telegram":
      return "تيليجرام";
    case "snapchat":
      return "سناب شات";
    default:
      return "رابط";
  }
}
