
'use client';

import { ArrowUp } from 'lucide-react';

const BmiScale = () => {
    const categories = [
        { name: 'Underweight', range: '< 18.5', min: 10, max: 18.5, color: 'bg-yellow-400' },
        { name: 'Normal', range: '18.5 - 24.9', min: 18.5, max: 25, color: 'bg-green-500' },
        { name: 'Overweight', range: '25 - 29.9', min: 25, max: 30, color: 'bg-orange-500' },
        { name: 'Obese', range: '30+', min: 30, max: 40, color: 'bg-red-500' },
    ];
    
    const totalRange = 30; // from 10 to 40
    
    return (
        <div className="w-full my-6 not-prose">
            <div className="relative h-8 w-full flex rounded-full overflow-hidden">
                {categories.map((cat, index) => (
                    <div key={index} className={`${cat.color} h-full`} style={{ width: `${((cat.max - cat.min) / totalRange) * 100}%` }}></div>
                ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                 {categories.map((cat, index) => (
                    <div key={index} className="flex flex-col items-center text-center">
                        <span className='font-bold'>{cat.name}</span>
                        <span>{cat.range}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export function BmiChart() {
    return <BmiScale />;
}
