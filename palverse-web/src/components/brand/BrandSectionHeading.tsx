import { cn } from "@/lib/utils";

interface BrandSectionHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function BrandSectionHeading({ title, subtitle, icon, className, ...props }: BrandSectionHeadingProps) {
  return (
    <div className={cn("relative flex flex-col gap-1.5", className)}>
      <div className="flex items-center gap-3">
        {icon ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E2EAE5] bg-white text-[#2F6B4F]">
            {icon}
          </div>
        ) : null}
        <h2
          className="font-heading text-xl font-extrabold tracking-tight text-[#1A3D32] md:text-2xl"
          {...props}
        >
          {title}
        </h2>
      </div>
      {subtitle ? (
        <p className="text-sm font-medium text-[#6B8578] md:text-[0.95rem]">{subtitle}</p>
      ) : null}
    </div>
  );
}
