import { HTMLAttributes, ReactNode, TdHTMLAttributes } from 'react';

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

export default function Table({ children, className = '', ...props }: TableProps) {
  return (
    <div className="overflow-x-auto w-full">
      <table className={`w-full text-left border-collapse ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <thead className={`bg-brand-50 border-y border-brand-200/50 text-brand-600 text-xs uppercase tracking-wider ${className}`}>
      {children}
    </thead>
  );
}

export function TableRow({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr 
      onClick={onClick}
      className={`border-b border-brand-100 hover:bg-brand-50/50 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <th className={`px-6 py-4 font-medium ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '', ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-6 py-4 text-sm text-brand-800 ${className}`} {...props}>
      {children}
    </td>
  );
}
