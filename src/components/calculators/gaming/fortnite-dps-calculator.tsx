import Link from 'next/link';
import { Gamepad2, BrainCircuit, ArrowRight, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FortniteDPSCalculatorInteractive from './fortnite-dps-calculator-interactive';

const steps = [
  'Enter the base damage per shot of the weapon.',
  'Enter the fire rate (shots per second) of the weapon.',
  'Optionally enter the headshot damage multiplier (default: 2.0 for most weapons).',
  'Optionally enter reload time (seconds) and magazine size for more accurate DPS calculations.',
  'Review the base DPS, headshot DPS, effective DPS (accounting for reload), and recommendations.',
];

const faqs = [
  {
    question: 'What is DPS in Fortnite?',
    answer:
      'DPS (Damage Per Second) is a measure of how much damage a weapon deals over one second of continuous firing. It\'s calculated by multiplying base damage by fire rate. Higher DPS means more damage output, making weapons more effective in combat. DPS helps compare weapons and choose the best option for different situations.',
  },
  {
    question: 'How is base DPS calculated?',
    answer:
      'Base DPS = Base Damage Ã— Fire Rate. For example, a weapon with 30 damage per shot and 5 shots per second has 150 base DPS. This represents damage output during continuous firing without accounting for reloads, headshots, or other factors. Base DPS is the foundation for all other DPS calculations.',
  },
  {
    question: 'What is headshot DPS?',
    answer:
      'Headshot DPS accounts for headshot multipliers, which typically double damage (2.0x multiplier). Formula: Headshot DPS = Base Damage Ã— Headshot Multiplier Ã— Fire Rate. Headshot DPS shows potential damage if all shots hit the head, which is ideal but not always achievable in actual gameplay.',
  },
  {
    question: 'What is effective DPS?',
    answer:
      'Effective DPS accounts for reload time, providing a more realistic damage output over extended periods. Formula: Effective DPS = (Damage Per Magazine) / (Time to Empty Magazine + Reload Time). This gives a better representation of sustained damage output during longer engagements.',
  },
  {
    question: 'How do reload time and magazine size affect DPS?',
    answer:
      'Reload time and magazine size affect effective DPS by creating downtime between magazines. Larger magazines and faster reloads increase effective DPS. Weapons with small magazines and slow reloads have lower effective DPS despite potentially high base DPS. Always consider these factors for sustained combat.',
  },
  {
    question: 'Which weapons have the highest DPS in Fortnite?',
    answer:
      'DPS varies by weapon type and rarity. Assault rifles and SMGs typically have high DPS due to fast fire rates. Shotguns have high burst damage but lower sustained DPS. Sniper rifles have very high damage but very low DPS due to slow fire rates. Use DPS calculators to compare specific weapons and find the best options for your playstyle.',
  },
  {
    question: 'Should I always choose the highest DPS weapon?',
    answer:
      'Not necessarily. While DPS is important, consider other factors: accuracy (high DPS is useless if you miss), range (some weapons are better at different distances), ammo availability, and your playstyle. Balance DPS with weapon handling, range, and personal preference. Use DPS as one factor in weapon selection, not the only factor.',
  },
];

const relatedCalculators = [
  {
    name: 'Fortnite Build Material Cost Calculator',
    slug: 'fortnite-build-material-cost-calculator',
    description: 'Calculate the total material cost for building structures in Fortnite based on structure type, size, and material requirements.',
  },
  {
    name: 'Fortnite Storm Surge Timer',
    slug: 'fortnite-storm-surge-timer',
    description: 'Calculate storm surge timing, damage intervals, and survival requirements in Fortnite competitive matches.',
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

const baseUrl = 'https://mycalculating.com/fortnite-dps-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/gaming' },
        { '@type': 'ListItem', position: 3, name: 'Fortnite DPS Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Fortnite DPS Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate damage per second (DPS) for Fortnite weapons based on damage, fire rate, and weapon stats.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'Article',
      headline: 'The Complete Guide to Fortnite DPS: Understanding Weapon Damage Per Second',
      description: 'A comprehensive guide to Fortnite DPS calculations, including weapon damage output analysis, fire rate mechanics, headshot multipliers, and strategies for maximizing combat effectiveness.',
      author: {
        '@type': 'Organization',
        name: 'MegaCalc Hub Gaming Team',
      },
      datePublished: '2025-01-24',
    },
    {
      '@type': 'HowTo',
      name: 'How to use the Fortnite DPS Calculator',
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

export default function FortniteDPSCalculator() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card className="border-l-4 border-l-red-500 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Gamepad2 className="h-6 w-6 text-red-500" />
            Fortnite DPS Calculator
          </CardTitle>
          <CardDescription>
            Calculate damage per second (DPS) for Fortnite weapons based on damage, fire rate, and weapon stats.
          </CardDescription>
        </CardHeader>
      </Card>

      <FortniteDPSCalculatorInteractive />

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="name" content="The Complete Guide to Fortnite DPS: Understanding Weapon Damage Per Second" />
        <meta itemProp="description" content="A comprehensive guide to Fortnite DPS calculations, weapon damage output, fire rates, and combat effectiveness." />
        <meta itemProp="keywords" content="Fortnite DPS, weapon damage, fire rate, damage per second, Fortnite weapons, combat effectiveness" />
        <meta itemProp="author" content="MegaCalc Hub Gaming Team" />
        <meta itemProp="datePublished" content="2025-01-24" />
        <meta itemProp="url" content={baseUrl} />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Fortnite DPS: Understanding Weapon Damage Per Second</h1>
        <p className="text-lg italic text-muted-foreground">A comprehensive guide to Fortnite DPS calculations, weapon damage output, fire rates, and combat effectiveness.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#overview" className="hover:underline">Overview: Understanding DPS in Fortnite</a></li>
          <li><a href="#calculation" className="hover:underline">DPS Calculation Methods</a></li>
          <li><a href="#factors" className="hover:underline">Factors Affecting DPS</a></li>
          <li><a href="#weapon-types" className="hover:underline">Weapon Types and DPS Characteristics</a></li>
          <li><a href="#headshots" className="hover:underline">Headshot Multipliers and Impact</a></li>
          <li><a href="#reloads" className="hover:underline">Reload Time and Effective DPS</a></li>
          <li><a href="#optimization" className="hover:underline">DPS Optimization Strategies</a></li>
        </ul>
        <hr />

        <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Understanding DPS in Fortnite</h2>
        <p>Damage Per Second (DPS) is a critical metric in Fortnite that measures how much damage a weapon deals over one second of continuous firing. Understanding DPS helps players compare weapons, optimize loadouts, and make informed decisions during combat. Higher DPS generally means faster eliminations, but other factors like accuracy, range, and handling also matter.</p>

        <p>DPS is calculated by multiplying base damage per shot by fire rate (shots per second). For example, a weapon dealing 30 damage per shot with a fire rate of 5 shots per second has 150 DPS. This represents raw damage output during continuous firing, without accounting for headshots, reloads, or other factors.</p>

        <p>Different weapon types have different DPS characteristics. Assault rifles and SMGs typically have high DPS due to fast fire rates and moderate damage. Shotguns have high burst damage but lower sustained DPS. Sniper rifles have very high damage per shot but very low DPS due to slow fire rates. Understanding these differences helps players choose appropriate weapons for different situations.</p>

        <p>DPS alone doesn't determine weapon effectiveness. Accuracy, range, magazine size, reload time, and handling all affect real-world performance. A weapon with high DPS but poor accuracy may be less effective than a lower DPS weapon with better accuracy. Players must balance DPS with other factors when selecting weapons.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why DPS Matters</h3>
        <p>DPS matters because it directly affects time-to-elimination. Higher DPS means faster eliminations, giving players advantages in combat. In close-range engagements, DPS often determines the winner. Understanding DPS helps players make better loadout decisions and improve combat performance.</p>

        <hr />

        <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">DPS Calculation Methods</h2>

        <p>DPS calculations use simple multiplication: Base DPS = Base Damage Ã— Fire Rate. This fundamental formula provides the foundation for all DPS analysis. Understanding this calculation helps players compare weapons and understand damage output.</p>

        <p>Base damage is the damage dealt per shot when hitting the body (not headshots). This value varies by weapon type, rarity, and specific weapon model. Higher rarity weapons typically have higher base damage. Understanding base damage helps players evaluate weapon effectiveness.</p>

        <p>Fire rate is measured in shots per second. Faster fire rates mean more shots fired per second, increasing DPS. Fire rates vary significantly between weapon types. SMGs have very high fire rates (8-12 shots/second), while sniper rifles have very low fire rates (0.5-1 shot/second).</p>

        <p>Example calculation: A weapon with 25 base damage and 6 shots per second has 150 base DPS (25 Ã— 6 = 150). This means the weapon deals 150 damage per second during continuous firing. If an enemy has 100 health, this weapon can eliminate them in approximately 0.67 seconds (100 / 150 = 0.67).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Advanced DPS Calculations</h3>
        <p>Advanced calculations account for headshots, reloads, and other factors. Headshot DPS multiplies base damage by headshot multiplier (typically 2.0x) before multiplying by fire rate. Effective DPS accounts for reload time, providing sustained damage output over extended periods. These advanced calculations provide more realistic damage assessments.</p>

        <hr />

        <h2 id="factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Factors Affecting DPS</h2>

        <p>Multiple factors affect DPS and weapon effectiveness. Understanding these factors helps players make better weapon choices and optimize performance.</p>

        <p>Base damage directly affects DPS. Higher base damage means higher DPS, assuming fire rate remains constant. Base damage varies by weapon rarity, with legendary weapons typically having the highest damage. Players should prioritize higher damage weapons when possible.</p>

        <p>Fire rate significantly impacts DPS. Faster fire rates dramatically increase DPS, even with lower base damage. A weapon with 20 damage and 8 fire rate (160 DPS) may outperform a weapon with 30 damage and 4 fire rate (120 DPS). Fire rate is often more important than base damage for DPS.</p>

        <p>Weapon rarity affects both base damage and sometimes fire rate. Common (gray) weapons have lowest stats, while legendary (gold) weapons have highest stats. Epic (purple) and rare (blue) weapons fall in between. Always prioritize higher rarity weapons when available.</p>

        <p>Magazine size affects sustained DPS by determining how long a weapon can fire before reloading. Larger magazines allow longer continuous firing, maintaining high DPS for extended periods. Smaller magazines require frequent reloads, reducing effective DPS.</p>

        <p>Reload time affects effective DPS by creating downtime between magazines. Faster reloads minimize downtime, maintaining higher effective DPS. Slower reloads significantly reduce effective DPS, especially for weapons with small magazines.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Accuracy and DPS</h3>
        <p>Accuracy indirectly affects DPS by determining how many shots actually hit targets. A weapon with high DPS but poor accuracy may have lower effective DPS than a lower DPS weapon with better accuracy. Players must balance theoretical DPS with practical accuracy when evaluating weapons.</p>

        <hr />

        <h2 id="weapon-types" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Weapon Types and DPS Characteristics</h2>

        <p>Different weapon types have distinct DPS characteristics based on their design and intended use. Understanding these characteristics helps players choose appropriate weapons for different situations.</p>

        <p>Assault rifles typically have moderate to high DPS (120-180) with balanced damage and fire rate. They're versatile weapons suitable for most combat ranges. ARs provide consistent damage output and are reliable primary weapons. Examples include the SCAR and AK-47 variants.</p>

        <p>SMGs (Submachine Guns) have very high DPS (150-250) due to extremely fast fire rates. They excel in close-range combat but suffer at longer ranges. SMGs are ideal for aggressive playstyles and close-quarters combat. Their high DPS makes them excellent for eliminating enemies quickly.</p>

        <p>Shotguns have high burst damage but lower sustained DPS (80-150) due to slow fire rates. They're designed for close-range one-shot eliminations rather than sustained damage. Shotguns excel in building and close combat but are ineffective at range.</p>

        <p>Sniper rifles have very high damage per shot but very low DPS (20-60) due to extremely slow fire rates. They're designed for long-range precision eliminations, not sustained damage. Snipers require accuracy and patience but can eliminate enemies in one shot.</p>

        <p>Pistols have moderate DPS (100-150) with balanced characteristics. They're versatile backup weapons suitable for various situations. Pistols provide decent damage output and are reliable when primary weapons are unavailable.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Choosing Weapons by DPS</h3>
        <p>When choosing weapons, consider DPS alongside other factors. For close-range combat, prioritize high DPS weapons like SMGs or shotguns. For medium-range combat, use assault rifles with moderate to high DPS. For long-range combat, use sniper rifles despite low DPS, as precision matters more than sustained damage. Balance DPS with range, accuracy, and playstyle preferences.</p>

        <hr />

        <h2 id="headshots" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Headshot Multipliers and Impact</h2>

        <p>Headshot multipliers significantly increase damage output, effectively doubling DPS when all shots hit the head. Most Fortnite weapons have a 2.0x headshot multiplier, meaning headshots deal double damage compared to body shots.</p>

        <p>Headshot DPS is calculated as: Headshot DPS = Base Damage Ã— Headshot Multiplier Ã— Fire Rate. For a weapon with 30 base damage, 2.0x multiplier, and 5 fire rate, headshot DPS is 300 (30 Ã— 2.0 Ã— 5 = 300), compared to 150 base DPS.</p>

        <p>Headshot accuracy dramatically affects effective DPS. Players who consistently hit headshots can achieve much higher effective DPS than base DPS suggests. Improving headshot accuracy is one of the most effective ways to increase damage output.</p>

        <p>Different weapons have different headshot effectiveness. Weapons with high fire rates benefit more from headshots because each shot gets the multiplier. Weapons with high base damage also benefit significantly, as the multiplier applies to larger base values.</p>

        <p>Practice and aim training improve headshot accuracy. Players should focus on aiming for the head, especially in close-range combat where headshots are easier to land. Consistent headshots can turn a moderate DPS weapon into a high DPS weapon.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Headshot Strategies</h3>
        <p>Strategies for maximizing headshot DPS include: aiming for the head in all engagements, practicing aim to improve accuracy, using weapons with high fire rates to capitalize on headshot multipliers, and prioritizing headshots in close-range combat where they're easier to land.</p>

        <hr />

        <h2 id="reloads" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Reload Time and Effective DPS</h2>

        <p>Reload time affects effective DPS by creating downtime between magazines. Effective DPS accounts for reload time, providing a more realistic sustained damage output over extended periods.</p>

        <p>Effective DPS is calculated as: Effective DPS = Damage Per Magazine / (Time to Empty Magazine + Reload Time). This formula accounts for both firing time and reload downtime, giving a more accurate representation of sustained damage.</p>

        <p>Weapons with large magazines and fast reloads have higher effective DPS. These weapons minimize downtime and maintain high damage output. Weapons with small magazines and slow reloads have lower effective DPS, as reload downtime significantly reduces sustained damage.</p>

        <p>Time to empty magazine is calculated as: Time to Empty = Magazine Size / Fire Rate. Larger magazines take longer to empty, allowing longer continuous firing. Smaller magazines empty quickly, requiring frequent reloads.</p>

        <p>Damage per magazine represents total damage from a full magazine: Damage Per Magazine = Base Damage Ã— Magazine Size. This helps understand burst damage potential and elimination capability per magazine.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Optimizing Effective DPS</h3>
        <p>To optimize effective DPS: prioritize weapons with larger magazines, use weapons with faster reload times, minimize reload frequency by managing ammo efficiently, and consider effective DPS alongside base DPS when choosing weapons. Effective DPS is often more important than base DPS for sustained combat.</p>

        <hr />

        <h2 id="optimization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">DPS Optimization Strategies</h2>

        <p>DPS optimization involves balancing multiple factors to maximize damage output while maintaining effectiveness. Several strategies help players optimize DPS and improve combat performance.</p>

        <p>Weapon selection is crucial for DPS optimization. Choose weapons with high base DPS for your preferred combat range. For close-range, prioritize SMGs or shotguns with high DPS. For medium-range, use assault rifles with moderate to high DPS. Consider both base DPS and effective DPS when selecting weapons.</p>

        <p>Rarity prioritization maximizes DPS by using higher rarity weapons. Legendary weapons typically have 15-20% higher damage than common weapons, significantly increasing DPS. Always prioritize higher rarity weapons when available, as they provide substantial DPS improvements.</p>

        <p>Loadout balance combines different weapon types for optimal DPS across ranges. Use high DPS close-range weapons (SMGs, shotguns) for building and close combat. Use moderate DPS medium-range weapons (assault rifles) for general combat. Use precision long-range weapons (snipers) despite low DPS, as they serve different purposes.</p>

        <p>Accuracy improvement increases effective DPS by ensuring more shots hit targets. Practice aim training, use aim assist effectively (on console), and focus on consistent accuracy. High accuracy with moderate DPS often outperforms low accuracy with high DPS.</p>

        <p>Headshot focus maximizes damage output through headshot multipliers. Aim for the head in all engagements, especially close-range combat. Consistent headshots can double effective DPS, making headshot accuracy one of the most important skills for DPS optimization.</p>

        <p>Reload management minimizes downtime and maintains effective DPS. Reload during safe moments, not during active combat. Use weapons with faster reloads when possible. Manage ammo to avoid unnecessary reloads during engagements.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Conclusion</h3>
        <p>DPS is a critical metric in Fortnite that measures weapon damage output and helps players make informed loadout decisions. Understanding DPS calculations, factors affecting DPS, and optimization strategies improves combat performance and helps players choose the best weapons for different situations.</p>

        <p>Base DPS provides the foundation for damage assessment, while headshot DPS and effective DPS provide more realistic damage representations. Different weapon types have different DPS characteristics, and players must balance DPS with accuracy, range, and other factors when selecting weapons.</p>

        <p>Optimization strategies include weapon selection, rarity prioritization, loadout balance, accuracy improvement, headshot focus, and reload management. By combining these strategies, players can maximize DPS and improve combat effectiveness.</p>
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
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-red-500" />
                  <Link href={`/${calc.slug}`} className="text-foreground hover:text-red-500 transition-colors">
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
          <p>This tool calculates Fortnite weapon DPS (Damage Per Second) based on base damage per shot, fire rate (shots per second), optional headshot multiplier (default 2.0x), optional reload time (seconds), and optional magazine size.</p>
          <p>Outputs include base DPS (damage Ã— fire rate), headshot DPS (damage Ã— multiplier Ã— fire rate), time to empty magazine (magazine size / fire rate), damage per magazine (damage Ã— magazine size), effective DPS (accounting for reload time), status assessment (low-dps/moderate-dps/high-dps/very-high-dps), interpretation, recommendations, and action plan.</p>
          <p>It helps players compare weapons, optimize loadouts, and understand weapon damage mechanics for better combat performance.</p>
        </CardContent>
      </Card>
    </div>
  );
}
