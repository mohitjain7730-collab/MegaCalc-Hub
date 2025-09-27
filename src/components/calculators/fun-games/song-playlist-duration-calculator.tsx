
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, PlusCircle, XCircle } from 'lucide-react';

const songSchema = z.object({
  name: z.string().optional(),
  minutes: z.number().nonnegative("Cannot be negative").optional(),
  seconds: z.number().nonnegative("Cannot be negative").optional(),
});

const formSchema = z.object({
  songs: z.array(songSchema).min(1, "Add at least one song."),
});

type FormValues = z.infer<typeof formSchema>;

function formatDuration(totalSeconds: number) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.round(totalSeconds % 60);
    return `${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'm ' : ''}${seconds}s`;
}

export default function SongPlaylistDurationCalculator() {
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      songs: [ { name: '', minutes: undefined, seconds: undefined } ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "songs"
  });

  const onSubmit = (values: FormValues) => {
    const totalSeconds = values.songs.reduce((sum, song) => {
        const songTotal = (song.minutes || 0) * 60 + (song.seconds || 0);
        return sum + songTotal;
    }, 0);
    setResult(formatDuration(totalSeconds));
  };

  return (
    <div className="space-y-8">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <CardDescription>Add songs and their durations to calculate the total playlist length.</CardDescription>
                <div>
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-[1fr,80px,80px,auto] gap-2 items-start mb-2">
                            <FormField control={form.control} name={`songs.${index}.name`} render={({ field }) => (
                                <FormItem><FormLabel className="sr-only">Title</FormLabel><FormControl><Input placeholder="Song Title (Optional)" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name={`songs.${index}.minutes`} render={({ field }) => (
                                <FormItem><FormLabel className="sr-only">Mins</FormLabel><FormControl><Input type="number" placeholder="Mins" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name={`songs.${index}.seconds`} render={({ field }) => (
                                <FormItem><FormLabel className="sr-only">Secs</FormLabel><FormControl><Input type="number" placeholder="Secs" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                <XCircle className="h-5 w-5 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ name: '', minutes: 0, seconds: 0 })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Song
                    </Button>
                </div>
                <Button type="submit">Calculate Duration</Button>
            </form>
        </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Music className="h-8 w-8 text-primary" /><CardTitle>Total Playlist Duration</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result}</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
