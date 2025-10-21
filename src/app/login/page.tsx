
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Factory } from 'lucide-react';
import { useUser } from '@/firebase';
import { LoginForm } from '@/components/auth/login-form';
import { SignupForm } from '@/components/auth/signup-form';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isLoginView, setIsLoginView] = useState(true);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  if (isUserLoading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Factory className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Factory className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to kiln.AI</CardTitle>
          <CardDescription>
            {isLoginView
              ? 'Sign in to access your plant dashboard.'
              : 'Create an account to get started.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoginView ? <LoginForm /> : <SignupForm />}
          <div className="mt-4 text-center text-sm">
            {isLoginView ? "Don't have an account?" : 'Already have an account?'}
            <Button
              variant="link"
              className="pl-1"
              onClick={() => setIsLoginView(!isLoginView)}
            >
              {isLoginView ? 'Sign Up' : 'Sign In'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
