
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ChildGrowthPercentileCalculator() {
  return (
    <Card className="w-full text-center shadow-md mt-8">
        <CardHeader>
            <Construction className="mx-auto h-16 w-16 mb-6 text-primary" strokeWidth={1.5} />
            <CardTitle className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Calculator Coming Soon
            </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-4">
            <p className="text-lg text-muted-foreground">
                This calculator is under construction.
            </p>
            <Alert variant="destructive">
                <AlertTitle>Implementation Note</AlertTitle>
                <AlertDescription>
                    Accurately calculating growth percentiles requires extensive data tables from the CDC/WHO for various age and sex combinations, plus statistical functions (like the Normal CDF) to convert Z-scores to percentiles. This complex data integration is beyond the scope of a single-step build.
                </AlertDescription>
            </Alert>
        </CardContent>
    </Card>
  );
}
