'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Bot,
  History,
} from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';


export function MainNav({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const menuItems = [
    {
      href: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/optimize',
      label: 'Optimization',
      icon: Bot,
    },
    {
        href: '/history',
        label: 'History',
        icon: History,
    }
  ];

  if (isMobile) {
    return (
        <nav className="flex flex-col items-start gap-4">
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
                <item.icon className="h-5 w-5" />
                {item.label}
                </Link>
            ))}
        </nav>
    );
  }

  return (
    <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        {menuItems.map((item) => (
            <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                    <Link
                    href={item.href}
                    className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                        {
                        'bg-accent text-accent-foreground': pathname === item.href,
                        }
                    )}
                    >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
        ))}
        </nav>
    </TooltipProvider>
  );
}
