import type { ReactNode } from "react";

const panelClassName =
  "rounded-[20px] border border-white/8 bg-white/[0.045] shadow-[0_30px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl";

type PanelProps = {
  children: ReactNode;
  className?: string;
};

export function Panel({ children, className = "" }: PanelProps) {
  return <section className={`${panelClassName} ${className}`}>{children}</section>;
}

type ControlIconProps = {
  children: ReactNode;
};

export function ControlIcon({ children }: ControlIconProps) {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-white/10 bg-white/5 text-slate-300">
      {children}
    </span>
  );
}
