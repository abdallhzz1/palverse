import * as React from "react"
import { ChevronDown } from "lucide-react"

const SelectContext = React.createContext<{ value: any, onValueChange: any }>({ value: undefined, onValueChange: undefined })

export const Select = ({ value, onValueChange, children }: any) => {
  return (
    <SelectContext.Provider value={{ value, onValueChange }}>
      <div className="relative w-full">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, any>(
  ({ className, children, value }, ref) => {
    // This is a fake select trigger, we will actually just render a native select over it
    return (
      <div className={`flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}>
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

export const SelectValue = ({ placeholder }: any) => <span>{placeholder || "اختر..."}</span>

export const SelectContent = ({ children }: any) => {
  const { value, onValueChange } = React.useContext(SelectContext)
  return (
    <select 
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
    >
      <option value="" disabled>اختر...</option>
      {children}
    </select>
  )
}

export const SelectItem = ({ value, children }: any) => {
  return <option value={value}>{children}</option>
}
