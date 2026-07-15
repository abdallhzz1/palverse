import * as React from "react"
import { ChevronDown } from "lucide-react"

interface SelectContextType {
  value: string | undefined;
  onValueChange: ((value: string) => void) | undefined;
}

const SelectContext = React.createContext<SelectContextType>({ value: undefined, onValueChange: undefined })

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export const Select = ({ value, onValueChange, children }: SelectProps) => {
  return (
    <SelectContext.Provider value={{ value, onValueChange }}>
      <div className="relative w-full">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export interface SelectTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export const SelectTrigger = React.forwardRef<HTMLDivElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    // This is a fake select trigger, we will actually just render a native select over it
    return (
      <div 
        ref={ref}
        {...props}
        className={`flex h-10 w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

export const SelectValue = ({ placeholder }: { placeholder?: string }) => <span>{placeholder || "اختر..."}</span>

export const SelectContent = ({ children }: { children: React.ReactNode }) => {
  const { value, onValueChange } = React.useContext(SelectContext)
  return (
    <select 
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      value={value || ""}
      onChange={(e) => onValueChange?.(e.target.value)}
    >
      <option value="" disabled>اختر...</option>
      {children}
    </select>
  )
}

export interface SelectItemProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  value: string;
  children: React.ReactNode;
}

export const SelectItem = ({ value, children, ...props }: SelectItemProps) => {
  return <option value={value} {...props}>{children}</option>
}
