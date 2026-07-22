import { cn } from "@/lib/utils";

interface BrandSectionHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function BrandSectionHeading({ title, subtitle, icon, className, ...props }: BrandSectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-2 relative", className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#EAF3EC] to-white dark:from-[#0F3D2E]/60 dark:to-[#171717] text-[#1E7D4E] dark:text-[#4ade80] shadow-sm border border-[#1E7D4E]/10 shrink-0">
            {icon}
          </div>
        )}
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F3D2E] dark:text-[#EAF3EC] tracking-tight" {...props}>
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="text-[#7FA789] text-sm md:text-base font-medium mt-1 md:pr-14 pr-12">
          {subtitle}
        </p>
      )}
    </div>
  );
}
