import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-[6px] font-[600] cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent border-none disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-accent text-white hover:bg-blue-700": variant === 'default',
            "border border-border bg-white hover:bg-gray-50 text-text-main": variant === 'outline',
            "hover:bg-accent-soft hover:text-accent text-text-muted": variant === 'ghost',
            "bg-danger text-white hover:bg-red-600": variant === 'destructive',
            "px-[10px] py-[6px] text-[11px]": size === 'sm',
            "px-[14px] py-[8px] text-[13px]": size === 'default',
            "h-11 px-8 text-base": size === 'lg',
            "h-10 w-10": size === 'icon',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
