import { OptimizationPanel } from '@/components/optimize/optimization-panel';

export default function OptimizationPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="mx-auto grid w-full max-w-4xl gap-2">
        <h1 className="text-3xl font-semibold">Production Optimization</h1>
        <p className="text-muted-foreground">
          Use GenAI to get recommendations for optimizing plant operations based on current conditions and constraints.
        </p>
      </div>
      <div className="mx-auto w-full max-w-4xl">
        <OptimizationPanel />
      </div>
    </main>
  );
}
