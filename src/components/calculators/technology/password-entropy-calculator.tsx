
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  password: z.string().min(1, 'Password cannot be empty'),
});

type FormValues = z.infer<typeof formSchema>;

const getStrength = (entropy: number) => {
    if (entropy < 35) return { text: "Very Weak", color: "text-red-500" };
    if (entropy < 60) return { text: "Weak", color: "text-orange-500" };
    if (entropy < 80) return { text: "Moderate", color: "text-yellow-500" };
    if (entropy < 100) return { text: "Strong", color: "text-green-500" };
    return { text: "Very Strong", color: "text-emerald-500" };
};

export default function PasswordEntropyCalculator() {
  const [result, setResult] = useState<{ entropy: number; strength: {text: string, color: string}} | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: '' },
  });

  const password = form.watch('password');

  useEffect(() => {
    if (password) {
        let characterSetSize = 0;
        if (/[a-z]/.test(password)) characterSetSize += 26;
        if (/[A-Z]/.test(password)) characterSetSize += 26;
        if (/[0-9]/.test(password)) characterSetSize += 10;
        if (/[^a-zA-Z0-9]/.test(password)) characterSetSize += 32; // Common special characters

        if (characterSetSize > 0) {
            const entropy = Math.log2(Math.pow(characterSetSize, password.length));
            setResult({ entropy, strength: getStrength(entropy) });
        }
    } else {
        setResult(null);
    }
  }, [password]);

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={e => e.preventDefault()} className="space-y-6">
          <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem><FormLabel>Enter Password</FormLabel><FormControl><Input type="text" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
          )} />
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><KeyRound className="h-8 w-8 text-primary" /><CardTitle>Password Strength</CardTitle></div></CardHeader>
            <CardContent>
                 <div className="text-center">
                    <p className={`text-3xl font-bold ${result.strength.color}`}>{result.strength.text}</p>
                    <p className="text-muted-foreground mt-1">
                        Entropy: {result.entropy.toFixed(2)} bits
                    </p>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 mt-4">
                    <div className={`${result.strength.color.replace('text-', 'bg-')} h-2.5 rounded-full`} style={{ width: `${Math.min(100, result.entropy)}%` }}></div>
                </div>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Password</h4>
                    <p>The password you want to analyze. The calculator automatically detects which character sets are used (lowercase, uppercase, numbers, symbols).</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                Password entropy is a measure of its unpredictability. It's calculated in "bits." The more bits of entropy, the harder the password is to guess or crack. The calculation is `log₂(R^L)`, where `R` is the size of the character pool (e.g., lowercase, uppercase, numbers, symbols) and `L` is the password length. A higher entropy means an attacker would need to try more combinations, on average, to find your password.
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
