
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


export default function InterestRateSwapCalculator() {
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
                This calculator is under construction. Accurately valuing an interest rate swap requires access to real-time yield curve data to project future floating rates and then discount them. This is a complex feature that requires external financial data APIs.
            </p>
        </CardContent>
    </Card>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>Planned Functionality</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>The goal of this tool is to illustrate how a "plain vanilla" interest rate swap is valued. A swap's value is the net present value (NPV) of its expected future cash flows.</p>
                <ol className="list-decimal list-inside space-y-2 mt-2">
                  <li><strong>Project Floating Rates:</strong> Using a current market yield curve (e.g., SOFR), the calculator would determine the implied forward rates for each future payment period.</li>
                  <li><strong>Calculate Cash Flows:</strong> For each period, it would calculate the fixed payment (using the swap's agreed rate) and the expected floating payment (using the projected forward rate).</li>
                  <li><strong>Find Net Cash Flow:</strong> It would find the difference between these two payments for each period.</li>
                  <li><strong>Discount to Present:</strong> Each net cash flow would be discounted to its present value using the appropriate rate from the yield curve.</li>
                   <li><strong>Sum for MTM Value:</strong> The sum of these discounted net cash flows would be the swap's Mark-to-Market (MTM) value. A positive value is an asset to the party receiving floating payments if rates have risen above the fixed rate.</li>
                </ol>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
