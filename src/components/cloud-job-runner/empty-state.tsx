import type { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`text-center ${className}`}>
      {icon ? (
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[14px] bg-white/[0.05] text-slate-400">
          {icon}
        </div>
      ) : null}
      <p className="mt-4 font-medium text-slate-200">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}
