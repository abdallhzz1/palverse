import * as React from "react"
import { useState, useRef, useEffect } from "react"

export const DropdownMenu = ({ children }: any) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === DropdownMenuTrigger) {
            return React.cloneElement(child as any, { onClick: () => setIsOpen(!isOpen) })
          }
          if (child.type === DropdownMenuContent) {
            return isOpen ? React.cloneElement(child as any, { setIsOpen }) : null
          }
        }
        return child
      })}
    </div>
  )
}

export const DropdownMenuTrigger = ({ children, onClick, asChild }: any) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, { onClick })
  }
  return <div onClick={onClick}>{children}</div>
}

export const DropdownMenuContent = ({ children, align = "center", setIsOpen }: any) => {
  return (
    <div className={`absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white p-1 shadow-md animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ${align === "end" ? "left-0" : align === "start" ? "right-0" : "left-1/2 -translate-x-1/2"}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, { setIsOpen })
        }
        return child
      })}
    </div>
  )
}

export const DropdownMenuItem = ({ children, className, onClick, setIsOpen, asChild }: any) => {
  const handleClick = (e: any) => {
    onClick?.(e)
    setIsOpen?.(false)
  }

  const baseClassName = `relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className || ""}`

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, { onClick: handleClick, className: `${(children as any).props.className || ""} ${baseClassName}` })
  }

  return (
    <div className={baseClassName} onClick={handleClick}>
      {children}
    </div>
  )
}
