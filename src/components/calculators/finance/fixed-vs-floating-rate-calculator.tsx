
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


export default function FixedVsFloatingRateCalculator() {
  return (
    <div className="space-y-8">
    <Card className="w-full text-center shadow-md mt-8">
        <CardHeader>
            <Construction className="mx-auto h-16 w-16 mb-6 text-primary" strokeWidth={1.5} />
            <CardTitle className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Calculator Coming Soon
            </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0">
            <p className="text-lg text-muted-foreground">
                This calculator is under construction. It requires a complex interface for users to input projected rate changes over time and a dynamic amortization schedule, which is beyond the current scope of this simplified tool.
            </p>
        </CardContent>
    </Card>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>Planned Functionality</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>The goal of this calculator is to provide a clear comparison between a fixed-rate loan and a floating-rate (or adjustable-rate) loan.</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li><strong>Fixed Rate:</strong> The interest rate remains the same for the entire loan term, providing predictable monthly payments.</li>
                  <li><strong>Floating Rate:</strong> The interest rate can change over time based on a benchmark index. This means payments can go up or down.</li>
                </ul>
                <p className="mt-2">The calculator will generate two full amortization schedules. For the floating rate, it will allow the user to project future rate changes (e.g., "increase by 0.5% in year 3"). It will then compare the total interest paid for both scenarios, helping the user understand the trade-off between the stability of a fixed rate and the potential risks or rewards of a floating rate.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
