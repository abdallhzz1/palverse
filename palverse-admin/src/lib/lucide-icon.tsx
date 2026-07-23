import { icons, LayoutGrid, type LucideIcon } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { CATEGORY_ICON_NAMES } from "@/lib/category-icons";

/** Legacy short names stored before the full Lucide library picker. */
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
  const resolved = resolveLucideIconName(name);
  const StaticIcon = getLucideIconComponent(resolved);
  const props = { className, size, strokeWidth, color, absoluteStrokeWidth };

  if (StaticIcon !== LayoutGrid || resolved === DEFAULT_CATEGORY_ICON) {
    return <StaticIcon {...props} />;
  }

  return (
    <DynamicIcon
      name={resolved as IconName}
      fallback={() => <LayoutGrid {...props} />}
      {...props}
    />
  );
}

/** Curated icon names shown in the category picker (not the full Lucide set). */
export const LUCIDE_ICON_NAMES: string[] = [...CATEGORY_ICON_NAMES];
