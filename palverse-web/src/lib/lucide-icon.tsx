import { icons, LayoutGrid, type LucideIcon } from "lucide-react";

/** Legacy short names stored before the Lucide picker. */
export const LEGACY_CATEGORY_ICON_ALIASES: Record<string, string> = {
  grid: "layout-grid",
  restaurant: "utensils",
  cafe: "coffee",
  shopping: "shopping-bag",
  tech: "smartphone",
  home: "house",
  services: "wrench",
  health: "heart-pulse",
  education: "book-open",
  automotive: "car",
  groceries: "apple",
  gifts: "gift",
  crafts: "scissors",
  /** Lucide kebab names that don't resolve via the `icons` map. */
  "paintbrush-2": "paintbrush",
};

export const DEFAULT_CATEGORY_ICON = "layout-grid";

export function resolveLucideIconName(icon?: string | null): string {
  if (!icon || icon.trim() === "") {
    return DEFAULT_CATEGORY_ICON;
  }

  const normalized = icon.trim().toLowerCase();
  return LEGACY_CATEGORY_ICON_ALIASES[normalized] || normalized;
}

function toPascalCase(iconName: string): string {
  return iconName
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export function getLucideIconComponent(icon?: string | null): LucideIcon {
  const name = resolveLucideIconName(icon);
  const component = icons[toPascalCase(name) as keyof typeof icons];
  return (component as LucideIcon | undefined) || LayoutGrid;
}

/**
 * Safe for Server Components: only uses static Lucide icons.
 * Never passes functions into client components (DynamicIcon fallbacks break RSC).
 * Deploy trigger: homepage category icons must stay SSR-safe.
 */
export function LucideIconByName({
  name,
  className,
  size,
  strokeWidth,
  color,
  absoluteStrokeWidth,
}: {
  name?: string | null;
  className?: string;
  size?: number | string;
  strokeWidth?: number | string;
  color?: string;
  absoluteStrokeWidth?: boolean;
}) {
  const Icon = getLucideIconComponent(name);
  return (
    <Icon
      className={className}
      size={size}
      strokeWidth={strokeWidth}
      color={color}
      absoluteStrokeWidth={absoluteStrokeWidth}
    />
  );
}
