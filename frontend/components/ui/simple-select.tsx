"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export interface SelectContentProps {
  children: React.ReactNode
  position?: "popper" | "item-aligned"
}

export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  children: React.ReactNode
}

export interface SelectValueProps {
  placeholder?: string
}

const SelectContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}>({
  isOpen: false,
  setIsOpen: () => {}
})

const Select = ({ value, onValueChange, children }: SelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen, setIsOpen } = React.useContext(SelectContext)
    
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = ({ children, position = "popper" }: SelectContentProps) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext)
  const [positionStyle, setPositionStyle] = React.useState<React.CSSProperties>({})
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (isOpen && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      setPositionStyle({
        position: 'absolute',
        top: triggerRect.bottom + 4,
        left: triggerRect.left,
        width: triggerRect.width,
        zIndex: 50
      })
    }
  }, [isOpen])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, setIsOpen])

  if (!isOpen) return null

  return (
    <div
      ref={contentRef}
      className="max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
      style={positionStyle}
    >
      <div className="p-1">
        {children}
      </div>
    </div>
  )
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, value, children, ...props }, ref) => {
    const { onValueChange, setIsOpen } = React.useContext(SelectContext)
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground",
          className
        )}
        onClick={() => {
          onValueChange?.(value)
          setIsOpen(false)
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SelectItem.displayName = "SelectItem"

const SelectValue = ({ placeholder }: SelectValueProps) => {
  const { value } = React.useContext(SelectContext)
  
  return (
    <span className={cn(!value && "text-muted-foreground")}>
      {value || placeholder}
    </span>
  )
}

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
}
