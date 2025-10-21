'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { runQuery } from '@/app/actions';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { BrainCircuit, Code, Lightbulb, Search, Table as TableIcon, AlertCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

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
  const [state, formAction] = useFormState(runQuery, initialState);
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
  }, [state.error, toast]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formAction(formData);
  };
  
  return (
    <div className="space-y-8">
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
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit} className="flex w-full items-start gap-4">
            <Input
              id="question"
              name="question"
              placeholder="e.g., What was the average kiln temperature yesterday?"
              required
              className="flex-1"
            />
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Code className="h-5 w-5 text-muted-foreground" />
              Generated SQL
            </CardTitle>
          </CardHeader>
          <CardContent>
            {useFormStatus().pending ? (
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            ) : state.sql ? (
              <pre className="mt-2 w-full overflow-x-auto rounded-md bg-muted p-4 text-sm">
                <code>{state.sql}</code>
              </pre>
            ) : (
                <p className="text-sm text-muted-foreground">SQL will appear here...</p>
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
            {useFormStatus().pending ? (
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            ) : state.summary ? (
              <p className="text-sm">{state.summary}</p>
            ) : (
                <p className="text-sm text-muted-foreground">Summary will appear here...</p>
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
          {useFormStatus().pending ? (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
          ) : state.results ? (
            <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(state.results[0]).map((key) => <TableHead key={key}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.results.map((row, i) => (
                    <TableRow key={i}>
                      {Object.values(row).map((value, j) => (
                        <TableCell key={j}>{typeof value === 'number' ? value.toFixed(2) : String(value)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          ) : (
            <p className="text-sm text-muted-foreground">Results will appear here...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
