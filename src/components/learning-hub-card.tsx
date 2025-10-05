
'use client';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';
import type { LearningHubArticle } from '@/lib/learning-hub-articles';
import { icons } from '@/lib/categories';
import { LucideProps } from 'lucide-react';

const CategoryIcon = ({ name, ...props }: { name: string } & LucideProps) => {
    const Icon = icons[name];
    return Icon ? <Icon {...props} /> : null;
};


export function LearningHubCard({ title, Icon, content }: LearningHubArticle) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CategoryIcon name={Icon} className="h-8 w-8 mb-4 text-primary" strokeWidth={1.5} />
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: content }} />
      </CardContent>
    </Card>
  );
}
