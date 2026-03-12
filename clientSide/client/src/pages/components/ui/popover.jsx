import React, { useState, useRef, useEffect } from "react";

export function Popover({ children }) {
  return <div className="relative inline-block">{children}</div>;
}

export function PopoverTrigger({ children, onClick }) {
  return (
    <div onClick={onClick} className="cursor-pointer">
      {children}
    </div>
  );
}

export function PopoverContent({ open, children, className = "" }) {
  if (!open) return null;

  return (
    <div className={`absolute z-50 mt-2 bg-white shadow-lg rounded-lg ${className}`}>
      {children}
    </div>
  );
}