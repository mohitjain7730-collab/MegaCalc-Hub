import Link from 'next/link';
import { Egg, ArrowRight, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RobloxEggHatchOddsSimulatorInteractive from './roblox-egg-hatch-odds-simulator-interactive';

const relatedCalculators = [
  {
    name: '(Roblox) Pet Value Calculator',
    slug: 'roblox-pet-value-calculator',
    description: 'Check values for the pets you hatch.',
  },
  {
    name: '(Roblox) Pet Simulator 99 Value',
    slug: 'roblox-pet-simulator-99-pet-value-calculator',
    description: 'Specific calculator for PS99 pets.',
  },
  {
    name: '(Roblox) Gamepass ROI Calculator',
    slug: 'roblox-gamepass-roi-calculator',
    description: 'Is the "Triple Hatch" gamepass worth it?',
  },
  {
    name: '(Roblox) Inventory Value Estimator',
    slug: 'roblox-inventory-value-estimator',
    description: 'Calculate total RAP of your inventory.',
  },
];

const faqs = [
  {
    question: 'How does Luck work in Roblox games?',
    answer:
      'In most games (like Pet Simulator 99 or Adopt Me), Luck is a multiplier applied to the base odds. If a pet is 1% and you have 2x Luck, it becomes 2%. However, some games have "Luck caps" or diminishing returns.',
  },
  {
    question: 'What is "Pity" or "Mercy"?',
    answer:
      'Some egg systems guarantee a rare pet after X failed hatches. This calculator assumes pure RNG (Random Number Generation). If a Pity system exists, your actual cost will be lower than the "99% Certainty" number.',
  },
  {
    question: 'Why did I hatch 100 eggs at 1% and get nothing?',
    answer:
      'This is the "Gambler\'s Fallacy". 100 attempts at 1% does not equal 100%. Mathematically, you only have a 63.4% chance of success after 100 tries. You need ~230 tries to reach 90% confidence.',
  },
  {
    question: 'Is "Triple Hatch" worth it?',
    answer:
      'Yes, if you value time. Triple Hatch triples your speed but consumes 3x currency. It does not change the probability per egg, but it gets you to the result 3x faster.',
  },
  {
    question: 'Does the server "Luck" stack?',
    answer:
      'Usually, yes. Server boosts, potions, and gamepasses often multiply together. Always check the specific game wiki, but total luck can sometimes reach 10x-50x or more.',
  }
];

const baseUrl = 'https://mycalculating.com/category/gaming/roblox-egg-hatch-odds-simulator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: '(Roblox) Egg Hatch Odds Simulator',
      applicationCategory: 'GameApplication',
      operatingSystem: 'Any',
      description: 'Simulate Roblox egg hatching RNG using binomial probability. Calculate true cost and time for rare pets.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'Article',
      headline: 'Roblox Hatch Simulator: Beat the RNG',
      description: 'Don\'t waste Robux blindly. Use our odds simulator to calculate exactly how many eggs you need to hatch for that Huge or Titanic pet.',
      author: {
        '@type': 'Organization',
        name: 'MegaCalc Hub Gaming Team',
      },
      datePublished: '2025-01-24',
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    }
  ],
};

export default function RobloxEggHatchOddsSimulator() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card className="border-l-4 border-l-purple-500 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Egg className="h-6 w-6 text-purple-500" />
            Roblox Hatch Probability Simulator
          </CardTitle>
          <CardDescription>
            Calculate the true cost, time, and odds of hatching rare pets.
          </CardDescription>
        </CardHeader>
      </Card>

      <RobloxEggHatchOddsSimulatorInteractive />

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="name" content="Roblox Egg Hatch Odds Simulator: RNG Probability Calculator" />
        <meta itemProp="description" content="Simulate the odds of hatching rare pets in Roblox. Understand binomial probability and calculate the true cost of 'guaranteed' drops." />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Roblox Hatch Odds: Beating the House</h1>
        <p className="text-lg italic text-muted-foreground">In world of Roblox simulators (Pet Sim 99, Adopt Me, Bee Swarm), "Luck" isn't a feeling—it's math. This simulator reveals the brutal reality of RNG (Random Number Generation) and helps you budget for the pets you want.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Understanding the "100 Egg" Myth</h2>
        <p>
          If a pet has a <strong>1% chance (1 in 100)</strong>, most players assume that hatching 100 eggs guarantees the pet.
          <strong> This is FALSE.</strong>
          <br /><br />
          In reality, after 100 hatches, you still have a ~36% chance of getting NOTHING. This is because every hatch is an independent event; the game doesn't "remember" your failures (unless there is a Pity system). To be 99% confident of getting that 1% pet, you actually need <strong>459 hatches</strong>.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">How "Luck" Multipliers Work</h3>
        <p>
          Luck boosts (Gamepasses, Potions, Enchants) typically multiply the base numerator.
          <br />
          <em>Formula: Base Odds (0.01%) x Luck (2x) = 0.02%.</em>
          <br />
          While small, these boosts compound massively over millions of hatches. A 1.5x boost can save you days of AFK hatching time.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Cost Effectiveness of Batch Hatching</h3>
        <p>
          Upgrades like "Triple Hatch" or "Octuple Hatch" do not improve your odds per egg. They simply speed up the process.
          However, since rare pets often require millions of attempts, speed is the most valuable resource.
          If a mythical takes 1 million hatches, doing it 8 at a time reduces the wait from months to weeks.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Worked Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-lg">
            <h4 className="font-bold text-foreground">Scenario A: The "Huge" Grind</h4>
            <p className="text-sm"><strong>Odds:</strong> 0.0001% (1 in 1M)</p>
            <p className="text-sm"><strong>Luck:</strong> 5x (Potions + Pass)</p>
            <p className="text-sm"><strong>Result:</strong> 1 in 200,000</p>
            <p className="text-xs text-muted-foreground mt-1">Very doable with overnight AFK hatching.</p>
          </div>
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-lg">
            <h4 className="font-bold text-foreground">Scenario B: The F2P Reality</h4>
            <p className="text-sm"><strong>Odds:</strong> 0.0001% (1 in 1M)</p>
            <p className="text-sm"><strong>Luck:</strong> 1x (None)</p>
            <p className="text-sm"><strong>Result:</strong> 1 in 1,000,000</p>
            <p className="text-xs text-muted-foreground mt-1">Requires 5x more time/eggs than Scenario A.</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>FAQs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <h4 className="font-semibold text-sm">{faq.question}</h4>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Related Calculators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {relatedCalculators.map((calc) => (
              <div key={calc.slug} className="group">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-purple-500" />
                  <Link href={`/category/gaming/${calc.slug}`} className="text-foreground hover:text-purple-500 transition-colors">
                    {calc.name}
                  </Link>
                </h4>
                <p className="text-xs text-muted-foreground ml-5">{calc.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            Summary for AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            A simulator for Roblox Egg Hatching probabilities (Pet Simulator 99/X, Adopt Me).
            Inputs: Egg Price, Target Odds (%), Luck Multiplier, Batch Size.
            Outputs: Average Cost, Expected Attempts (Geometric Distribution), Time to Hatch, and Confidence Intervals (p50, p90).
          </p>
          <p>
            It debunks the "100 eggs = 100%" myth using Binomial Probability logic and calculates the "True Cost" considering bad luck protection (Confidence Intervals).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
