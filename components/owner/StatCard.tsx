import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  iconColor?: string;
}

export function StatCard({ title, value, icon, iconColor = 'text-primary' }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`${iconColor}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
