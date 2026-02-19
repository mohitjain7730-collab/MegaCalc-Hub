import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Mycalculating.com',
  description: 'Read our terms and conditions to understand the rules and regulations for using Mycalculating.com free online calculators and tools.',
  openGraph: {
    title: 'Terms & Conditions | Mycalculating.com',
    description: 'Read our terms and conditions to understand the rules and regulations for using Mycalculating.com free online calculators and tools.',
    type: 'website',
    url: 'https://mycalculating.com/terms-conditions',
  },
  twitter: {
    card: 'summary',
    title: 'Terms & Conditions | Mycalculating.com',
    description: 'Read our terms and conditions to understand the rules and regulations for using Mycalculating.com.',
  },
  alternates: {
    canonical: '/terms-conditions',
  },
};

export default function TermsConditionsPage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Terms & Conditions
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none space-y-6">
          <section>
            <p className="text-base leading-relaxed">
              Welcome to Mycalculating.com (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of our website, including all calculator tools, content, and services (collectively, the &quot;Service&quot;). By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these Terms, then you may not access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-base leading-relaxed">
              By accessing and using Mycalculating.com, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Use License</h2>
            <p className="text-base leading-relaxed">
              Permission is granted to use Mycalculating.com for personal or general informational purposes. Redistribution or commercial misuse of our content, code, or calculators is prohibited. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-base leading-relaxed">
              <li>Modify or copy the materials or calculator tools</li>
              <li>Use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
              <li>Attempt to decompile or reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server</li>
            </ul>
            <p className="text-base leading-relaxed mt-4">
              This license shall automatically terminate if you violate any of these restrictions and may be terminated by us at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Calculator Tools and Results</h2>
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3.1 Accuracy and Disclaimer</h3>
            <p className="text-base leading-relaxed">
              While we strive to provide accurate calculator tools and results:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-base leading-relaxed">
              <li>All calculator results are provided &quot;as is&quot; without warranties of any kind</li>
              <li>Results are informational estimates based on the data you provide. They are not a substitute for professional medical, financial, legal, or other expert advice</li>
              <li>We do not guarantee the accuracy, completeness, or usefulness of any calculator results</li>
              <li>You should always consult with qualified professionals for advice specific to your situation</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3.2 No Professional Advice</h3>
            <p className="text-base leading-relaxed">
              The calculators and tools on this website are for informational and educational purposes only. They are not intended to replace professional advice, including but not limited to:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-base leading-relaxed">
              <li>Financial, investment, or tax advice</li>
              <li>Medical, health, or fitness advice</li>
              <li>Legal advice</li>
              <li>Engineering or technical advice</li>
            </ul>
            <p className="text-base leading-relaxed mt-4">
              Always seek the advice of qualified professionals regarding any questions you may have about a particular subject.
            </p>
            <p className="text-base leading-relaxed mt-4">
              Our tools should not be used for emergency, diagnostic, clinical, financial planning, or investment-critical decisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. No Account / No Data Collection</h2>
            <p className="text-base leading-relaxed">
              Our Service does not require user accounts, logins, or personal data submission. Your use of the calculators is anonymous.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">5. User Conduct</h2>
            <p className="text-base leading-relaxed">
              You agree to use our Service only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else&apos;s use and enjoyment of the Service. Prohibited behavior includes:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-base leading-relaxed">
              <li>Harassing, abusing, or harming other users</li>
              <li>Violating any applicable laws or regulations</li>
              <li>Transmitting any viruses, malware, or other harmful code</li>
              <li>Attempting to gain unauthorized access to our systems or networks</li>
              <li>Using automated systems (bots, scrapers) to access the Service without permission</li>
              <li>Interfering with or disrupting the Service or servers connected to the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">6. Intellectual Property Rights</h2>
            <p className="text-base leading-relaxed">
              The Service and its original content, features, and functionality are owned by Mycalculating.com and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="text-base leading-relaxed mt-4">
              Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">7. Disclaimer of Warranties</h2>
            <p className="text-base leading-relaxed">
              The information on this website is provided on an &quot;as is&quot; basis. To the fullest extent permitted by law, we:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-base leading-relaxed">
              <li>Exclude all representations, warranties, and conditions relating to our website and the use of this website</li>
              <li>Exclude all liability for damages arising out of or in connection with your use of this website</li>
              <li>Do not warrant that the website will be available at all times or be error-free</li>
              <li>Do not warrant that the website is free of viruses or other harmful components</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">8. Limitation of Liability</h2>
            <p className="text-base leading-relaxed">
              In no event shall Mycalculating.com, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-base leading-relaxed">
              <li>Your use or inability to use the Service</li>
              <li>Any errors or omissions in any content or calculator results</li>
              <li>Any decisions made based on calculator results</li>
              <li>Any unauthorized access to or use of our servers and/or any personal information stored therein</li>
              <li>Any interruption or cessation of transmission to or from our Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">9. Indemnification</h2>
            <p className="text-base leading-relaxed">
              You agree to defend, indemnify, and hold harmless Mycalculating.com and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney&apos;s fees), resulting from or arising out of:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-base leading-relaxed">
              <li>Your use and access of the Service</li>
              <li>Your violation of any term of these Terms</li>
              <li>Your violation of any third party right, including without limitation any copyright, property, or privacy right</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">10. Links to Other Websites</h2>
            <p className="text-base leading-relaxed">
              Our Service may contain links to third-party websites or services that are not owned or controlled by Mycalculating.com. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You acknowledge and agree that we shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods, or services available on or through any such websites or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">11. Termination</h2>
            <p className="text-base leading-relaxed">
              We may terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will cease immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">12. Governing Law</h2>
            <p className="text-base leading-relaxed">
              These Terms shall be interpreted and governed by the laws of the jurisdiction in which we operate, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">13. Changes to Terms</h2>
            <p className="text-base leading-relaxed">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
            <p className="text-base leading-relaxed mt-4">
              By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">14. Severability</h2>
            <p className="text-base leading-relaxed">
              If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service, and supersede and replace any prior agreements we might have between us regarding the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">15. Contact Information</h2>
            <p className="text-base leading-relaxed">
              If you have any questions about these Terms & Conditions, please contact us:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-base leading-relaxed">
                <strong>Email:</strong>{' '}
                <a href="mailto:mohitjain7730@gmail.com" className="text-primary hover:underline">
                  mohitjain7730@gmail.com
                </a>
              </p>
              <p className="text-base leading-relaxed mt-2">
                <strong>Website:</strong>{' '}
                <a href="https://mycalculating.com" className="text-primary hover:underline">
                  https://mycalculating.com
                </a>
              </p>
            </div>
          </section>

          <section className="mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground italic">
              By using Mycalculating.com, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions. If you do not agree to these Terms, please do not use our Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

