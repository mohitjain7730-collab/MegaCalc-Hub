'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function GeneticTraitProbabilityCalculator() {
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
                This calculator is under construction. It will allow you to predict the likelihood of inheriting specific genetic traits based on parental genotypes using Punnett squares.
            </p>
             <p className="mt-4 text-sm text-destructive">
                Note: This tool is for educational purposes to illustrate basic Mendelian genetics and is not a substitute for professional genetic counseling.
            </p>
        </CardContent>
    </Card>
  );
}
