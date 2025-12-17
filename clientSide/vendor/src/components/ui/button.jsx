import React from "react";

export function Button({
    children,
    type = "button",
    variant = "default",
    size = "md",
    className = "",
    ...props
}) {
    const base = "rounded-lg font-medium transition-all";

    const variants = {
        default: "bg-black text-white hover:bg-gray-900",
        outline: "border border-gray-400 hover:bg-gray-100",
        ghost: "hover:bg-gray-200",
    };

    const sizes = {
        sm: "px-3 py-1 text-sm",
        md: "px-4 py-2",
        lg: "px-5 py-3 text-lg",
    };

    return (
        <button
            type={type}
            className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
