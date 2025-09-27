
'use client';

import { useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, PlusCircle, XCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const statSchema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.number().optional(),
});

const scoringRuleSchema = z.object({
    name: z.string().min(1, "Name is required"),
    points: z.number().optional(),
});

const formSchema = z.object({
  stats: z.array(statSchema),
  scoring: z.array(scoringRuleSchema),
});

type FormValues = z.infer<typeof formSchema>;

export default function FantasyLeaguePointsCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stats: [
        { name: 'Passing Yards', value: undefined },
        { name: 'Rushing Yards', value: undefined },
        { name: 'Receiving Yards', value: undefined },
        { name: 'Touchdowns', value: undefined },
        { name: 'Interceptions', value: undefined },
      ],
      scoring: [
        { name: 'Passing Yards', points: 0.04 }, // 1 point per 25 yards
        { name: 'Rushing Yards', points: 0.1 }, // 1 point per 10 yards
        { name: 'Receiving Yards', points: 0.1 },
        { name: 'Touchdowns', points: 6 },
        { name: 'Interceptions', points: -2 },
      ],
    },
  });

  const { fields: statFields, append: appendStat, remove: removeStat } = useFieldArray({ control: form.control, name: "stats" });
  const { fields: scoringFields, append: appendScoring, remove: removeScoring } = useFieldArray({ control: form.control, name: "scoring" });
  
  const allStats = useWatch({ control: form.control, name: 'stats' });
  const allScoring = useWatch({ control: form.control, name: 'scoring' });

  const calculateScore = () => {
    let totalPoints = 0;
    const scoringMap = new Map(allScoring.map(s => [s.name, s.points || 0]));
    
    allStats.forEach(stat => {
        if (scoringMap.has(stat.name)) {
            totalPoints += (stat.value || 0) * scoringMap.get(stat.name)!;
        }
    });
    setResult(totalPoints);
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateScore();
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={handleFormSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader><CardTitle>Scoring Rules</CardTitle><CardDescription>Enter your league's points per stat.</CardDescription></CardHeader>
                <CardContent>
                    {scoringFields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-[1fr,80px,auto] gap-2 items-start mb-2">
                            <FormField control={form.control} name={`scoring.${index}.name`} render={({ field }) => ( <FormItem><FormControl><Input placeholder="Stat Name" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name={`scoring.${index}.points`} render={({ field }) => ( <FormItem><FormControl><Input type="number" step="any" placeholder="Points" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl></FormItem> )} />
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeScoring(index)}><XCircle className="h-5 w-5 text-destructive" /></Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendScoring({ name: '', points: 0 })}><PlusCircle className="mr-2 h-4 w-4" /> Add Rule</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Player Stats</CardTitle><CardDescription>Enter the player's performance for the game.</CardDescription></CardHeader>
                <CardContent>
                    {statFields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-[1fr,80px,auto] gap-2 items-start mb-2">
                            <FormField control={form.control} name={`stats.${index}.name`} render={({ field }) => ( <FormItem><FormControl><Input placeholder="Stat Name" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name={`stats.${index}.value`} render={({ field }) => ( <FormItem><FormControl><Input type="number" placeholder="Value" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl></FormItem> )} />
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeStat(index)}><XCircle className="h-5 w-5 text-destructive" /></Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendStat({ name: '', value: undefined })}><PlusCircle className="mr-2 h-4 w-4" /> Add Stat</Button>
                </CardContent>
            </Card>
          </div>

          <Button type="submit" className="w-full">Calculate Fantasy Score</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Trophy className="h-8 w-8 text-primary" /><CardTitle>Total Fantasy Points</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(2)}</p>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This flexible calculator allows you to define your own fantasy football scoring system. For each stat a player accumulates, it multiplies the stat's value by the points you assigned in your scoring rules. It then sums up all these point values to get the player's total fantasy score for the game.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
