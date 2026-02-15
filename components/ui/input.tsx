import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    englishOnly?: boolean;
    error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, englishOnly = false, error, onChange, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (englishOnly) {
                // Remove any non-English characters immediately
                const originalValue = e.target.value;
                // Keep only English letters, numbers, spaces, and basic symbols
                const sanitizedValue = originalValue.replace(/[^a-zA-Z0-9\s.,!?@#$%^&*()_+\-=\[\]{}|;:'",.<>\/\\`~]/g, '');
                
                if (originalValue !== sanitizedValue) {
                    e.target.value = sanitizedValue;
                }
            }
            // Always call the original onChange (from react-hook-form or parent)
            onChange?.(e);
        };

        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-md border bg-black/20 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white backdrop-blur-sm transition-all",
                    error 
                        ? "border-red-500 focus-visible:ring-red-500/50" 
                        : "border-input focus-visible:ring-primary focus:border-primary/50",
                    className
                )}
                ref={ref}
                onChange={handleChange}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
