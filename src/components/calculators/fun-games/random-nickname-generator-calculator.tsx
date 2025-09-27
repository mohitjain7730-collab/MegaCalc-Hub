
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, UserCheck } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  name: z.string().min(1, "Please enter a name."),
});

type FormValues = z.infer<typeof formSchema>;

const adjectives = ["Captain", "The", "Doctor", "Professor", "Agent", "Mister", "Major", "General"];
const nouns = ["Sparkle", "Flash", "Blaze", "Shadow", "Bolt", "Storm", "Viper", "Cobra", "Dragon", "Comet"];

export default function RandomNicknameGeneratorCalculator() {
  const [nickname, setNickname] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '' },
  });

  const generateNickname = (name: string) => {
    if (!name) {
      setNickname(null);
      return;
    }
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    setNickname(`${adj} ${name} ${noun}`);
  };

  const onSubmit = (values: FormValues) => {
    generateNickname(values.name);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Your First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="flex gap-2">
            <Button type="submit">Generate Nickname</Button>
            <Button type="button" variant="outline" onClick={() => generateNickname(form.getValues('name'))}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Another
            </Button>
          </div>
        </form>
      </Form>
      
      {nickname && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><UserCheck className="h-8 w-8 text-primary" /><CardTitle>Your Awesome Nickname</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-4xl font-bold text-center">{nickname}</p>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator simply takes your first name and combines it with a randomly selected adjective and noun from a predefined list to create a fun, action-hero-style nickname.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
