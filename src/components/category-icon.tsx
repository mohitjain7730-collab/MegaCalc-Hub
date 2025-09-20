import { icons } from '@/lib/categories';
import { LucideProps } from 'lucide-react';

type CategoryIconProps = {
    name: string;
} & LucideProps;

export function CategoryIcon({ name, ...props }: CategoryIconProps) {
    const Icon = icons[name];
    return Icon ? <Icon {...props} /> : null;
}
