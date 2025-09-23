'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const fixtureUnits = {
  kitchenSink: 2,
  bathroomSink: 1,
  dishwasher: 2,
  washingMachine: 4,
  toilet: 3,
  shower: 2,
  bathtub: 4,
  hoseBibb: 5,
};

type Fixture = keyof typeof fixtureUnits;

const formSchema = z.object({
  fixtures: z.array(z.string()).refine(value => value.some(item => item), {
    message: "You have to select at least one fixture.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function WaterUsagePlumbingFlowCalculator() {
  const [result, setResult] = useState<{ wsfu: number; demandGPM: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fixtures: [],
    },
  });

  const onSubmit = (data: FormValues) => {
    const totalWSFU = data.fixtures.reduce((acc, fixture) => acc + fixtureUnits[fixture as Fixture], 0);
    
    // Hunter's Curve approximation for converting WSFU to GPM demand
    let demandGPM = 0;
    if (totalWSFU <= 30) {
        demandGPM = 0.966 * Math.pow(totalWSFU, 0.635);
    } else {
        demandGPM = 2.45 * Math.pow(totalWSFU, 0.44);
    }
    
    setResult({ wsfu: totalWSFU, demandGPM });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="fixtures"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">Fixtures</FormLabel>
                   <CardDescription>Select all the water fixtures in your home.</CardDescription>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.keys(fixtureUnits).map((fixtureId) => (
                    <FormField
                      key={fixtureId}
                      control={form.control}
                      name="fixtures"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={fixtureId}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(fixtureId)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, fixtureId])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== fixtureId
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {fixtureId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Droplets className="h-8 w-8 text-primary" />
              <CardTitle>Estimated Water Demand</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-lg space-y-2">
                <li><strong>Total Water Supply Fixture Units (WSFU):</strong> {result.wsfu}</li>
                <li><strong>Peak Demand:</strong> {result.demandGPM.toFixed(2)} Gallons Per Minute (GPM)</li>
            </ul>
            <CardDescription className='mt-4'>
                This peak demand helps in sizing your main water supply line. A 3/4" pipe typically handles up to 10-15 GPM, while a 1" pipe handles more. Consult a licensed plumber.
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
