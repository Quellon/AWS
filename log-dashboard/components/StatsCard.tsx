interface StatsCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
}

export default function StatsCard({ title, value, icon, color }: StatsCardProps) {
  return (
    <div className={`${color} rounded-lg p-6 shadow-lg transform transition hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  );
}
