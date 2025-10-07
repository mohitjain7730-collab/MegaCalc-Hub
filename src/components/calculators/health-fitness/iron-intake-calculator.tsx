
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// RDA tables (mg/day) - values primarily from NIH ODS, with ICMR as an alternative
const RDA_NIH: Record<string, any> = {
    "inf0": 0.27,
    "inf1": 11,
    "1-3": 7,
    "4-8": 10,
    "9-13": 8,
    "14-18": {male: 11, female:15},
    "19-50": {male: 8, female:18},
    "51+": 8,
    "pregnant": 27,
    "lactating": 9 // Simplification for both teen/adult
};

const RDA_ICMR: Record<string, any> = {
    "inf0": 0.27,
    "inf1": 11,
    "1-3": 7,
    "4-8": 10,
    "9-13": 8,
    "14-18": {male: 12, female:19},
    "19-50": {male: 19, female:29},
    "51+": 17,
    "pregnant": 34,
    "lactating": 29
};

const formSchema = z.object({
  ageGroup: z.string(),
  sex: z.string(),
  countryPref: z.string(),
  currentIntake: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
    rda: number;
    intake: number;
    diff: number;
    percent: number;
    messages: string[];
}

export default function IronIntakeCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ageGroup: '19-50',
      sex: 'female',
      countryPref: 'nih',
      currentIntake: undefined,
    },
  });

  const getRda = (ageKey: string, sex: string, region: string) => {
    let src = region === 'icmr' ? RDA_ICMR : RDA_NIH;
    let val = src[ageKey];

    if (val === undefined) return null;

    if (typeof val === 'object') {
        if (sex === 'male') return val.male ?? val;
        if (sex === 'female') return val.female ?? val;
        return (val.male && val.female) ? Math.round((val.male + val.female)/2) : (val.male || val.female);
    }
    return val;
  }

  const onSubmit = (values: FormValues) => {
    const { ageGroup, sex, countryPref, currentIntake } = values;
    
    const rda = getRda(ageGroup, sex, countryPref);

    if (rda === null) {
      form.setError("ageGroup", { message: "RDA not available for this group." });
      setResult(null);
      return;
    }

    const diff = currentIntake - rda;
    const percent = (currentIntake / rda) * 100;
    const UL = 45; // Tolerable Upper Intake Level for adults

    let messages = [];
    if (currentIntake < rda) {
        messages.push(`You are below the recommended intake for this group. Consider dietary adjustments (iron-rich foods) or discuss supplements with a health professional.`);
    } else {
        messages.push(`You're meeting or exceeding the RDA. If you exceed ${UL} mg/day, be cautious: high-dose iron supplements can cause side effects and should be used under medical advice.`);
    }
    if (currentIntake > UL) {
        messages.push(`Your intake exceeds the common adult tolerable upper limit (${UL} mg/day). Consult a clinician before continuing high-dose iron.`);
    }

    setResult({ rda, intake: currentIntake, diff, percent, messages });
  };
  
  const fillExample = () => {
    form.reset({
        ageGroup: '19-50',
        sex: 'female',
        countryPref: 'nih',
        currentIntake: 10
    });
    // Trigger calculation after filling example
    setTimeout(() => form.handleSubmit(onSubmit)(), 0);
  }
  
   const resetForm = () => {
    form.reset({
        ageGroup: '19-50',
        sex: 'female',
        countryPref: 'nih',
        currentIntake: undefined
    });
    setResult(null);
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Enter basic info and your current daily iron intake (mg) to compare with recommended intake (RDA).</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             <FormField control={form.control} name="ageGroup" render={({ field }) => (
              <FormItem><FormLabel>Age group</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <option value="inf0">0–6 months</option>
                    <option value="inf1">7–12 months</option>
                    <option value="1-3">1–3 years</option>
                    <option value="4-8">4–8 years</option>
                    <option value="9-13">9–13 years</option>
                    <option value="14-18">14–18 years</option>
                    <option value="19-50">19–50 years</option>
                    <option value="51+">51+ years</option>
                    <option value="pregnant">Pregnant</option>
                    <option value="lactating">Breastfeeding</option>
                  </SelectContent>
              </Select></FormItem>
            )} />
            <FormField control={form.control} name="sex" render={({ field }) => (
              <FormItem><FormLabel>Sex</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other / prefer not to say</option>
                  </SelectContent>
              </Select></FormItem>
            )} />
             <FormField control={form.control} name="countryPref" render={({ field }) => (
              <FormItem><FormLabel>RDA Preference</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                     <option value="nih">NIH (US)</option>
                     <option value="icmr">ICMR / India (approx.)</option>
                     <option value="who">WHO guidance (pregnancy focus)</option>
                  </SelectContent>
              </Select></FormItem>
            )} />
            <FormField control={form.control} name="currentIntake" render={({ field }) => (
              <FormItem className="md:col-span-3">
                <FormLabel>Your current iron intake (mg/day)</FormLabel>
                <FormControl><Input type="number" step="0.1" placeholder="e.g., 10.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                <FormMessage />
                <CardDescription className='text-xs'>Include diet + supplements (estimate).</CardDescription>
              </FormItem>
            )} />
          </div>
           <div className="flex flex-wrap gap-2">
            <Button type="submit">Calculate</Button>
            <Button type="button" variant="secondary" onClick={fillExample}>Fill example (woman, 28y)</Button>
            <Button type="button" variant="secondary" onClick={resetForm}>Reset</Button>
          </div>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Utensils className="h-8 w-8 text-primary" /><CardTitle>Your Daily Summary</CardTitle></div></CardHeader>
          <CardContent className="space-y-4">
            <p><strong>Recommended iron intake (RDA):</strong> {result.rda.toFixed(1)} mg/day</p>
            <p><strong>Your reported intake:</strong> {result.intake.toFixed(1)} mg/day</p>
            <p><strong>Difference:</strong> <span className={result.diff >= 0 ? '' : 'text-destructive font-bold'}>{result.diff.toFixed(1)} mg/day ({result.percent.toFixed(0)}% of RDA)</span></p>
            <div>
              <Progress value={Math.min(100, result.percent)} className="w-full h-3" />
            </div>
            {result.messages.map((msg, i) => <p key={i} className={`text-sm ${msg.includes('below') || msg.includes('exceeds') ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>{msg}</p>)}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
