'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { runOptimization } from '@/app/actions';
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
            {state.recommendation ? (
                 <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                   <div className="rounded-lg border bg-background p-4">
                     <div className="text-sm text-muted-foreground flex items-center gap-2"><Gauge className="h-4 w-4"/>Feed Rate</div>
                     <div className="text-2xl font-bold">{state.recommendation.feedRateSetpoint.toFixed(1)} <span className="text-base font-normal">TPH</span></div>
                   </div>
                   <div className="rounded-lg border bg-background p-4">
                     <div className="text-sm text-muted-foreground flex items-center gap-2"><Zap className="h-4 w-4"/>Energy Reduction</div>
                     <div className="text-2xl font-bold">{state.recommendation.energyReductionPercentage.toFixed(1)}%</div>
                   </div>
                   <div className="rounded-lg border bg-background p-4">
                     <div className="text-sm text-muted-foreground flex items-center gap-2">⛽ Fuel Mix Ratio</div>
                     <div className="text-2xl font-bold">{(state.recommendation.fuelMixRatio * 100).toFixed(0)}%</div>
                   </div>
                   <div className="rounded-lg border bg-background p-4">
                     <div className="text-sm text-muted-foreground flex items-center gap-2"><Award className="h-4 w-4"/>Quality Impact</div>
                     <div className="text-2xl font-bold">{state.recommendation.qualityScoreImpact}</div>
                   </div>
                 </div>
                 
                 <Separator />
                 
                 <div>
                   <h4 className="font-semibold mb-2 flex items-center gap-2"><Lightbulb className="h-4 w-4 text-yellow-400"/>Explanation</h4>
                   <p className="text-sm text-muted-foreground">{state.recommendation.explanation}</p>
                 </div>
  
                  <div className="text-xs text-muted-foreground pt-4">
                   Recommendation ID: {state.recommendation.recommendationId}
                  </div>
  
               </div>
            ) : (
                <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed">
                    <Bot className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                        Your recommendation will appear here.
                    </p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
