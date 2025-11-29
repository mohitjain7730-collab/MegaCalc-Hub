import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryIcon } from '@/components/category-icon';
import { FINANCE_ARTICLES } from './articles';

const financeSections = [
  {
    name: 'Savings & Investment',
    slug: 'savings-and-investment',
    description: 'In-depth guides covering saving habits, automation, and investing fundamentals.',
    icon: 'PiggyBank',
    count: FINANCE_ARTICLES.length,
  },
  {
    name: 'Retirement Planning',
    slug: 'retirement-planning',
    description: 'Comprehensive guides on retirement planning, 401(k), IRAs, and long-term financial security.',
    icon: 'Target',
    count: 0,
  },
  {
    name: 'Budgeting & Personal Finance',
    slug: 'budgeting-personal-finance',
    description: 'Learn how to create budgets, track expenses, and manage your personal finances effectively.',
    icon: 'Scale',
    count: 0,
  },
  {
    name: 'Taxes & Tax Planning',
    slug: 'taxes-tax-planning',
    description: 'Understand tax strategies, deductions, credits, and year-round tax planning.',
    icon: 'FileText',
    count: 0,
  },
  {
    name: 'Credit & Debt Management',
    slug: 'credit-debt-management',
    description: 'Master credit scores, debt payoff strategies, and responsible credit card usage.',
    icon: 'CreditCard',
    count: 0,
  },
  {
    name: 'Insurance & Risk Management',
    slug: 'insurance-risk-management',
    description: 'Navigate health, life, auto, and property insurance to protect your financial future.',
    icon: 'Shield',
    count: 0,
  },
  {
    name: 'Banking & Accounts',
    slug: 'banking-accounts',
    description: 'Choose the right bank accounts, understand fees, and optimize your banking strategy.',
    icon: 'Landmark',
    count: 0,
  },
  {
    name: 'Real Estate & Mortgages',
    slug: 'real-estate-mortgages',
    description: 'Everything about buying a home, mortgages, refinancing, and real estate investing.',
    icon: 'Home',
    count: 0,
  },
  {
    name: 'Loans & Lending',
    slug: 'loans-lending',
    description: 'Compare loan options, understand interest rates, and make informed borrowing decisions.',
    icon: 'Handshake',
    count: 0,
  },
  {
    name: 'Stocks & Securities',
    slug: 'stocks-securities',
    description: 'Learn about stock investing, market analysis, and building a diversified portfolio.',
    icon: 'TrendingUp',
    count: 0,
  },
  {
    name: 'Mutual Funds & ETFs',
    slug: 'mutual-funds-etfs',
    description: 'Understand mutual funds, ETFs, index funds, and passive investing strategies.',
    icon: 'PieChart',
    count: 0,
  },
  {
    name: 'Business & Corporate Finance',
    slug: 'business-corporate-finance',
    description: 'Financial management for businesses, cash flow, profitability, and corporate strategies.',
    icon: 'Briefcase',
    count: 0,
  },
  {
    name: 'Financial Ratios & Analysis',
    slug: 'financial-ratios-analysis',
    description: 'Master financial analysis, ratios, valuation methods, and investment metrics.',
    icon: 'BarChart',
    count: 0,
  },
];

export default function FinancePage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/learning-hub">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Learning Hub
            </Link>
          </Button>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Finance
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Explore finance articles and guides.
          </p>
        </div>

        {financeSections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {financeSections.map((section) => (
              <Link
                key={section.slug}
                href={`/learning-hub/finance/${section.slug}`}
                className="group block h-full"
              >
                <Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50">
                  <CardHeader>
                    <CategoryIcon
                      name={section.icon}
                      className="h-8 w-8 mb-4 text-primary"
                      strokeWidth={1.5}
                    />
                    <CardTitle className="text-lg">{section.name}</CardTitle>
                    <CardDescription className="pt-1">
                      {section.description}
                    </CardDescription>
                    <p className="text-sm text-muted-foreground mt-3">
                      {section.count ?? 0} {section.count === 1 ? 'article' : 'articles'}
                    </p>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="w-full text-center shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold">
                Coming soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground">
                Finance content is coming soon. Check back later!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


