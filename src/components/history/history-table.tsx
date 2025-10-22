
'use client';

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
import { useState, useEffect, useContext } from 'react';
import { DataContext } from '@/context/data-provider';

type Metric = {
    id: number;
    timestamp: string;
    kiln_temp: number;
    feed_rate: number;
    lsf: number;
    cao: number;
    sio2: number;
    al2o3: number;
    fe2o3: number;
    c3s: number;
    c2s: number;
    c3a: number;
    c4af: number;
};


export function HistoryTable() {
  const { metricsHistory } = useContext(DataContext);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getLsfBadgeVariant = (lsf: number) => {
    if (lsf < 94 || lsf > 98) {
      return 'destructive';
    }
    return 'secondary';
  };

  return (
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
                <TableHead>C₃S</TableHead>
                <TableHead>C₂S</TableHead>
                <TableHead>C₃A</TableHead>
                <TableHead>C₄AF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metricsHistory.map((metric: any) => (
                <TableRow key={metric.id}>
                  <TableCell className="font-mono text-xs">
                    {isClient ? new Date(metric.timestamp).toLocaleString() : ""}
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
                  <TableCell>
                    {formatNumber(metric.c3s, { decimals: 1 })}%
                  </TableCell>
                  <TableCell>
                    {formatNumber(metric.c2s, { decimals: 1 })}%
                  </TableCell>
                  <TableCell>
                    {formatNumber(metric.c3a, { decimals: 1 })}%
                  </TableCell>
                  <TableCell>
                    {formatNumber(metric.c4af, { decimals: 1 })}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
