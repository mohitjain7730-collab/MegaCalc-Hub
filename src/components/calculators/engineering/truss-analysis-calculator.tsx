'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function TrussAnalysisCalculator() {
  return (
    <Card className="w-full text-center shadow-md mt-8">
        <CardHeader>
            <Construction className="mx-auto h-16 w-16 mb-6 text-primary" strokeWidth={1.5} />
            <CardTitle className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Analysis Too Complex for a Simple Calculator
            </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0">
            <p className="text-lg text-muted-foreground">
                Truss analysis, using methods like the Method of Joints or Method of Sections, requires solving a system of linear equations based on the specific geometry and loading of the truss.
            </p>
            <p className="mt-4 text-muted-foreground">
                This is a task better suited for dedicated structural analysis software rather than a simple web calculator.
            </p>
        </CardContent>
    </Card>
  );
}
