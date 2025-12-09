'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

// Placeholder component to avoid client-side crashes when the calculator is requested.
// TODO: Replace with full option pool allocation calculator implementation.
export default function OptionPoolAllocationCalculator() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Option Pool Allocation Calculator</CardTitle>
          <CardDescription>
            Size a pre- or post-money option pool and view dilution for founders, investors, and employees.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This calculator is temporarily unavailable. We are working on restoring full functionality.
            </AlertDescription>
          </Alert>
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry loading
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

