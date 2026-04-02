interface MetricCardProps {
  label: string;
  value: string;
  tone: "green" | "blue" | "yellow" | "orange";
}

const toneClasses = {
  green: "border-clean/40 text-clean",
  blue: "border-low/40 text-low",
  yellow: "border-medium/40 text-medium",
  orange: "border-high/40 text-high"
};

export function MetricCard({ label, value, tone }: MetricCardProps) {
  return (
    <div className={`panel-alt rounded-2xl p-5 ${toneClasses[tone]}`}>
      <div className="text-xs uppercase tracking-[0.3em] text-white/50">{label}</div>
      <div className="mt-3 font-mono text-3xl font-semibold text-white">{value}</div>
    </div>
  );
}

