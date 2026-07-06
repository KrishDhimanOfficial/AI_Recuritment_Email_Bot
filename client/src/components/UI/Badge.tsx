import { HTMLAttributes } from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export default function Badge({ children, variant = 'default', className = '', ...props }: BadgeProps) {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border";
  
  const variants = {
    default: "bg-brand-100 text-brand-800 border-brand-200",
    primary: "bg-primary-50 text-primary-700 border-primary-200",
    success: "bg-accent-teal-50 text-accent-teal-700 border-accent-teal-200",
    warning: "bg-accent-amber-50 text-accent-amber-700 border-accent-amber-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <span className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
