import Link from 'next/link';
import { Gamepad2, BrainCircuit, ArrowRight, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FortniteStormSurgeTimerInteractive from './fortnite-storm-surge-timer-interactive';

const steps = [
  'Enter the current number of players remaining in the match.',
  'Enter the target player count that triggers storm surge (typically 60-80 players).',
  'Enter the damage per tick that storm surge deals (typically 1-2 damage per tick).',
  'Enter the tick interval in seconds (typically 0.5-1.0 seconds per tick).',
  'Optionally enter your current health to calculate survival time.',
  'Review the time until storm surge, damage calculations, survival requirements, and recommendations.',
];

const faqs = [
  {
    question: 'What is storm surge in Fortnite?',
    answer:
      'Storm surge is a competitive match mechanic that activates when too many players remain alive. It deals periodic damage to players with the lowest damage dealt, forcing eliminations and reducing player count. Storm surge helps prevent matches from lasting too long by encouraging aggressive play.',
  },
  {
    question: 'When does storm surge activate?',
    answer:
      'Storm surge typically activates when player count exceeds a threshold (usually 60-80 players) at certain storm phases. The exact threshold varies by match phase and competitive settings. Once activated, it continues until player count drops below the threshold.',
  },
  {
    question: 'How does storm surge damage work?',
    answer:
      'Storm surge deals periodic damage (typically 1-2 damage per tick) to players with the lowest damage dealt in the match. Damage occurs at regular intervals (typically every 0.5-1.0 seconds). Players with higher damage dealt are protected from storm surge damage. The goal is to encourage aggressive play and reduce player count.',
  },
  {
    question: 'How can I avoid storm surge damage?',
    answer:
      'To avoid storm surge damage, deal damage to enemies. Players with higher damage dealt are protected from storm surge. Engage in combat, deal damage to opponents, and maintain active gameplay. Passive players with low damage dealt are most vulnerable to storm surge.',
  },
  {
    question: 'How long does storm surge last?',
    answer:
      'Storm surge lasts until player count drops below the activation threshold. The duration depends on how quickly players are eliminated. More aggressive play reduces player count faster, ending storm surge sooner. Passive play prolongs storm surge, increasing damage over time.',
  },
  {
    question: 'What happens if I take storm surge damage?',
    answer:
      'Storm surge damage reduces your health/shield. If damage exceeds your remaining health, you\'re eliminated. Players with low health are especially vulnerable. Deal damage to enemies to avoid storm surge, or use healing items to survive damage. Survival depends on health management and active gameplay.',
  },
  {
    question: 'How do I calculate survival time during storm surge?',
    answer:
      'Survival time = (Current Health / Damage Per Tick) Ã— Tick Interval. For example, with 100 health, 2 damage per tick, and 1 second intervals, you can survive 50 seconds (100 / 2 Ã— 1 = 50). However, you should deal damage to enemies to avoid storm surge entirely rather than relying on survival time.',
  },
];

const relatedCalculators = [
  {
    name: 'Fortnite DPS Calculator',
    slug: 'fortnite-dps-calculator',
    description: 'Calculate damage per second (DPS) for Fortnite weapons based on damage, fire rate, and weapon stats.',
  },
  {
    name: 'Fortnite Build Material Cost Calculator',
    slug: 'fortnite-build-material-cost-calculator',
    description: 'Calculate the total material cost for building structures in Fortnite based on structure type, size, and material requirements.',
  },
  {
    name: 'Fortnite XP Per Match Optimizer',
    slug: 'fortnite-xp-per-match-optimizer',
    description: 'Optimize XP gains per match by calculating XP from eliminations, placement, and match performance.',
  },
  {
    name: 'Fortnite Shield Potency Calculator',
    slug: 'fortnite-shield-potency-calculator',
    description: 'Calculate shield effectiveness, damage absorption, and total effective health based on shield type and amount.',
  },
  {
    name: 'Fortnite Victory Royale Probability Estimator',
    slug: 'fortnite-victory-royale-probability-estimator',
    description: 'Estimate your probability of winning a Victory Royale based on current placement, player count, and skill level.',
  },
];

const baseUrl = 'https://mycalculating.com/fortnite-storm-surge-timer';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/gaming' },
        { '@type': 'ListItem', position: 3, name: 'Fortnite Storm Surge Timer', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Fortnite Storm Surge Timer',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate storm surge timing, damage intervals, and survival requirements in Fortnite competitive matches.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'Article',
      headline: 'The Complete Guide to Fortnite Storm Surge: Understanding Timing and Survival Strategies',
      description: 'A comprehensive guide to Fortnite storm surge mechanics, including timing calculations, damage interval analysis, and survival strategies for competitive matches.',
      author: {
        '@type': 'Organization',
        name: 'MegaCalc Hub Gaming Team',
      },
      datePublished: '2025-01-24',
    },
    {
      '@type': 'HowTo',
      name: 'How to use the Fortnite Storm Surge Timer',
      step: steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: step,
      })),
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

