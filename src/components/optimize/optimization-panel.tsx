'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Zap, Award, Gauge, Lightbulb } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

const initialState = {
  recommendation: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <span className="animate-spin mr-2">🤖</span> Generating...
        </>
      ) : (
        <>
          <Bot className="mr-2 h-4 w-4" /> Get Recommendation
        </>
      )}
    </Button>
  );
}

// Dummy action
async function runOptimization(prevState: any, formData: FormData) {
    return {...initialState, error: "Optimization functionality not implemented yet."};
}

export function OptimizationPanel() {
  const [state, formAction] = useActionState(runOptimization, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: "destructive",
        title: "Optimization Error",
        description: state.error,
      });
    }
  }, [state.error, toast]);


  return (
    <div className="grid gap-8 md:grid-cols-3">
        <form ref={formRef} action={formAction} className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Constraints</CardTitle>
                    <CardDescription>
                    Define operational constraints for the AI.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="constraints">Additional Constraints</Label>
                    <Textarea
                        id="constraints"
                        name="constraints"
                        placeholder="e.g., MAINTAIN_QUALITY_ABOVE_0.91, USE_ALT_FUEL_MIX"
                        className="min-h-[100px]"
                    />
                    <p className="text-xs text-muted-foreground">Separate constraints with a comma.</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <SubmitButton />
                </CardFooter>
            </Card>
        </form>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>AI Recommendation</CardTitle>
          <CardDescription>
            Optimal parameters suggested by the AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed">
                <Bot className="h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                    Your recommendation will appear here.
                </p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
