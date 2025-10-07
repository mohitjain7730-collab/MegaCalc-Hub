
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, PlusCircle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

const foodItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  iron: z.number().positive("Must be > 0"),
  servings: z.number().int().positive("Must be > 0").default(1),
});

const profileSchema = z.object({
  age: z.number().int().min(1).max(120),
  sex: z.enum(['male', 'female']),
  lifeStage: z.enum(['none', 'pregnant', 'lactating']),
});

const formSchema = z.object({
  profile: profileSchema,
  newFood: foodItemSchema.omit({ name: true }).extend({ name: z.string() }), // Allow empty name initially
  foodLog: z.array(foodItemSchema),
});

type FormValues = z.infer<typeof formSchema>;

// RDA values in mg/day based on NIH recommendations
const ironRDAs = {
    male: { '1-3': 7, '4-8': 10, '9-13': 8, '14-18': 11, '19-50': 8, '51+': 8 },
    female: { '1-3': 7, '4-8': 10, '9-13': 8, '14-18': 15, '19-50': 18, '51+': 8 },
    pregnant: { any: 27 },
    lactating: { '14-18': 10, '19+': 9 }
};

const getAgeCategory = (age: number, lifeStage: string) => {
    if (lifeStage === 'lactating') {
        return age <= 18 ? '14-18' : '19+';
    }
    if (age <= 3) return '1-3';
    if (age <= 8) return '4-8';
    if (age <= 13) return '9-13';
    if (age <= 18) return '14-18';
    if (age <= 50) return '19-50';
    return '51+';
};

export default function IronIntakeCalculator() {
  const [rda, setRda] = useState<number>(8);
  const [totalIron, setTotalIron] = useState<number>(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profile: { age: 30, sex: 'female', lifeStage: 'none' },
      newFood: { name: '', iron: undefined, servings: 1 },
      foodLog: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "foodLog"
  });
  
  const profile = form.watch('profile');
  const foodLog = form.watch('foodLog');

  useEffect(() => {
    const { age, sex, lifeStage } = profile;
    if (!age) return;

    let newRda = 8;
    const ageCategory = getAgeCategory(age, lifeStage);

    if (lifeStage === 'pregnant') {
      newRda = ironRDAs.pregnant.any;
    } else if (lifeStage === 'lactating' && sex === 'female') {
      newRda = ironRDAs.lactating[ageCategory as keyof typeof ironRDAs.lactating] || ironRDAs.lactating['19+'];
    } else {
      newRda = ironRDAs[sex][ageCategory as keyof typeof ironRDAs.male] || ironRDAs[sex]['19-50'];
    }
    setRda(newRda);
  }, [profile]);
  
  useEffect(() => {
    const total = foodLog.reduce((sum, item) => sum + (item.iron || 0) * (item.servings || 0), 0);
    setTotalIron(total);
  }, [foodLog]);

  const handleAddFood = () => {
    const newFood = form.getValues('newFood');
    if (newFood.name.trim() && newFood.iron && newFood.iron > 0 && newFood.servings && newFood.servings > 0) {
        append({ name: newFood.name, iron: newFood.iron, servings: newFood.servings });
        form.resetField('newFood');
        form.setValue('newFood', { name: '', iron: undefined, servings: 1 });
    } else {
        if (!newFood.name.trim()) form.setError('newFood.name', { message: 'Enter a valid name.'});
        if (!newFood.iron || newFood.iron <= 0) form.setError('newFood.iron', { message: 'Enter a valid amount.'});
        if (!newFood.servings || newFood.servings <= 0) form.setError('newFood.servings', { message: 'Enter a valid amount.'});
    }
  };
  
  const percentageOfRda = rda > 0 ? (totalIron / rda) * 100 : 0;

  return (
    <div className="space-y-8">
       <Card>
        <CardHeader><CardTitle>Your Profile</CardTitle></CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="profile.age" render={({ field }) => (
                    <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="profile.sex" render={({ field }) => (
                     <FormItem><FormLabel>Sex</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="female">Female</SelectItem><SelectItem value="male">Male</SelectItem></SelectContent></Select></FormItem>
                )} />
                {profile.sex === 'female' && (
                  <FormField control={form.control} name="profile.lifeStage" render={({ field }) => (
                     <FormItem><FormLabel>Special Condition</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="pregnant">Pregnant</SelectItem><SelectItem value="lactating">Lactating</SelectItem></SelectContent></Select></FormItem>
                  )} />
                )}
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Add Food to Log</CardTitle></CardHeader>
        <CardContent>
             <div className="grid grid-cols-[1fr,100px,80px,auto] gap-2 items-end">
                <FormField control={form.control} name="newFood.name" render={({ field }) => ( <FormItem><FormLabel>Food Item</FormLabel><FormControl><Input placeholder="e.g., Spinach, cooked" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="newFood.iron" render={({ field }) => ( <FormItem><FormLabel>Iron (mg)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g., 2.7" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="newFood.servings" render={({ field }) => ( <FormItem><FormLabel>Servings</FormLabel><FormControl><Input type="number" step="0.5" placeholder="1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem> )} />
                <Button type="button" onClick={handleAddFood}>Add</Button>
            </div>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader><div className='flex items-center gap-4'><Utensils className="h-8 w-8 text-primary" /><CardTitle>Daily Iron Summary</CardTitle></div></CardHeader>
          <CardContent>
              <div className="space-y-4">
                  <div>
                      <p><strong>Total Iron Intake:</strong> {totalIron.toFixed(1)} mg</p>
                      <p><strong>Your Recommended Daily Allowance (RDA):</strong> {rda} mg</p>
                  </div>
                  <div>
                    <Progress value={percentageOfRda} className="w-full h-4" />
                    <p className="text-sm text-center mt-1">{Math.round(percentageOfRda)}% of RDA</p>
                  </div>

                  {fields.length > 0 && (
                      <div>
                          <h4 className="font-semibold mb-2">Logged Food:</h4>
                          <ul className="list-disc pl-5 space-y-1">
                              {fields.map((item, index) => (
                                  <li key={item.id} className="flex justify-between items-center">
                                      <span>{item.name} ({foodLog[index]?.servings} serving{foodLog[index]?.servings > 1 ? 's' : ''}) - <strong>{((foodLog[index]?.iron || 0) * (foodLog[index]?.servings || 0)).toFixed(1)} mg</strong></span>
                                      <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                                          <XCircle className="h-4 w-4 text-destructive" />
                                      </Button>
                                  </li>
                              ))}
                          </ul>
                      </div>
                  )}
              </div>
          </CardContent>
      </Card>
    </div>
  );
}

    