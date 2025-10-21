'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BrainCircuit,
  Bot,
} from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from './ui/sidebar-v2';

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
    <SidebarMenu>
        {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                    <SidebarMenuButton 
                        isActive={pathname === item.href} 
                        icon={<item.icon />}
                        className="w-full justify-start"
                    >
                        {item.label}
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
        ))}
    </SidebarMenu>
  );
}
