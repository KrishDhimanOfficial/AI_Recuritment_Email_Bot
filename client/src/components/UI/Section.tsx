import React, { ReactNode } from "react";

type SpacingSize = "none" | "xs" | "sm" | "md" | "lg";

interface SectionProps {
  children: ReactNode;
  className?: string;
  spacing?: SpacingSize;
  as?: React.ElementType;
}

const spacingMap: Record<SpacingSize, string> = {
  none: "py-0",
  xs: "py-2 sm:py-4",
  sm: "py-6 sm:py-8",
  md: "py-12 sm:py-16",
  lg: "py-20 sm:py-32",
};

export default function Section({
  children,
  className = "",
  spacing = "sm", // Defaults to "sm" (less space) as requested
  as: Component = "section",
}: SectionProps) {
  return (
    <Component className={`${spacingMap[spacing]} w-full ${className}`}>
      {children}
    </Component>
  );
}
