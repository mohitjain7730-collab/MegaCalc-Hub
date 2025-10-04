
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function ArtifactDatingCalculator() {
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
                This calculator is under construction. It will provide simplified models for estimating artifact age (e.g., C-14 dating).
            </p>
            <p className="mt-4 text-sm text-destructive">
                Note: This tool is for educational purposes to illustrate concepts of radiometric dating and is not a substitute for professional laboratory analysis.
            </p>
        </CardContent>
    </Card>
  );
}
