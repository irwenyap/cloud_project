import type { ReactNode } from "react";

const panelVariants = {
  raised:
    "border border-white/8 bg-[linear-gradient(180deg,rgba(18,24,34,0.96),rgba(11,15,22,0.94))] shadow-[0_10px_22px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl",
  sunken:
    "border border-white/6 bg-[linear-gradient(180deg,rgba(8,11,17,0.98),rgba(10,14,21,0.96))] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_18px_40px_rgba(0,0,0,0.3),inset_0_-10px_24px_rgba(255,255,255,0.02)] backdrop-blur-xl",
} as const;

type PanelProps = {
  children: ReactNode;
  className?: string;
  variant?: keyof typeof panelVariants;
};

export function Panel({
  children,
  className = "",
  variant = "raised",
}: PanelProps) {
  return <section className={`${panelVariants[variant]} ${className}`}>{children}</section>;
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
