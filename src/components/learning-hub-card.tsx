
'use client';

import Link from 'next/link';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';
import type { LearningHubArticle } from '@/lib/learning-hub-articles';
import { CategoryIcon } from '@/components/category-icon';

export function LearningHubCard({ slug, title, Icon, content }: LearningHubArticle) {
  // Create a short preview of the content
  const preview = content.replace(/<[^>]*>/g, '').split(' ').slice(0, 20).join(' ') + '...';

  return (
    <Link href={`/learning-hub/${slug}`} className="group block h-full">
      <Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50">
        <CardHeader>
          <CategoryIcon name={Icon} className="h-8 w-8 mb-4 text-primary" strokeWidth={1.5} />
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{preview}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
