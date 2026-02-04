import Link from 'next/link';
import { ReactNode } from 'react';

interface QuickActionProps {
  icon: ReactNode;
  title: string;
  href: string;
  color?: string;
}

export function QuickAction({ icon, title, href, color = 'primary' }: QuickActionProps) {
  const colorClasses = {
    primary: 'bg-primary hover:bg-primary-hover',
    accent: 'bg-accent hover:bg-accent/90',
    secondary: 'bg-secondary hover:bg-secondary/90',
  };

  return (
    <Link href={href}>
      <div className={`${colorClasses[color as keyof typeof colorClasses]} text-dark p-6 rounded-xl hover:shadow-lg transition-all cursor-pointer group`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <span className="font-semibold text-lg">{title}</span>
        </div>
      </div>
    </Link>
  );
}
