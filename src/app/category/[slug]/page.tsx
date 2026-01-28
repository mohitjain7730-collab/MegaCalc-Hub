

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { categories } from '@/lib/categories';
import { CategoryIcon } from '@/components/category-icon';
import { getCalculatorsByCategory } from '@/lib/calculator-data-utils';
import { CategorySearch } from '@/components/category-search';
import { generateCategorySchema } from '@/lib/schema-generator';
import { CategoryCard } from '@/components/category-card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const categorySeoContent: Record<
  string,
  {
    intro: string;
    detailed: string;
    faqs: { question: string; answer: string }[];
  }
> = {
  finance: {
    intro:
      'Our finance calculators help you plan investments, understand loans, and make smarter day‑to‑day money decisions.',
    detailed:
      'The finance calculators category on MyCalculating.com is designed to give you clear, practical answers to everyday money questions. Whether you are planning a long‑term investment, comparing different loan options, or trying to understand how interest affects your savings, these tools turn complex formulas into simple, interactive experiences. Each calculator is built to be fast, intuitive, and backed by sound financial logic so that you can trust the numbers you see on the screen. ' +
      'Instead of wrestling with spreadsheets or guessing at future outcomes, you can quickly test different scenarios by adjusting a few inputs. This makes it easier to see how small changes in interest rates, repayment periods, or contribution amounts can add up over time. You can use these insights to refine your monthly budget, improve your saving habits, or check if a big decision like refinancing or taking a personal loan truly fits your situation. ' +
      'The category covers topics such as EMI, compound interest, investment returns, budgeting, and more, so you get a wide view of your financial life in one place. Every calculator focuses on clarity first—labels are simple, results are explained, and extra information is provided where needed so both beginners and more experienced users can benefit. Over time, using these tools regularly can help you develop a more confident, data‑driven approach to handling your money. ' +
      'Whether you are just starting out with basic financial planning or fine‑tuning an existing strategy, the finance calculators category gives you a reliable companion for exploring “what if” questions and making informed decisions with less stress.',
    faqs: [
      {
        question: 'Who should use the finance calculators?',
        answer:
          'Anyone who wants clearer insight into loans, savings, investments, or monthly budgeting can benefit, from beginners to experienced planners.',
      },
      {
        question: 'Are the results from these calculators exact?',
        answer:
          'The tools use standard financial formulas and provide accurate estimates, but real‑world outcomes may vary based on fees, taxes, and lender‑specific terms.',
      },
      {
        question: 'Do I need finance knowledge to use these tools?',
        answer:
          'No. Each calculator is built to be beginner‑friendly with clear labels, helpful defaults, and easy‑to‑understand outputs.',
      },
      {
        question: 'Can I compare different scenarios?',
        answer:
          'Yes, you can quickly adjust inputs like interest rate, tenure, or contribution amount to see how different choices affect your final result.',
      },
      {
        question: 'Are these calculators free to use?',
        answer: 'Yes, all finance calculators on MyCalculating.com are completely free with no sign‑up required.',
      },
    ],
  },
  gaming: {
    intro:
      'Gaming calculators on MyCalculating.com turn in‑game maths into quick answers so you can focus on strategy, not spreadsheets.',
    detailed:
      'The gaming calculators category is built for players who want to understand the numbers behind their favourite titles without getting lost in complex formulas. Whether you are optimising a Minecraft farm, planning trades in Roblox, or squeezing out a little more performance in a competitive shooter, these tools help you make smarter in‑game decisions in seconds. Each calculator focuses on a very specific gaming scenario—such as resource efficiency, experience gain, trading value, or damage output—so the inputs feel natural and the results are immediately useful while you play. ' +
      'Instead of manually crunching numbers, you can plug in your current setup, test a few variations, and instantly see which option gives you the best outcome. This is especially powerful in games where small optimisations compound over long sessions, like survival sandboxes, trading economies, and progression‑based RPG or FPS games. By turning trial‑and‑error into clear calculations, you save time and reduce the guesswork that often leads to wasted resources or missed opportunities. ' +
      'The tools are designed to be fast, responsive, and mobile‑friendly so you can use them alongside your game on another screen or device. Explanations and labels avoid heavy jargon and instead mirror the language players already use in the community. As a result, even younger gamers or casual players can understand why one setup is better than another. ' +
      'Whether you are planning a long‑term world in Minecraft, fine‑tuning your Roblox trading strategy, or simply curious about the maths behind your favourite mechanics, the gaming calculators category makes optimisation approachable, fun, and easy to revisit whenever a new idea or build comes to mind.',
    faqs: [
      {
        question: 'Which games are covered in the gaming calculators?',
        answer:
          'The category currently focuses on popular titles like Minecraft, Roblox, and other strategy or progression‑based games, with new tools added over time.',
      },
      {
        question: 'Are these tools allowed for all games?',
        answer:
          'These calculators only process numbers you enter and do not interact with game files or servers, so they are safe and compliant with normal gameplay.',
      },
      {
        question: 'Can I use the calculators while gaming?',
        answer:
          'Yes. The tools are designed to work well on desktop, laptop, or mobile so you can keep them open on a second screen while you play.',
      },
      {
        question: 'Do I need advanced maths to use them?',
        answer:
          'No. You just input simple values from your game and the calculator handles the maths, giving you clear, actionable results.',
      },
      {
        question: 'How often are new gaming calculators added?',
        answer:
          'New tools are added gradually based on demand and usefulness, especially for popular mechanics, items, or strategies in major games.',
      },
    ],
  },
};

