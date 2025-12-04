import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calculator, BookOpen, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CategoryIcon } from '@/components/category-icon';
import { SitemapLink } from '@/components/sitemap-link';
import { categories } from '@/lib/categories';
import { calculators } from '@/lib/calculators';
import { getFinanceArticles, getRetirementArticlesList } from '@/app/learning-hub/finance/articles';
import { getNutritionArticles } from '@/app/learning-hub/health/nutrition-diet/articles';
import { articles as LEARNING_HUB_BASE_ARTICLES } from '@/lib/learning-hub-articles';

export const metadata: Metadata = {
  title: 'Sitemap - Mycalculating.com',
  description: 'Complete sitemap of all calculators and learning hub articles organized by category and topic.',
};

export default function SitemapPage() {
  const FINANCE_ARTICLES = getFinanceArticles();
  const RETIREMENT_ARTICLES = getRetirementArticlesList();
  const NUTRITION_ARTICLES = getNutritionArticles();
  // Group calculators by category
  const calculatorsByCategory = categories.map((category) => ({
    category,
    calculators: calculators.filter((calc) => calc.category === category.slug),
  })).filter((group) => group.calculators.length > 0);

  // Finance sections (all sections from finance page)
  const financeSections = [
    {
      name: 'Savings & Investment',
      slug: 'savings-and-investment',
      articles: FINANCE_ARTICLES.map((article) => ({
        title: article.title,
        slug: article.slug,
        url: `/learning-hub/finance/${article.slug}`,
      })),
    },
    {
      name: 'Retirement Planning',
      slug: 'retirement-planning',
      articles: RETIREMENT_ARTICLES.map((article) => ({
        title: article.title,
        slug: article.slug,
        url: `/learning-hub/finance/${article.slug}`,
      })),
    },
    {
      name: 'Budgeting & Personal Finance',
      slug: 'budgeting-personal-finance',
      articles: [],
    },
    {
      name: 'Taxes & Tax Planning',
      slug: 'taxes-tax-planning',
      articles: [],
    },
    {
      name: 'Credit & Debt Management',
      slug: 'credit-debt-management',
      articles: [],
    },
    {
      name: 'Insurance & Risk Management',
      slug: 'insurance-risk-management',
      articles: [],
    },
    {
      name: 'Banking & Accounts',
      slug: 'banking-accounts',
      articles: [],
    },
    {
      name: 'Real Estate & Mortgages',
      slug: 'real-estate-mortgages',
      articles: [],
    },
    {
      name: 'Loans & Lending',
      slug: 'loans-lending',
      articles: [],
    },
    {
      name: 'Stocks & Securities',
      slug: 'stocks-securities',
      articles: [],
    },
    {
      name: 'Mutual Funds & ETFs',
      slug: 'mutual-funds-etfs',
      articles: [],
    },
    {
      name: 'Business & Corporate Finance',
      slug: 'business-corporate-finance',
      articles: [],
    },
    {
      name: 'Financial Ratios & Analysis',
      slug: 'financial-ratios-analysis',
      articles: [],
    },
  ];

  // Health sections (all sections from health page)
  const healthSections = [
    {
      name: 'Nutrition & Diet',
      slug: 'nutrition-diet',
      articles: NUTRITION_ARTICLES.map((article) => ({
        title: article.title,
        slug: article.slug,
        url: `/learning-hub/health/nutrition-diet/${article.slug}`,
      })),
    },
    {
      name: 'Weight & Metabolism',
      slug: 'weight-metabolism',
      articles: [],
    },
    {
      name: 'Fitness & Sports',
      slug: 'fitness-sports',
      articles: [],
    },
    {
      name: 'Body Composition',
      slug: 'body-composition',
      articles: [],
    },
    {
      name: "Women's Health",
      slug: 'womens-health',
      articles: [],
    },
    {
      name: 'Medical Risk Scores',
      slug: 'medical-risk-scores',
      articles: [],
    },
    {
      name: 'Mental Health & Sleep',
      slug: 'mental-health-sleep',
      articles: [],
    },
    {
      name: 'Longevity & Wellness',
      slug: 'longevity-wellness',
      articles: [],
    },
  ];

  // Group articles by topic
  const articlesByTopic = [
    {
      topic: 'Finance',
      topicUrl: '/learning-hub/finance',
      sections: financeSections,
    },
    {
      topic: 'Health',
      topicUrl: '/learning-hub/health',
      sections: healthSections,
    },
    {
      topic: 'General',
      topicUrl: '/learning-hub',
      sections: [
        {
          name: 'Learning Hub Articles',
          slug: 'general',
          articles: LEARNING_HUB_BASE_ARTICLES.map((article) => ({
            title: article.title,
            slug: article.slug,
            url: `/learning-hub/${article.slug}`,
          })),
        },
      ],
    },
  ];

  const totalCalculators = calculators.length;
  const totalArticles = 
    FINANCE_ARTICLES.length + 
    RETIREMENT_ARTICLES.length + 
    NUTRITION_ARTICLES.length + 
    LEARNING_HUB_BASE_ARTICLES.length;

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-3 sm:p-4 md:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <Button asChild variant="ghost" className="mb-3 sm:mb-4 text-sm sm:text-base">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              Sitemap
            </h1>
          </div>
          <p className="mt-2 text-sm sm:text-base md:text-lg text-muted-foreground">
            Complete directory of all calculators and learning hub articles. This page automatically updates when new content is added.
          </p>
          <div className="mt-3 sm:mt-4 flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 sm:gap-2">
              <Calculator className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {totalCalculators} Calculators
            </span>
            <span className="flex items-center gap-1.5 sm:gap-2">
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {totalArticles} Articles
            </span>
          </div>
        </div>

        {/* Calculators Section */}
        <section className="mb-8 sm:mb-12">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Calculator className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Calculators</h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-1">
            All calculators organized by category
          </p>
          
          <Accordion type="multiple" className="w-full space-y-3 sm:space-y-4 md:space-y-6">
            {calculatorsByCategory.map(({ category, calculators: categoryCalculators }) => (
              <AccordionItem key={category.slug} value={category.slug} className="border rounded-lg overflow-hidden">
                <Card className="border-0 shadow-none">
                  <CardHeader className="bg-muted/50 p-3 sm:p-4 md:p-6">
                    <AccordionTrigger className="hover:no-underline py-2 sm:py-3">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 text-left">
                        <CategoryIcon
                          name={category.Icon}
                          className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0"
                          strokeWidth={1.5}
                        />
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg md:text-xl truncate">{category.name}</CardTitle>
                          <CardDescription className="text-xs sm:text-sm mt-0.5 sm:mt-1">
                            {category.description} • {categoryCalculators.length} calculator{categoryCalculators.length !== 1 ? 's' : ''}
                          </CardDescription>
                        </div>
                      </div>
                    </AccordionTrigger>
                  </CardHeader>
                  <AccordionContent>
                    <CardContent className="pt-3 sm:pt-4 md:pt-6 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                        {categoryCalculators.map((calc) => (
                          <Link
                            key={calc.id}
                            href={`/category/${category.slug}/${calc.slug}`}
                            className="group block p-2.5 sm:p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 min-h-[60px] sm:min-h-[70px] flex flex-col justify-center"
                          >
                            <h3 className="font-semibold text-xs sm:text-sm group-hover:text-primary transition-colors leading-tight">
                              {calc.name}
                            </h3>
                            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                              {calc.description}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Articles Section */}
        <section className="mb-8 sm:mb-12">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Learning Hub Articles</h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-1">
            All articles organized by topic and section
          </p>

          <Accordion type="multiple" className="w-full space-y-3 sm:space-y-4 md:space-y-6">
            {articlesByTopic.map((topic) => {
              const totalArticles = topic.sections.reduce((sum, section) => sum + section.articles.length, 0);
              const totalSections = topic.sections.length;
              return (
                <AccordionItem key={topic.topic} value={topic.topic} className="border rounded-lg overflow-hidden">
                  <Card className="border-0 shadow-none">
                    <CardHeader className="bg-muted/50 p-3 sm:p-4 md:p-6">
                      <AccordionTrigger className="hover:no-underline py-2 sm:py-3">
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base sm:text-lg md:text-xl">{topic.topic}</CardTitle>
                            <SitemapLink
                              href={topic.topicUrl}
                              className="text-xs text-primary hover:underline"
                            >
                              View Topic →
                            </SitemapLink>
                          </div>
                          <CardDescription className="text-xs sm:text-sm mt-0.5 sm:mt-1">
                            {totalSections} {totalSections === 1 ? 'section' : 'sections'} • {totalArticles} {totalArticles === 1 ? 'article' : 'articles'}
                          </CardDescription>
                        </div>
                      </AccordionTrigger>
                    </CardHeader>
                    <AccordionContent>
                      <CardContent className="pt-3 sm:pt-4 md:pt-6 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                        <Accordion type="multiple" className="w-full space-y-4 sm:space-y-6">
                          {topic.sections.map((section) => {
                            const sectionUrl = topic.topic === 'Finance' 
                              ? `/learning-hub/finance/${section.slug}`
                              : topic.topic === 'Health'
                              ? `/learning-hub/health/${section.slug}`
                              : null;
                            return (
                              <AccordionItem key={section.slug} value={section.slug} className="border-b last:border-b-0">
                                <AccordionTrigger className="hover:no-underline py-2 sm:py-3">
                                  <div className="flex-1 text-left">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground">
                                        {section.name}
                                      </h3>
                                      {sectionUrl && (
                                        <SitemapLink
                                          href={sectionUrl}
                                          className="text-xs text-primary hover:underline"
                                        >
                                          View Section →
                                        </SitemapLink>
                                      )}
                                    </div>
                                    <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                                      {section.articles.length} {section.articles.length === 1 ? 'article' : 'articles'}
                                    </span>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  {section.articles.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 pt-2 sm:pt-3">
                                      {section.articles.map((article) => (
                                        <Link
                                          key={article.slug}
                                          href={article.url}
                                          className="group block p-2.5 sm:p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 min-h-[44px] flex items-center"
                                        >
                                          <h4 className="font-semibold text-xs sm:text-sm group-hover:text-primary transition-colors leading-tight">
                                            {article.title}
                                          </h4>
                                        </Link>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="pt-2 sm:pt-3 text-sm text-muted-foreground">
                                      No articles yet. Check back soon!
                                    </div>
                                  )}
                                </AccordionContent>
                              </AccordionItem>
                            );
                          })}
                        </Accordion>
                      </CardContent>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              );
            })}
          </Accordion>
        </section>

        {/* Quick Links */}
        <section className="mb-8 sm:mb-12">
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-base sm:text-lg md:text-xl">Quick Links</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Navigate to main sections</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                <Button asChild variant="outline" className="justify-start h-auto py-2.5 sm:py-3 text-sm sm:text-base">
                  <Link href="/">
                    <Calculator className="mr-2 h-4 w-4" />
                    Home
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start h-auto py-2.5 sm:py-3 text-sm sm:text-base">
                  <Link href="/calculators">
                    <Calculator className="mr-2 h-4 w-4" />
                    All Calculators
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start h-auto py-2.5 sm:py-3 text-sm sm:text-base">
                  <Link href="/learning-hub">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Learning Hub
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

