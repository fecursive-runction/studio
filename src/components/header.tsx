'use client';

import Link from 'next/link';
import {
  Factory,
  PanelLeft,
  Settings,
  User,
  LogOut,
  LogIn,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MainNav } from './main-nav';
import { useUser } from '@/firebase';
import { handleGoogleSignIn, handleLogout } from '@/firebase/auth/auth-service';
import { Skeleton } from './ui/skeleton';

export function AppHeader() {
  const { user, isUserLoading } = useUser();

  const renderUserMenu = () => {
    if (isUserLoading) {
      return <Skeleton className="h-10 w-10 rounded-full" />;
    }

    if (!user) {
      return (
        <Link href="/login" passHref>
          <Button variant="outline">
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </Button>
        </Link>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user.photoURL ?? `https://avatar.vercel.sh/${user.uid}.png`}
                alt={user.displayName ?? 'User'}
              />
              <AvatarFallback>{user.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user.displayName ?? 'My Account'}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <SheetClose>
                <Factory className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">kiln.AI</span>
              </SheetClose>
            </Link>
            <SheetClose asChild>
              <MainNav />
            </SheetClose>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="relative ml-auto flex-1 md:grow-0">
        {/* Search can be added back later */}
      </div>
      {renderUserMenu()}
    </header>
  );
}
