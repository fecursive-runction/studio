
import { getMetricsHistory } from '@/app/actions';
import { HistoryTable } from '@/components/history/history-table';

export const revalidate = 5; // Revalidate the page every 5 seconds

export default async function HistoryPage() {
  const metricsHistory = await getMetricsHistory();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-semibold">Production History</h1>
        <p className="text-muted-foreground">
          A live log of all production metrics recorded in the database. New
          data is ingested every 5 seconds.
        </p>
      </div>

      <div className="mx-auto w-full max-w-[95%]">
        <HistoryTable initialMetrics={metricsHistory} />
      </div>
    </main>
  );
}
