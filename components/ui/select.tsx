"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
// We'll reimplement a basic Select because Radix takes many deps.
// This is a "Mock" Select that actually uses a native select under the hood or just simple divs

const SelectContext = React.createContext<{
    value: string;
    onValueChange: (val: string) => void;
    open: boolean;
    setOpen: (o: boolean) => void;
}>({ value: "", onValueChange: () => { }, open: false, setOpen: () => { } })

const Select = ({ value, onValueChange, children }: any) => {
    const [open, setOpen] = React.useState(false);
    // If uncontrolled, we need internal state, but let's assume controlled for now (from parent)
    return (
        <SelectContext.Provider value={{ value, onValueChange: onValueChange || (() => { }), open, setOpen }}>
            <div className="relative inline-block w-full text-left" >
                {children}
            </div>
        </SelectContext.Provider>
    )
}

const SelectTrigger = ({ className, children }: any) => {
    const { open, setOpen } = React.useContext(SelectContext);
    return (
        <button
            type="button"
            onClick={() => setOpen(!open)}
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
        >
            {children}
        </button>
    )
}

const SelectValue = ({ placeholder }: any) => {
    const { value } = React.useContext(SelectContext);
    return <span>{value || placeholder}</span>
}

const SelectContent = ({ className, children }: any) => {
    const { open, setOpen } = React.useContext(SelectContext);
    if (!open) return null;
    return (
        <div className={cn(
            "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-black text-white shadow-md w-full mt-1",
            className
        )}>
            <div className="p-1 max-h-60 overflow-auto">
                {children}
            </div>
        </div>
    )
}

const SelectItem = ({ value, children, className }: any) => {
    const { onValueChange, setOpen } = React.useContext(SelectContext);
    return (
        <div
            onClick={() => {
                onValueChange(value);
                setOpen(false);
            }}
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-white/10 cursor-pointer",
                className
            )}
        >
            {children}
        </div>
    )
}

const SelectGroup = ({ className, children }: any) => {
    return <div className={cn("", className)}>{children}</div>
}

const SelectLabel = ({ className, children }: any) => {
    return <div className={cn("px-2 py-1.5 text-sm font-semibold", className)}>{children}</div>
}

const SelectSeparator = ({ className }: any) => {
    return <div className={cn("-mx-1 my-1 h-px bg-muted", className)} />
}

export {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
}