// Use ISR for category pages - faster builds while maintaining LCP performance
export const revalidate = 3600; // Revalidate every hour
export const dynamicParams = true; // Allow dynamic params for on-demand generation

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} Calculators - Mycalculating.com`,
    description: category.description,
    alternates: {
      canonical: `/category/${category.slug}`,
    },
  };
}

export async function generateStaticParams() {
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  // Special handling for "Others" category - show all other categories
  if (category.slug === 'others') {
    const otherCategories = categories.filter(
      (c) => c.slug !== 'finance' && c.slug !== 'others'
    );

    return (
      <>
        <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
          <div className="w-full max-w-4xl">
            <div className="mb-6 sm:mb-8">
              <Button asChild variant="ghost" className='mb-3 sm:mb-4 text-sm sm:text-base'>
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
              <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4'>
                <CategoryIcon name={category.Icon} className="h-10 w-10 sm:h-12 sm:w-12 text-primary flex-shrink-0" strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground break-words">
                    {category.name}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1 break-words">{category.description}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {otherCategories.map((cat) => (
                <CategoryCard key={cat.slug} {...cat} />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  const categoryCalculators = await getCalculatorsByCategory(category.slug);

  return (
    <>
      <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateCategorySchema(category, categoryCalculators))
          }}
        />
        <div className="w-full max-w-4xl">
          <div className="mb-6 sm:mb-8">
            <Button asChild variant="ghost" className='mb-3 sm:mb-4 text-sm sm:text-base'>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4'>
              <CategoryIcon name={category.Icon} className="h-10 w-10 sm:h-12 sm:w-12 text-primary flex-shrink-0" strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground break-words">
                  {category.name}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1 break-words">
                  {category.description}
                </p>
              </div>
            </div>
          </div>

          {/* SEO description + collapsible content for the category */}
          <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {categorySeoContent[category.slug]?.intro ??
                'Browse hand‑picked tools in this category to quickly solve everyday problems, explore ideas, and make informed decisions.'}
            </p>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="details">
                <AccordionTrigger className="text-sm sm:text-base font-semibold">
                  Read detailed overview about this category
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                    {categorySeoContent[category.slug]?.detailed ??
                      'This category on MyCalculating.com brings together calculators that share a common theme, giving you a focused place to explore tools that solve related problems. Each calculator is built to be simple to use, with clear inputs and results that highlight the numbers that matter most. Whether you are planning, optimising, or just exploring “what if” scenarios, you can quickly adjust values, compare outcomes, and return later when your situation changes. Over time, these tools help you make decisions with more confidence and less guesswork by turning complex formulas into straightforward, interactive experiences you can reuse whenever you need them.'}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faqs">
                <AccordionTrigger className="text-sm sm:text-base font-semibold">
                  Frequently asked questions about this category
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {(categorySeoContent[category.slug]?.faqs ?? [
                      {
                        question: `What can I do with the ${category.name} calculators?`,
                        answer:
                          'You can explore different scenarios, adjust key inputs, and quickly see results that help you make more informed day‑to‑day decisions.',
                      },
                      {
                        question: 'Do I need expert knowledge to use these tools?',
                        answer:
                          'No. Each calculator is designed to be beginner‑friendly, with clear labels, helpful defaults, and straightforward outputs.',
                      },
                      {
                        question: 'Are the calculators in this category free?',
                        answer:
                          'Yes, all tools on MyCalculating.com are free to use and do not require creating an account.',
                      },
                      {
                        question: 'Can I access these calculators on mobile?',
                        answer:
                          'Yes, the site is optimised for mobile devices so you can use the calculators on phones and tablets as well as desktops.',
                      },
                    ]).map((faq) => (
                      <div key={faq.question}>
                        <h3 className="font-semibold text-sm sm:text-base text-foreground">
                          {faq.question}
                        </h3>
                        <p className="mt-1 text-sm sm:text-base text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <CategorySearch
            calculators={categoryCalculators}
            categoryName={category.name}
            categorySlug={category.slug}
          />

        </div>
      </div>
    </>
  );
}
