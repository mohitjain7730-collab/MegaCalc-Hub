import type { LucideIcon } from 'lucide-react';
import {
  Landmark,
  HeartPulse,
  Home,
  Construction,
  BookOpen,
  Laptop,
  Plane,
  ChefHat,
  Leaf,
  PiggyBank,
  Briefcase,
  Bitcoin,
  Baby,
  Dumbbell,
  Paintbrush,
  Calendar,
  Sprout,
  Gamepad2,
  BarChart,
  Shapes,
  BrainCircuit,
  GitBranch,
} from 'lucide-react';

export interface Category {
  name: string;
  slug: string;
  description: string;
  Icon: string;
}

export const icons: {[key: string]: LucideIcon} = {
  Landmark,
  HeartPulse,
  Home,
  Construction,
  BookOpen,
  Laptop,
  Plane,
  ChefHat,
  Leaf,
  PiggyBank,
  Briefcase,
  Bitcoin,
  Baby,
  Dumbbell,
  Paintbrush,
  Calendar,
  Sprout,
  Gamepad2,
  BarChart,
  Shapes,
  BrainCircuit,
  GitBranch,
};

export const categories: Category[] = [
  {
    name: 'Finance',
    slug: 'finance',
    description: 'Calculators for investments, loans, and financial planning.',
    Icon: 'Landmark',
  },
  {
    name: 'Health & Fitness',
    slug: 'health-fitness',
    description: 'Track your fitness goals, BMI, and calorie intake.',
    Icon: 'HeartPulse',
  },
  {
    name: 'Home Improvement',
    slug: 'home-improvement',
    description: 'Plan your next project, from paint to mortgage.',
    Icon: 'Home',
  },
  {
    name: 'Engineering',
    slug: 'engineering',
    description: 'Solve complex engineering problems and conversions.',
    Icon: 'Construction',
  },
  {
    name: 'Cognitive & Psychology',
    slug: 'cognitive-psychology',
    description: 'Explore aspects of cognition and personality.',
    Icon: 'BrainCircuit',
  },
  {
    name: 'Genetic & Ancestry',
    slug: 'genetic-ancestry',
    description: 'Explore your heritage and genetic traits with these tools.',
    Icon: 'GitBranch',
  },
  {
    name: 'Education',
    slug: 'education',
    description: 'Tools for students and teachers, from grades to study time.',
    Icon: 'BookOpen',
  },
  {
    name: 'Technology',
    slug: 'technology',
    description: 'Calculators for data storage, bandwidth, and more.',
    Icon: 'Laptop',
  },
  {
    name: 'Travel & Distance',
    slug: 'travel-distance',
    description: 'Plan your trips with fuel cost and distance calculators.',
    Icon: 'Plane',
  },
  {
    name: 'Cooking & Food',
    slug: 'cooking-food',
    description: 'Convert recipes and manage your culinary creations.',
    Icon: 'ChefHat',
  },
  {
    name: 'Environment',
    slug: 'environment',
    description: 'Calculate your carbon footprint and environmental impact.',
    Icon: 'Leaf',
  },
  {
    name: 'Personal Budgeting',
    slug: 'personal-budgeting',
    description: 'Manage your personal finances and savings goals.',
    Icon: 'PiggyBank',
  },
  {
    name: 'Business & Startup',
    slug: 'business-startup',
    description: 'Calculators for profit margin, breakeven, and more.',
    Icon: 'Briefcase',
  },
  {
    name: 'Crypto & Web3',
    slug: 'crypto-web3',
    description: 'Track your crypto assets and blockchain metrics.',
    Icon: 'Bitcoin',
  },
  {
    name: 'Parenting',
    slug: 'parenting',
    description: 'Calculators for pregnancy, child growth, and costs.',
    Icon: 'Baby',
  },
  {
    name: 'Sports & Training',
    slug: 'sports-training',
    description: 'Optimize your training with pace and performance calculators.',
    Icon: 'Dumbbell',
  },
  {
    name: 'DIY & Crafts',
    slug: 'diy-crafts',
    description: 'Tools for your creative projects and material needs.',
    Icon: 'Paintbrush',
  },
  {
    name: 'Time & Date',
    slug: 'time-date',
    description: 'Calculate durations, time zones, and important dates.',
    Icon: 'Calendar',
  },
  {
    name: 'Gardening',
    slug: 'gardening',
    description: 'Plan your garden with planting and soil calculators.',
    Icon: 'Sprout',
  },
  {
    name: 'Fun & Games',
    slug: 'fun-games',
    description: 'Calculators for gaming, hobbies, and entertainment.',
    Icon: 'Gamepad2',
  },
  {
    name: 'Data & Statistics',
    slug: 'data-statistics',
    description: 'Tools for statistical analysis and data manipulation.',
    Icon: 'BarChart',
  },
  {
    name: 'Miscellaneous',
    slug: 'miscellaneous',
    description: 'A collection of various other useful calculators.',
    Icon: 'Shapes',
  },
];
