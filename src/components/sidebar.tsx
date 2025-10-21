'use client';
import Link from 'next/link';
import { Factory } from 'lucide-react';
import { MainNav } from './main-nav';

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <Link
          href="/"
          className="group flex h-14 shrink-0 items-center justify-center gap-2 rounded-full text-lg font-semibold text-primary-foreground md:text-base"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all group-hover:scale-110">
            <Factory className="h-5 w-5" />
          </div>
          <span className="sr-only">kiln.AI</span>
        </Link>
      <MainNav />
    </aside>
  );
}
