import * as React from "react"
// import { Slot } from "@radix-ui/react-slot"
// import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Note: I'm implementing a simplified version without cva first dependency if not installed, 
// actually let's do a pure tailwind one to avoid extra deps if possible, 
// or I should have installed class-variance-authority.
// Let's stick to simple props for now to avoid installing more deps unless requested.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "default", asChild = false, ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

        let variantStyles = ""
        switch (variant) {
            case "primary":
                variantStyles = "bg-orange-600 text-white hover:bg-orange-700 shadow-md"
                break
            case "secondary":
                variantStyles = "bg-green-600 text-white hover:bg-green-700 shadow-md"
                break
            case "outline":
                variantStyles = "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                break
            case "ghost":
                variantStyles = "hover:bg-accent hover:text-accent-foreground"
                break
            case "link":
                variantStyles = "text-primary underline-offset-4 hover:underline"
                break
        }

        let sizeStyles = ""
        switch (size) {
            case "default":
                sizeStyles = "h-10 px-4 py-2"
                break
            case "sm":
                sizeStyles = "h-9 rounded-md px-3"
                break
            case "lg":
                sizeStyles = "h-11 rounded-md px-8 text-md"
                break
            case "icon":
                sizeStyles = "h-10 w-10"
                break
        }

        return (
            <button
                className={cn(baseStyles, variantStyles, sizeStyles, className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
