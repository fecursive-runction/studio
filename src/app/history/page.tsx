
import { getMetricsHistory } from '@/app/actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export const revalidate = 5; // Revalidate the page every 5 seconds

export default async function HistoryPage() {
  const metricsHistory = await getMetricsHistory();

  const getLsfBadgeVariant = (lsf: number) => {
    if (lsf < 94 || lsf > 98) {
      return 'destructive';
    }
    return 'secondary';
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-semibold">Production History</h1>
        <p className="text-muted-foreground">
          A live log of all production metrics recorded in the database. New
          data is ingested every 5 seconds.
        </p>
      </div>

      <div className="mx-auto w-full max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle>Metrics Log</CardTitle>
            <CardDescription>
              Showing the most recent production data first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[65vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Timestamp</TableHead>
                    <TableHead>Kiln Temp</TableHead>
                    <TableHead>Feed Rate</TableHead>
                    <TableHead>LSF</TableHead>
                    <TableHead>CaO</TableHead>
                    <TableHead>SiO₂</TableHead>
                    <TableHead>Al₂O₃</TableHead>
                    <TableHead>Fe₂O₃</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metricsHistory.map((metric: any) => (
                    <TableRow key={metric.id}>
                      <TableCell className="font-mono text-xs">
                        {new Date(metric.timestamp).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>
                        {formatNumber(metric.kiln_temp, { decimals: 1 })}°C
                      </TableCell>
                      <TableCell>
                        {formatNumber(metric.feed_rate, { decimals: 1 })} TPH
                      </TableCell>
                      <TableCell>
                        <Badge variant={getLsfBadgeVariant(metric.lsf)}>
                          {formatNumber(metric.lsf, { decimals: 1 })}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatNumber(metric.cao, { decimals: 2 })}%
                      </TableCell>
                      <TableCell>
                        {formatNumber(metric.sio2, { decimals: 2 })}%
                      </TableCell>
                      <TableCell>
                        {formatNumber(metric.al2o3, { decimals: 2 })}%
                      </TableCell>
                      <TableCell>
                        {formatNumber(metric.fe2o3, { decimals: 2 })}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
