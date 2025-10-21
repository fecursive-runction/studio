'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BrainCircuit,
  Bot,
} from 'lucide-react';

export function MainNav() {
  const pathname = usePathname();
  const menuItems = [
    {
      href: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/analytics',
      label: 'Analytics',
      icon: BrainCircuit,
    },
    {
      href: '/optimize',
      label: 'Optimization',
      icon: Bot,
    },
  ];

  return (
    <nav className="flex flex-col items-start gap-4 px-2 sm:py-5">
      {menuItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            {
              'bg-muted text-primary': pathname === item.href,
            }
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
