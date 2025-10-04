
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function ImpliedVolatilityCalculator() {
  return (
    <Card className="w-full text-center shadow-md mt-8">
        <CardHeader>
            <Construction className="mx-auto h-16 w-16 mb-6 text-primary" strokeWidth={1.5} />
            <CardTitle className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Calculator Coming Soon
            </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0">
            <p className="text-lg text-muted-foreground">
                This calculator is under construction. Calculating implied volatility requires an iterative numerical algorithm (like Newton-Raphson) to reverse-engineer the Black-Scholes model, which is complex to implement robustly in a browser without dedicated financial libraries.
            </p>
        </CardContent>
    </Card>
  );
}
