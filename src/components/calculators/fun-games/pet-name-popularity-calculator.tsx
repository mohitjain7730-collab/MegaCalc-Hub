
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function PetNamePopularityCalculator() {
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
                This calculator is under construction. It requires a large, public dataset of pet names (like from city registrations or vet databases) to analyze trends, which is beyond the current scope.
            </p>
        </CardContent>
    </Card>
  );
}
