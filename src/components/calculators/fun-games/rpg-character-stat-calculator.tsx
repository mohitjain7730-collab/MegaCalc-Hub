'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dices, RefreshCw } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function RpgCharacterStatCalculator() {
  const [stats, setStats] = useState<number[]>([]);

  const generateStats = () => {
    const newStats = [];
    for (let i = 0; i < 6; i++) {
      const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
      rolls.sort((a, b) => a - b);
      const sum = rolls.slice(1).reduce((acc, val) => acc + val, 0);
      newStats.push(sum);
    }
    setStats(newStats);
  };
  
  // Generate stats on initial client-side render to avoid hydration mismatch
  useEffect(() => {
    generateStats();
  }, []);

  return (
    <div className="space-y-8">
        <Button onClick={generateStats}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate New Stats
        </Button>
      
      {stats.length > 0 && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Dices className="h-8 w-8 text-primary" /><CardTitle>Generated Character Stats</CardTitle></div></CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
                    {stats.map((stat, index) => (
                        <div key={index} className="p-4 bg-muted rounded-lg">
                            <p className="text-3xl font-bold">{stat}</p>
                        </div>
                    ))}
                </div>
                <CardDescription className='mt-6 text-center'>These stats were generated using the "4d6 drop the lowest" method.</CardDescription>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator uses a common method for generating character ability scores in tabletop role-playing games like Dungeons & Dragons.</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li>For each of the six stats, the calculator simulates rolling four 6-sided dice (4d6).</li>
                    <li>It identifies and discards the single lowest roll from the four dice.</li>
                    <li>It sums the values of the remaining three dice to produce one ability score.</li>
                    <li>This process is repeated six times to generate a full set of stats.</li>
                </ol>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
