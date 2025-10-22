
import { OptimizationPanel } from '@/components/optimize/optimization-panel';
import { Suspense } from 'react';

// Wrap the page in a Suspense boundary to handle the streaming of search parameters
function OptimizationPageContent({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const initialMetrics = {
    kilnTemperature: searchParams?.kilnTemperature ? Number(searchParams.kilnTemperature) : undefined,
    feedRate: searchParams?.feedRate ? Number(searchParams.feedRate) : undefined,
    lsf: searchParams?.lsf ? Number(searchParams.lsf) : undefined,
    cao: searchParams?.cao ? Number(searchParams.cao) : undefined,
    sio2: searchParams?.sio2 ? Number(searchParams.sio2) : undefined,
    al2o3: searchParams?.al2o3 ? Number(searchParams.al2o3) : undefined,
    fe2o3: searchParams?.fe2o3 ? Number(searchParams.fe2o3) : undefined,
    trigger: searchParams?.trigger === 'true',
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="mx-auto grid w-full max-w-4xl gap-2">
        <h1 className="text-3xl font-semibold">Production Optimization</h1>
        <p className="text-muted-foreground">
          Use GenAI to get recommendations for optimizing plant operations based on live chemical and physical data.
        </p>
      </div>
      <div className="mx-auto w-full max-w-4xl">
        <OptimizationPanel initialMetrics={initialMetrics} />
      </div>
    </main>
  );
}


export default function OptimizationPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OptimizationPageContent searchParams={searchParams} />
    </Suspense>
  )
}
