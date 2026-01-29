"use client"

import * as React from "react"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const DialogContext = React.createContext<{
    open: boolean
    onOpenChange: (open: boolean) => void
}>({ open: false, onOpenChange: () => { } })

const Dialog = ({
    children,
    open,
    onOpenChange,
}: {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}) => {
    const [internalOpen, setInternalOpen] = React.useState(false)
    const isControlled = open !== undefined
    const finalOpen = isControlled ? open : internalOpen
    const finalOnOpenChange = (val: boolean) => {
        if (!isControlled) setInternalOpen(val)
        if (onOpenChange) onOpenChange(val)
    }

    return (
        <DialogContext.Provider value={{ open: finalOpen, onOpenChange: finalOnOpenChange }}>
            {children}
        </DialogContext.Provider>
    )
}

const DialogTrigger = ({
    children,
    asChild = false,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }) => {
    const { onOpenChange } = React.useContext(DialogContext)

    // If asChild is true, we should ideally clone the child and add the onClick.
    // For simplicity in this fix, we just wrap it or assume it's a button.
    // Actually, shadcn Trigger often wraps a Button.

    return (
        <div onClick={() => onOpenChange(true)} {...props}>
            {children}
        </div>
    )
}

const DialogContent = React.forwardRef<
    HTMLDivElement,
    Omit<React.ComponentPropsWithoutRef<typeof motion.div>, "children"> & { children?: React.ReactNode }
>(({ className, children, ...props }, ref) => {
    const { open, onOpenChange } = React.useContext(DialogContext)

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
                        onClick={() => onOpenChange(false)}
                    />
                    {/* Content */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            ref={ref}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className={cn(
                                "relative z-50 w-full max-w-lg rounded-xl border bg-black p-6 shadow-xl pointer-events-auto",
                                "border-white/20",
                                className
                            )}
                            {...props}
                        >
                            {children}
                            <button
                                className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                                onClick={() => onOpenChange(false)}
                            >
                                <X className="h-4 w-4 text-white" />
                                <span className="sr-only">Close</span>
                            </button>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
})
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col space-y-1.5 text-center sm:text-left mb-4",
            className
        )}
        {...props}
    />
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-lg font-semibold leading-none tracking-tight text-white",
            className
        )}
        {...props}
    />
))
DialogTitle.displayName = "DialogTitle"

// Dummy components to satisfy imports if needed
const DialogDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
))
DialogDescription.displayName = "DialogDescription"

export {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
}
