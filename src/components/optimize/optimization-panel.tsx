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
import { Bot, Zap, Lightbulb, Thermometer, FlaskConical, TrendingUp, CheckCircle } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import { runOptimization, getLiveMetrics, applyOptimization } from '@/app/actions';
import { Badge } from '../ui/badge';
import { formatNumber } from '@/lib/utils';


const initialOptimizationState = {
  recommendation: null,
  error: null,
};

const initialApplyState = {
    success: false,
    message: '',
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

function ApplyButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" variant="secondary" size="sm" disabled={pending} className="w-full md:w-auto">
            {pending ? 'Applying...' : 'Apply Recommendation'}
        </Button>
    )
}


function RecommendationDisplay({ recommendation }: { recommendation: any }) {
    if (!recommendation) return null;
    const [state, formAction] = useActionState(applyOptimization, initialApplyState);
    const { toast } = useToast();

    useEffect(() => {
        if (state.message) {
            toast({
                title: state.success ? "Success" : "Error",
                description: state.message,
                variant: state.success ? "default" : "destructive",
            });
        }
    }, [state, toast]);
  
    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm text-muted-foreground">Recommendation ID</p>
                <Badge variant="outline">{recommendation.recommendationId}</Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-normal text-muted-foreground flex items-center gap-1"><FlaskConical /> Limestone Adj.</Label>
                <p className="text-xl font-bold">{recommendation.limestoneAdjustment}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-normal text-muted-foreground flex items-center gap-1"><FlaskConical /> Clay Adj.</Label>
                <p className="text-xl font-bold">{recommendation.clayAdjustment}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-normal text-muted-foreground flex items-center gap-1"><TrendingUp /> Predicted LSF</Label>
                <p className="text-xl font-bold text-green-500">{formatNumber(recommendation.predictedLSF, { decimals: 1 })}%</p>
              </div>
            </div>

            <Separator />
    
            <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2"><Lightbulb /> Explanation</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {recommendation.explanation}
                </p>
            </div>

            <Separator />

            <form action={formAction} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-lg bg-muted p-4">
                <input type="hidden" name="recommendationId" value={recommendation.recommendationId} />
                <input type="hidden" name="limestoneAdjustment" value={recommendation.limestoneAdjustment} />
                <input type="hidden" name="clayAdjustment" value={recommendation.clayAdjustment} />
                <input type="hidden" name="predictedLSF" value={recommendation.predictedLSF} />
                <input type="hidden" name="feedRateSetpoint" value={recommendation.feedRateSetpoint} />
                
                <div className='flex-1'>
                    <h4 className="font-semibold flex items-center gap-2"><CheckCircle /> Apply Changes</h4>
                    <p className="text-xs text-muted-foreground">Simulate applying this recommendation. A new data point will be added to the database.</p>
                </div>
                { state.success ? <p className="text-sm text-green-500 font-medium">Applied!</p> : <ApplyButton /> }
            </form>
        </div>
    );
}

type Metrics = {
    kilnTemperature?: number;
    feedRate?: number;
    lsf?: number;
    cao?: number;
    sio2?: number;
    al2o3?: number;
    fe2o3?: number;
}
  
export function OptimizationPanel({ initialMetrics }: { initialMetrics: Metrics & { trigger?: boolean } }) {
  const [state, formAction] = useActionState(runOptimization, initialOptimizationState);
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
    if (initialMetrics.trigger && formRef.current && metrics) {
        // Use a timeout to allow the form to render before submitting
        setTimeout(() => {
            if (formRef.current) {
                const submitButton = formRef.current.querySelector('button[type="submit"]') as HTMLButtonElement;
                submitButton?.click();
            }
        }, 100);
    }
  }, [initialMetrics.trigger, metrics]);


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
            {metrics && (
              <>
                <input type="hidden" name="kilnTemperature" value={metrics.kilnTemperature} />
                <input type="hidden" name="feedRate" value={metrics.feedRate} />
                <input type="hidden" name="lsf" value={metrics.lsf} />
                <input type="hidden" name="cao" value={metrics.cao} />
                <input type="hidden" name="sio2" value={metrics.sio2} />
                <input type="hidden" name="al2o3" value={metrics.al2o3} />
                <input type="hidden" name="fe2o3" value={metrics.fe2o3} />
              </>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Inputs</CardTitle>
                    <CardDescription>
                    Live chemical and physical data from the plant.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    { !metrics ? <Skeleton className="h-32" /> : (
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p className="flex justify-between"><span><Thermometer className="inline h-4 w-4 mr-1"/>Kiln Temp:</span> <span className="font-mono text-foreground">{formatNumber(metrics.kilnTemperature!)} °C</span></p>
                            <p className="flex justify-between"><span><Zap className="inline h-4 w-4 mr-1"/>Feed Rate:</span> <span className="font-mono text-foreground">{formatNumber(metrics.feedRate!)} TPH</span></p>
                            <p className="font-bold flex justify-between mt-2 pt-2 border-t"><span><FlaskConical className="inline h-4 w-4 mr-1"/>LSF:</span> <span className="font-mono text-foreground">{formatNumber(metrics.lsf!, {decimals: 1})}%</span></p>
                            <p className="flex justify-between text-xs"><span>CaO:</span> <span className="font-mono text-foreground">{formatNumber(metrics.cao!)}%</span></p>
                            <p className="flex justify-between text-xs"><span>SiO₂:</span> <span className="font-mono text-foreground">{formatNumber(metrics.sio2!)}%</span></p>
                            <p className="flex justify-between text-xs"><span>Al₂O₃:</span> <span className="font-mono text-foreground">{formatNumber(metrics.al2o3!)}%</span></p>
                            <p className="flex justify-between text-xs"><span>Fe₂O₃:</span> <span className="font-mono text-foreground">{formatNumber(metrics.fe2o3!)}%</span></p>
                        </div>
                    )}
                    <Separator />
                    <div className="space-y-2">
                        <Label htmlFor="constraints">Additional Constraints</Label>
                        <Textarea
                            id="constraints"
                            name="constraints"
                            placeholder="e.g., Keep kiln temp below 1480°C, LSF target is 96%"
                            className="min-h-[80px]"
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
            {pending && <Skeleton className="h-[340px]" />}
            {!pending && !state.recommendation && (
                <div className="flex h-[340px] flex-col items-center justify-center rounded-lg border-2 border-dashed">
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

    