export default function FortniteStormSurgeTimer() {
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
            <Gamepad2 className="h-6 w-6 text-purple-500" />
            Fortnite Storm Surge Timer
          </CardTitle>
          <CardDescription>
            Calculate storm surge timing, damage intervals, and survival requirements in Fortnite competitive matches.
          </CardDescription>
        </CardHeader>
      </Card>

      <FortniteStormSurgeTimerInteractive />

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="name" content="The Complete Guide to Fortnite Storm Surge: Understanding Timing and Survival Strategies" />
        <meta itemProp="description" content="A comprehensive guide to Fortnite storm surge mechanics, timing calculations, damage intervals, and survival strategies." />
        <meta itemProp="keywords" content="Fortnite storm surge, competitive Fortnite, storm surge timer, damage intervals, survival strategies" />
        <meta itemProp="author" content="MegaCalc Hub Gaming Team" />
        <meta itemProp="datePublished" content="2025-01-24" />
        <meta itemProp="url" content={baseUrl} />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Fortnite Storm Surge: Understanding Timing and Survival Strategies</h1>
        <p className="text-lg italic text-muted-foreground">A comprehensive guide to Fortnite storm surge mechanics, timing calculations, damage intervals, and survival strategies.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#overview" className="hover:underline">Overview: Understanding Storm Surge</a></li>
          <li><a href="#mechanics" className="hover:underline">Storm Surge Mechanics</a></li>
          <li><a href="#activation" className="hover:underline">Activation Conditions and Timing</a></li>
          <li><a href="#damage" className="hover:underline">Damage System and Intervals</a></li>
          <li><a href="#avoidance" className="hover:underline">Avoiding Storm Surge Damage</a></li>
          <li><a href="#survival" className="hover:underline">Survival Strategies and Calculations</a></li>
          <li><a href="#optimization" className="hover:underline">Optimization Strategies</a></li>
        </ul>
        <hr />

        <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Understanding Storm Surge</h2>
        <p>Storm surge is a competitive match mechanic in Fortnite that activates when too many players remain alive, dealing periodic damage to players with the lowest damage dealt. Understanding storm surge helps players avoid damage, plan strategies, and optimize gameplay in competitive matches.</p>

        <p>Storm surge serves multiple purposes: preventing matches from lasting too long, encouraging aggressive play, reducing player count efficiently, and maintaining match pace. It's a balancing mechanism that ensures competitive matches progress at appropriate speeds.</p>

        <p>Storm surge targets players with the lowest damage dealt in the match, protecting players who are actively engaging in combat. This design encourages aggressive play and rewards players who deal damage to enemies. Passive players are most vulnerable to storm surge damage.</p>

        <p>Damage from storm surge occurs at regular intervals (ticks), typically dealing 1-2 damage per tick every 0.5-1.0 seconds. This periodic damage can eliminate players who don't deal damage to enemies or who have low health. Understanding damage intervals helps players calculate survival time and plan strategies.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Storm Surge Matters</h3>
        <p>Storm surge matters because it directly affects survival and match outcomes. Players who understand storm surge can avoid damage, optimize strategies, and improve competitive performance. Ignoring storm surge mechanics often results in unnecessary damage and eliminations.</p>

        <hr />

        <h2 id="mechanics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Storm Surge Mechanics</h2>

        <p>Storm surge mechanics involve player count thresholds, damage targeting, and periodic damage application. Understanding these mechanics helps players predict storm surge activation and avoid damage.</p>

        <p>Player count thresholds determine when storm surge activates. Typically, storm surge activates when player count exceeds 60-80 players at certain storm phases. The exact threshold varies by match phase and competitive settings. Once activated, storm surge continues until player count drops below the threshold.</p>

        <p>Damage targeting prioritizes players with the lowest damage dealt. Players who deal more damage to enemies are protected from storm surge. Players who deal less damage are vulnerable to storm surge damage. This targeting system encourages aggressive play and rewards combat engagement.</p>

        <p>Periodic damage occurs at regular intervals (ticks). Each tick deals a fixed amount of damage (typically 1-2 damage) to targeted players. Tick intervals are consistent (typically 0.5-1.0 seconds), allowing players to predict damage timing. Understanding tick intervals helps players calculate survival time and plan healing strategies.</p>

        <p>Damage accumulation reduces health over time. Multiple ticks can eliminate players if they don't deal damage or heal. Players with low health are especially vulnerable. Survival depends on dealing damage to avoid targeting or healing to survive damage.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Damage Calculation</h3>
        <p>Damage calculation: Each tick deals fixed damage (damage per tick). Total damage = Damage Per Tick Ã— Number of Ticks. Survival time = (Current Health / Damage Per Tick) Ã— Tick Interval. These calculations help players understand damage impact and plan survival strategies.</p>

        <hr />

        <h2 id="activation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Activation Conditions and Timing</h2>

        <p>Storm surge activation depends on player count relative to thresholds. Understanding activation conditions helps players predict when storm surge will activate and prepare accordingly.</p>

        <p>Activation threshold is the player count that triggers storm surge. When current player count exceeds the threshold, storm surge activates. Typical thresholds are 60-80 players, varying by match phase. Early game phases may have higher thresholds, while later phases may have lower thresholds.</p>

        <p>Time until activation depends on elimination rate. If player count is above threshold, storm surge may activate soon. Time until activation = (Players Above Threshold / Elimination Rate) Ã— 60 seconds. Actual time varies based on player behavior and combat activity.</p>

        <p>Deactivation occurs when player count drops below threshold. More aggressive play reduces player count faster, ending storm surge sooner. Passive play prolongs storm surge, increasing damage over time. Understanding this relationship helps players optimize strategies.</p>

        <p>Match phase affects activation thresholds. Early game phases typically have higher thresholds (70-80 players). Mid game phases may have moderate thresholds (60-70 players). Late game phases may have lower thresholds or no storm surge. Understanding phase-specific thresholds helps players predict activation.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Predicting Activation</h3>
        <p>To predict activation: monitor current player count, know threshold for current match phase, estimate elimination rate based on match activity, calculate time until threshold is reached, and prepare strategies based on activation likelihood. Use calculators to estimate timing and plan accordingly.</p>

        <hr />

        <h2 id="damage" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Damage System and Intervals</h2>

        <p>Storm surge damage occurs at regular intervals with fixed damage per tick. Understanding damage intervals helps players calculate survival time and plan strategies.</p>

        <p>Damage per tick is typically 1-2 damage, though this can vary by competitive settings. Higher damage per tick makes storm surge more dangerous, requiring faster damage dealing or more healing. Lower damage per tick provides more time to deal damage or heal.</p>

        <p>Tick intervals are typically 0.5-1.0 seconds between damage ticks. Consistent intervals allow players to predict damage timing. Shorter intervals mean more frequent damage, reducing survival time. Longer intervals provide more time between damage ticks.</p>

        <p>Total damage accumulates over multiple ticks. Players taking storm surge damage continuously will accumulate damage over time. Total damage = Damage Per Tick Ã— Number of Ticks. Understanding accumulation helps players calculate when they'll be eliminated.</p>

        <p>Survival calculations depend on health and damage. Survival time = (Current Health / Damage Per Tick) Ã— Tick Interval. Ticks to survive = Current Health / Damage Per Tick. These calculations help players understand how long they can survive storm surge damage.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Damage Examples</h3>
        <p>Example 1: 100 health, 2 damage per tick, 1 second intervals. Survival time = 50 seconds (100 / 2 Ã— 1). Ticks to survive = 50 ticks. This provides reasonable survival time if taking damage.</p>

        <p>Example 2: 50 health, 1.5 damage per tick, 0.5 second intervals. Survival time = 16.7 seconds (50 / 1.5 Ã— 0.5). Ticks to survive = 33 ticks. Lower health significantly reduces survival time.</p>

        <hr />

        <h2 id="avoidance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Avoiding Storm Surge Damage</h2>

        <p>The best strategy for storm surge is to avoid it entirely by dealing damage to enemies. Players who deal damage are protected from storm surge targeting. Understanding avoidance strategies helps players stay safe and optimize gameplay.</p>

        <p>Deal damage to enemies to avoid targeting. Engage in combat, shoot enemies, and maintain active gameplay. Players with higher damage dealt are protected from storm surge. Even small amounts of damage can provide protection. Prioritize dealing damage over passive survival.</p>

        <p>Engage early to build damage dealt. Early engagements help build damage totals, providing protection from storm surge. Don't wait until storm surge activates to start dealing damage. Build damage totals throughout the match to maintain protection.</p>

        <p>Maintain consistent damage output. Deal damage regularly throughout the match, not just when storm surge is active. Consistent damage ensures protection from storm surge targeting. Passive play makes you vulnerable to storm surge.</p>

        <p>Balance aggression with survival. Deal damage to avoid storm surge, but don't take unnecessary risks. Engage enemies when safe, use cover effectively, and maintain awareness. Balance damage dealing with survival to optimize performance.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Damage Thresholds</h3>
        <p>Damage thresholds vary by match, but generally: players with above-average damage dealt are protected, players with below-average damage dealt are vulnerable, and damage totals are compared relative to other players. Deal damage consistently to maintain protection.</p>

        <hr />

        <h2 id="survival" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Survival Strategies and Calculations</h2>

        <p>If you're taking storm surge damage, survival strategies help you stay alive while dealing damage to avoid further targeting. Understanding survival calculations helps players plan strategies and manage health effectively.</p>

        <p>Survival time calculations help players understand how long they can survive storm surge damage. Formula: Survival Time = (Current Health / Damage Per Tick) Ã— Tick Interval. This shows maximum survival time if taking continuous damage.</p>

        <p>Health management is crucial during storm surge. Use healing items to extend survival time. Prioritize healing when health is low. Balance healing with damage dealing to avoid further targeting. Effective health management can save you from elimination.</p>

        <p>Damage dealing while surviving helps avoid further targeting. Deal damage to enemies even while taking storm surge damage. This can remove you from targeting, stopping further damage. Balance survival with damage dealing to optimize outcomes.</p>

        <p>Escape strategies may help if storm surge is unavoidable. Move to safer positions, use cover effectively, and avoid additional threats. However, the best strategy is always to deal damage to avoid targeting entirely.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Survival Priority</h3>
        <p>Survival priority: First, deal damage to avoid targeting (best strategy). Second, heal if health is low and you can't deal damage immediately. Third, escape to safer positions if possible. Always prioritize dealing damage over passive survival, as this prevents further damage.</p>

        <hr />

        <h2 id="optimization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Optimization Strategies</h2>

        <p>Optimization strategies help players manage storm surge effectively, avoid damage, and improve competitive performance. Multiple approaches can optimize storm surge management.</p>

        <p>Early engagement builds damage totals for protection. Engage enemies early in the match to build damage dealt. Early damage provides protection from storm surge throughout the match. Don't wait until storm surge activates to start dealing damage.</p>

        <p>Consistent damage output maintains protection. Deal damage regularly throughout the match, not just when storm surge is active. Consistent damage ensures you stay above damage thresholds and maintain protection. Passive play makes you vulnerable.</p>

        <p>Monitor player counts to predict activation. Track current player count and compare to thresholds. Predict when storm surge will activate based on elimination rates. Prepare strategies based on activation likelihood. Use calculators to estimate timing.</p>

        <p>Balance aggression with survival. Deal damage to avoid storm surge, but maintain survival awareness. Engage enemies when safe, use cover effectively, and avoid unnecessary risks. Balance damage dealing with survival to optimize performance.</p>

        <p>Health management extends survival if taking damage. Use healing items when health is low. Prioritize healing during storm surge if you can't deal damage immediately. Balance healing with damage dealing to optimize outcomes.</p>

        <p>Adapt strategies based on match phase. Early game: build damage totals through engagements. Mid game: maintain damage output and monitor player counts. Late game: storm surge may be less relevant, focus on survival and positioning.</p>

        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Storm surge is a critical mechanic in competitive Fortnite that affects survival and match outcomes. Understanding storm surge mechanics, timing calculations, and survival strategies helps players avoid damage and optimize performance.</p>

        <p>Storm surge activates when player count exceeds thresholds, dealing periodic damage to players with low damage dealt. The best strategy is to deal damage to enemies to avoid targeting entirely. Survival strategies help if you're taking damage, but avoidance is always preferable.</p>

        <p>Optimization strategies include early engagement, consistent damage output, player count monitoring, balanced aggression, health management, and phase-appropriate strategies. By combining these strategies, players can effectively manage storm surge and improve competitive performance.</p>

        <p>Remember that storm surge encourages aggressive play and rewards combat engagement. Deal damage consistently throughout matches to maintain protection. Use calculators to estimate timing and plan strategies. With proper understanding and optimization, players can effectively manage storm surge and improve competitive outcomes.</p>
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
                  <Link href={`/gaming/${calc.slug}`} className="text-foreground hover:text-purple-500 transition-colors">
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
            This tool calculates Fortnite storm surge timing and survival requirements based on current player count, target player count (surge threshold), damage per tick, tick interval (seconds), and optional player health.
            Inputs: Player counts, damage per tick, tick interval, player health.
            Outputs: Players to eliminate, time/ticks until surge, survival time/ticks, total damage needed.
          </p>
          <p>It helps players understand storm surge mechanics, activation conditions, damage system, avoidance strategies, survival calculations, and optimization.</p>
        </CardContent>
      </Card>
    </div>
  );
}
