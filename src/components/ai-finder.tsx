'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, Bot } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { findCalculator, type State } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'Searching...' : 'Find Calculator'}
    </Button>
  );
}

export function AIFinder() {
  const initialState: State = { message: null };
  const [state, dispatch] = useActionState(findCalculator, initialState);

  return (
    <Card className="w-full max-w-3xl mx-auto my-8 border-primary/20 shadow-lg">
      <CardHeader>
        <div className='flex items-center gap-3 mb-2'>
            <Bot className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">AI Calculator Finder</CardTitle>
        </div>
        <CardDescription>
          Can&apos;t find what you&apos;re looking for? Describe what you want to
          calculate, and our AI will find the right category for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={dispatch} className="flex flex-col sm:flex-row gap-2">
          <Input
            name="query"
            type="text"
            placeholder="e.g., 'How much do I need to save for retirement?'"
            required
            className="flex-grow"
          />
          <SubmitButton />
        </form>
        {state.message && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
