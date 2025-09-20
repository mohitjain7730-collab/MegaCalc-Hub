import { icons } from '@/lib/categories';
import { LucideProps } from 'lucide-react';

type CategoryIconProps = {
    name: string;
} & LucideProps;

const SvgIcon = ({ svg, ...props }: { svg: React.ReactNode } & LucideProps) => {
    return <span {...props}>{svg}</span>;
}

const TrowelIcon = (props: LucideProps) => (
  <SvgIcon {...props} svg={
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m14 11 7.2-7.2c.6-.6.6-1.5 0-2.1L19.1 0c-.6-.6-1.5-.6-2.1 0L9.8 7.2"/>
        <path d="M5.1 11.2c-1.3 1.3-1.3 3.4 0 4.7l.9.9c1.3 1.3 3.4 1.3 4.7 0l1.9-1.9"/>
        <path d="M12.5 10.5 8 15"/>
    </svg>
  } />
);

export function CategoryIcon({ name, ...props }: CategoryIconProps) {
    if (name === 'Trowel') {
        return <TrowelIcon {...props} />;
    }
    const Icon = icons[name];
    return Icon ? <Icon {...props} /> : null;
}
