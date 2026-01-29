"use client"

import * as React from "react"
// Since we don't have radix installed yet, let's use a simple label implementation
// or install radix-label. For speed, I'll allow standard label but wrapped.
// Actually, standard <label> is fine for now but let's make it styled.
import { cn } from "@/lib/utils"

const Label = React.forwardRef<
    HTMLLabelElement,
    React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
    <label
        ref={ref}
        className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            className
        )}
        {...props}
    />
))
Label.displayName = "Label"

export { Label }
