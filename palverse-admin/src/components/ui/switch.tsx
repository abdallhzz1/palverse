import * as React from "react"

export const Switch = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { checked?: boolean, onCheckedChange?: (v: boolean) => void }>(({ className, checked, onCheckedChange, ...props }, ref) => {
  return (
    <input 
      type="checkbox" 
      role="switch"
      ref={ref}
      checked={checked} 
      onChange={(e) => onCheckedChange?.(e.target.checked)} 
      className={`h-5 w-10 appearance-none rounded-full bg-slate-200 checked:bg-[#0F3D2E] relative transition-colors cursor-pointer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:rounded-full after:h-4 after:w-4 after:transition-all checked:after:translate-x-5 ${className || ''}`}
      {...props} 
    />
  )
})
Switch.displayName = "Switch"
