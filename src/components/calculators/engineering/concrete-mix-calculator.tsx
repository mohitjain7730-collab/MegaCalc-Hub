
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function ConcreteMixCalculator() {
  return (
    <Card className="w-full text-center shadow-md mt-8">
        <CardContent className="p-8">
            <Construction className="mx-auto h-16 w-16 mb-6 text-primary" strokeWidth={1.5} />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Calculator Coming Soon
            </h2>
            <p className="text-lg text-muted-foreground">
                This calculator is currently under construction.
            </p>
        </CardContent>
    </Card>
  );
}
