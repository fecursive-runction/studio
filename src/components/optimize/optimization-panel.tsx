'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
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
import { Bot, Zap, Award, Gauge, Lightbulb, Thermometer, TrendingDown, TrendingUp } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import { runOptimization, getLiveMetrics } from '@/app/actions';
import { Badge } from '../ui/badge';
import { formatNumber } from '@/lib/utils';


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


function RecommendationDisplay({ recommendation }: { recommendation: any }) {
    if (!recommendation) return null;

    const qualityImpactPositive = recommendation.qualityScoreImpact.startsWith('+');
    const TrendIcon = qualityImpactPositive ? TrendingUp : TrendingDown;
  
    return (
      <div className="space-y-6">
        <div>
            <p className="text-sm text-muted-foreground">Recommendation ID</p>
            <Badge variant="outline">{recommendation.recommendationId}</Badge>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1">
            <Label className="text-sm font-normal text-muted-foreground flex items-center gap-1"><Gauge /> Feed Rate</Label>
            <p className="text-xl font-bold">{formatNumber(recommendation.feedRateSetpoint, { decimals: 1 })} <span className="text-base font-normal text-muted-foreground">TPH</span></p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-sm font-normal text-muted-foreground flex items-center gap-1"><Zap /> Energy Savings</Label>
            <p className="text-xl font-bold text-green-500">{formatNumber(recommendation.energyReductionPercentage, { decimals: 1 })}%</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-sm font-normal text-muted-foreground flex items-center gap-1"><Award /> Quality Impact</Label>
            <p className={`text-xl font-bold flex items-center ${qualityImpactPositive ? 'text-green-500' : 'text-red-500'}`}>
                <TrendIcon className="h-4 w-4 mr-1" />
                {recommendation.qualityScoreImpact}
            </p>
          </div>
        </div>

        <Separator />
  
        <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2"><Lightbulb /> Explanation</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
                {recommendation.explanation}
            </p>
        </div>
      </div>
    );
}

type Metrics = {
    kilnTemperature?: number;
    feedRate?: number;
    energyConsumption?: number;
    clinkerQualityScore?: number;
}
  
export function OptimizationPanel({ initialMetrics }: { initialMetrics: Metrics & { trigger?: boolean } }) {
  const [state, formAction] = useActionState(runOptimization, initialState);
  const { pending } = useFormStatus();
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<Metrics | null>(initialMetrics.kilnTemperature ? initialMetrics : null);
  
  useEffect(() => {
    async function loadInitialData() {
        if (!initialMetrics.kilnTemperature) {
            const liveMetrics = await getLiveMetrics();
            setMetrics(liveMetrics);
        }
    }
    loadInitialData();
  }, [initialMetrics]);

  useEffect(() => {
    if (initialMetrics.trigger && formRef.current) {
        // Use a timeout to allow the form to render before submitting
        setTimeout(() => {
            if (formRef.current) {
                const submitButton = formRef.current.querySelector('button[type="submit"]') as HTMLButtonElement;
                submitButton?.click();
            }
        }, 100);
    }
  }, [initialMetrics.trigger]);


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
            <input type="hidden" name="kilnTemperature" value={metrics?.kilnTemperature} />
            <input type="hidden" name="feedRate" value={metrics?.feedRate} />
            <input type="hidden" name="energyConsumption" value={metrics?.energyConsumption} />
            <input type="hidden" name="clinkerQualityScore" value={metrics?.clinkerQualityScore} />

            <Card>
                <CardHeader>
                    <CardTitle>Inputs</CardTitle>
                    <CardDescription>
                    Live metrics from the plant. Add constraints to guide the AI.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    { !metrics ? <Skeleton className="h-24" /> : (
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p className="flex justify-between"><span><Thermometer className="inline h-4 w-4 mr-1"/>Kiln Temp:</span> <span className="font-mono text-foreground">{formatNumber(metrics.kilnTemperature!)} °C</span></p>
                            <p className="flex justify-between"><span><Gauge className="inline h-4 w-4 mr-1"/>Feed Rate:</span> <span className="font-mono text-foreground">{formatNumber(metrics.feedRate!)} TPH</span></p>
                            <p className="flex justify-between"><span><Award className="inline h-4 w-4 mr-1"/>Quality Score:</span> <span className="font-mono text-foreground">{formatNumber(metrics.clinkerQualityScore!, {decimals: 3})}</span></p>
                        </div>
                    )}
                    <Separator />
                    <div className="space-y-2">
                        <Label htmlFor="constraints">Additional Constraints</Label>
                        <Textarea
                            id="constraints"
                            name="constraints"
                            placeholder="e.g., MAINTAIN_QUALITY_ABOVE_0.91, USE_ALT_FUEL_MIX"
                            className="min-h-[100px]"
                            disabled={pending}
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
            Optimal parameters suggested by the AI based on live data and your constraints.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {pending && <Skeleton className="h-[240px]" />}
            {!pending && !state.recommendation && (
                <div className="flex h-[240px] flex-col items-center justify-center rounded-lg border-2 border-dashed">
                    <Bot className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                        { initialMetrics.trigger ? 'Generating recommendation...' : 'Your recommendation will appear here.'}
                    </p>
                </div>
            )}
            {!pending && state.recommendation && (
                <RecommendationDisplay recommendation={state.recommendation} />
            )}
        </CardContent>
      </Card>
    </div>
  );
}
