import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Privacy Policy | Mycalculating.com',
  description: 'Read our comprehensive privacy policy to understand how Mycalculating.com collects, uses, and protects your personal information when using our free online calculators and tools.',
  openGraph: {
    title: 'Privacy Policy | Mycalculating.com',
    description: 'Read our comprehensive privacy policy to understand how Mycalculating.com collects, uses, and protects your personal information when using our free online calculators and tools.',
    type: 'website',
    url: 'https://mycalculating.com/privacy-policy',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy | Mycalculating.com',
    description: 'Read our comprehensive privacy policy to understand how Mycalculating.com collects, uses, and protects your personal information.',
  },
  alternates: {
    canonical: '/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Last updated: December 2, 2025
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none space-y-6">
          <section>
            <p className="text-base leading-relaxed">
              Welcome to Mycalculating.com (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and ensuring transparency about how we collect, use, and safeguard your information. This Privacy Policy explains our practices regarding data collection, usage, and protection when you visit and use our website and calculator tools.
            </p>
            <p className="text-base leading-relaxed">
              By accessing or using Mycalculating.com, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our website.
            </p>
            <p className="text-base leading-relaxed">
              Our calculators are for informational purposes only and do not provide medical, legal, or financial advice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Information We Collect</h2>
            <p className="text-base leading-relaxed">
              We collect several types of information to provide and improve our services:
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">1.1 Automatically Collected Information</h3>
            <p className="text-base leading-relaxed">
              When you visit our website, we automatically collect certain information about your device and browsing behavior, including:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-base leading-relaxed">
              <li><strong>Usage Data:</strong> Information about how you access and use our website, including your IP address, browser type, operating system, device information, access times, pages viewed, and the pages you visited before and after accessing our site.</li>
              <li><strong>Cookies and Tracking Technologies:</strong> We use cookies, web beacons, and similar tracking technologies to track activity on our website and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</li>
              <li><strong>Analytics Data:</strong> We use Firebase Analytics (a Google service) to collect and analyze usage statistics, which helps us understand how visitors interact with our website and improve user experience.</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">1.2 Calculator Input Data</h3>
            <p className="text-base leading-relaxed">
              When you use our calculator tools:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-base leading-relaxed">
              <li><strong>Calculation Data:</strong> The data you enter into our calculators is processed in your browser or on our servers to provide you with results. We do not store, log, or retain the specific inputs or results of your calculations.</li>
              <li><strong>No Personal Data Required:</strong> Our calculators are designed to work without requiring personal identification information. You can use our tools anonymously.</li>
            </ul>
            <p className="text-base leading-relaxed mt-4">
              We do not collect names, emails, phone numbers, or any identifiable personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="text-base leading-relaxed">
              We use the collected information for various purposes:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-base leading-relaxed">
              <li>To provide, maintain, and improve our website and calculator tools</li>
              <li>To analyze usage patterns and trends to enhance user experience</li>
              <li>To monitor and analyze website performance and functionality</li>
              <li>To compile anonymous statistical data and analysis for internal use</li>
              <li>To detect, prevent, and address technical issues and security threats</li>
              <li>To comply with legal obligations and protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Third-Party Services</h2>
            <p className="text-base leading-relaxed">
              We use third-party services that may collect information used to identify you:
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3.1 Firebase Analytics</h3>
            <p className="text-base leading-relaxed">
              We use Firebase Analytics, a Google service, for website analytics. This service collects information about your use of the website, including your IP address, time of visit, pages visited, and other standard log information. This information is used to evaluate website usage and compile statistical reports. For more information about how Google uses data, please visit{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Google&apos;s Privacy Policy
              </a>.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">3.2 Other Third-Party Services</h3>
            <p className="text-base leading-relaxed">
              We may use other third-party services for analytics, hosting, and website functionality. These services have their own privacy policies governing the collection and use of your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Data Security</h2>
            <p className="text-base leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your information against unauthorized access, alteration, disclosure, or destruction. However, please be aware that:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-base leading-relaxed">
              <li>No method of transmission over the Internet or electronic storage is 100% secure</li>
              <li>While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security</li>
              <li>You use our website at your own risk</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">5. Cookies and Tracking Technologies</h2>
            <p className="text-base leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
            </p>
            <p className="text-base leading-relaxed">
              Types of cookies we may use:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-base leading-relaxed">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">6. Ads and Third-Party Cookies</h2>
            <p className="text-base leading-relaxed">
              We use third-party advertising partners (such as Google AdSense) that may use cookies to serve personalized ads. These advertising partners may collect information about your visits to our website and other websites to provide you with relevant advertisements. You can learn more about how Google uses data for advertising by visiting{' '}
              <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Google&apos;s Advertising Privacy Policy
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">7. Your Privacy Rights</h2>
            <p className="text-base leading-relaxed">
              Since we do not collect personal information, these rights are not applicable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">8. Children&apos;s Privacy</h2>
            <p className="text-base leading-relaxed">
              Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us immediately. If we become aware that we have collected personal information from children under 13 without verification of parental consent, we will take steps to remove that information from our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">9. Data Retention</h2>
            <p className="text-base leading-relaxed">
              We retain collected information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">10. International Data Transfers</h2>
            <p className="text-base leading-relaxed">
              Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ from those in your jurisdiction. By using our website, you consent to the transfer of your information to our facilities and those third parties with whom we share it as described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-base leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">12. Contact Us</h2>
            <p className="text-base leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
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
              This Privacy Policy is effective as of the date stated above and applies to all information collected by Mycalculating.com. By using our website, you acknowledge that you have read and understood this Privacy Policy.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: December 2, 2025
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
