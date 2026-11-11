import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Stat({ label, value, sub, accent = false }: { label: string; value: ReactNode; sub?: ReactNode; accent?: boolean }) {
  return (
    <div className={cn("rounded-2xl border p-5", accent ? "border-ink bg-ink text-white" : "border-line bg-white")}>
      <p className={cn("text-xs font-medium", accent ? "text-white/60" : "text-muted")}>{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">{value}</p>
      {sub && <p className={cn("mt-1 text-xs", accent ? "text-sun" : "text-muted")}>{sub}</p>}
    </div>
  );
}

export function AdminHeader({ title, intro, actions }: { title: string; intro?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="eyebrow text-muted">Admin</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em]">{title}</h1>
        {intro && <p className="mt-1 text-muted">{intro}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-line bg-mist text-xs text-muted">
          <tr>{head.map((h) => <th key={h} scope="col" className="px-4 py-3 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}
