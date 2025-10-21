'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Skeleton } from '@/components/ui/skeleton';
import { BrainCircuit, Code, Lightbulb, Search, Table as TableIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { runQuery } from '@/app/actions';

const initialState = {
  sql: null,
  results: null,
  summary: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <span className="animate-spin mr-2">🧠</span> Processing...
        </>
      ) : (
        <>
          <Search className="mr-2 h-4 w-4" /> Ask AI
        </>
      )}
    </Button>
  );
}

export function QueryInterface() {
  const [state, formAction] = useActionState(runQuery, initialState);
  const { pending } = useFormStatus();
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: "destructive",
        title: "Query Error",
        description: state.error,
      });
    }
    if (state.sql) {
        formRef.current?.reset();
    }
  }, [state, toast]);

  const renderResultsTable = () => {
    if (!state.results) return null;
    if (state.results.length === 0) return <p className="text-sm text-muted-foreground">The query returned no results.</p>;

    const headers = Object.keys(state.results[0]);

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    {headers.map(header => <TableHead key={header}>{header}</TableHead>)}
                </TableRow>
            </TableHeader>
            <TableBody>
                {state.results.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                        {headers.map(header => <TableCell key={`${rowIndex}-${header}`}>{JSON.stringify(row[header])}</TableCell>)}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
  }
  
  return (
    <div className="space-y-8">
        <form ref={formRef} action={formAction}>
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="h-6 w-6 text-primary" />
                    Natural Language Query
                </CardTitle>
                <CardDescription>
                    Ask questions about plant data in plain English. The AI will
                    translate it to a SQL query and give you a summary.
                </CardDescription>
                </CardHeader>
                <CardContent className="flex w-full items-start gap-4">
                    <Input
                        id="question"
                        name="question"
                        placeholder="e.g., What was the average kiln temperature yesterday?"
                        required
                        className="flex-1"
                        disabled={pending}
                    />
                    <SubmitButton />
                </CardContent>
            </Card>
        </form>

        <div className="mt-8">
            <div className="space-y-8">
                <div className="grid gap-8 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Code className="h-5 w-5 text-muted-foreground" />
                                Generated SQL
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {pending && !state.sql && <Skeleton className="h-24" />}
                            {state.sql ? (
                                <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto"><code>{state.sql}</code></pre>
                            ): (
                                !pending && <p className="text-sm text-muted-foreground">SQL will appear here...</p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Lightbulb className="h-5 w-5 text-muted-foreground" />
                                AI Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {pending && !state.summary && <Skeleton className="h-24" />}
                            {state.summary ? (
                                <p className="text-sm">{state.summary}</p>
                            ) : (
                                !pending && <p className="text-sm text-muted-foreground">Summary will appear here...</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TableIcon className="h-5 w-5 text-muted-foreground" />
                            Query Results
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pending && !state.results && <Skeleton className="h-32" />}
                        {state.results ? (
                           renderResultsTable()
                        ) : (
                            !pending && <p className="text-sm text-muted-foreground">Results will appear here...</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
