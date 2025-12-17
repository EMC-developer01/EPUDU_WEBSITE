import React from "react";

export function Card({ className = "", children }) {
    return (
        <div className={`bg-white shadow-md rounded-xl ${className}`}>
            {children}
        </div>
    );
}

export function CardContent({ className = "", children }) {
    return (
        <div className={`p-5 ${className}`}>
            {children}
        </div>
    );
}
