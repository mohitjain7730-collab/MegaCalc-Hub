import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Mail, Globe, MessageSquare, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact Us & About | Mycalculating.com',
  description: 'Get in touch with Mycalculating.com. Learn about our mission to provide free, accurate online calculators and tools for finance, health, and more.',
  openGraph: {
    title: 'Contact Us & About | Mycalculating.com',
    description: 'Get in touch with Mycalculating.com. Learn about our mission to provide free, accurate online calculators and tools.',
    type: 'website',
    url: 'https://mycalculating.com/contact',
  },
  twitter: {
    card: 'summary',
    title: 'Contact Us & About | Mycalculating.com',
    description: 'Get in touch with Mycalculating.com. Learn about our mission to provide free, accurate online calculators.',
  },
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactPage() {
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
            Contact Us & About
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Get in touch or learn more about Mycalculating.com
          </p>
        </div>

        <div className="space-y-8">
          {/* About Section */}
          <section className="prose dark:prose-invert max-w-none">
            <h2 className="text-3xl font-bold text-foreground mb-4">About Mycalculating.com</h2>
            <div className="space-y-4 text-base leading-relaxed">
              <p>
                Welcome to Mycalculating.com, your comprehensive destination for free online calculators and tools. We are dedicated to providing accurate, easy-to-use calculators across a wide range of categories including finance, health, fitness, engineering, conversions, and more.
              </p>
              <p>
                Our mission is to make complex calculations simple and accessible to everyone. Whether you&apos;re planning your finances, tracking your health metrics, converting units, or solving engineering problems, we provide the tools you need—all completely free and accessible from any device.
              </p>
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="text-lg font-semibold text-foreground mb-2">About the Founder / Team</h3>
                <p className="text-base leading-relaxed">
                  Mycalculating.com is created and maintained by a small team passionate about simplifying complex calculations for everyday users.
                </p>
              </div>
              <div className="flex items-start gap-3 mt-6 p-4 bg-muted rounded-lg">
                <Calculator className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">What We Offer</h3>
                  <ul className="list-disc ml-6 space-y-2">
                    <li>Hundreds of free, accurate calculators across multiple categories</li>
                    <li>User-friendly interfaces designed for both beginners and professionals</li>
                    <li>Comprehensive guides and educational content through our Learning Hub</li>
                    <li>Regular updates and new calculator tools</li>
                    <li>Mobile-responsive design for use on any device</li>
                    <li>No registration required—use our tools instantly</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="prose dark:prose-invert max-w-none">
            <h2 className="text-3xl font-bold text-foreground mb-4">Contact Us</h2>
            <p className="text-base leading-relaxed mb-6">
              We&apos;d love to hear from you! Whether you have questions, feedback, suggestions for new calculators, or need support, please don&apos;t hesitate to reach out.
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Email Contact */}
              <div className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold text-foreground">Email Us</h3>
                </div>
                <p className="text-base text-muted-foreground mb-4">
                  Send us an email for general inquiries, feedback, or support.
                </p>
                <a
                  href="mailto:mohitjain7730@gmail.com"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                >
                  mohitjain7730@gmail.com
                  <MessageSquare className="h-4 w-4" />
                </a>
                <p className="text-sm text-muted-foreground mt-4">
                  <strong>Response Time:</strong> We typically respond within 24–48 hours.
                </p>
              </div>

              {/* Website */}
              <div className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <Globe className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold text-foreground">Visit Our Website</h3>
                </div>
                <p className="text-base text-muted-foreground mb-4">
                  Explore all our calculators and tools.
                </p>
                <a
                  href="https://mycalculating.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                >
                  mycalculating.com
                  <Globe className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-base text-muted-foreground">
                <strong>Location:</strong> India (operating remotely)
              </p>
            </div>
          </section>

          {/* Common Questions */}
          <section className="prose dark:prose-invert max-w-none">
            <h2 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className="p-5 border rounded-lg bg-card">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Are your calculators free to use?
                </h3>
                <p className="text-base text-muted-foreground">
                  Yes! All calculators on Mycalculating.com are completely free to use. No registration, no fees, no hidden costs.
                </p>
              </div>

              <div className="p-5 border rounded-lg bg-card">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Do you store my calculation data?
                </h3>
                <p className="text-base text-muted-foreground">
                  No, we do not store or log the specific inputs or results of your calculations. Your privacy is important to us. Please see our{' '}
                  <Link href="/privacy-policy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>{' '}
                  for more details.
                </p>
              </div>

              <div className="p-5 border rounded-lg bg-card">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Can I suggest a new calculator?
                </h3>
                <p className="text-base text-muted-foreground">
                  Absolutely! We&apos;re always looking to expand our calculator collection. Please email us with your suggestion, and we&apos;ll consider adding it to our website.
                </p>
              </div>

              <div className="p-5 border rounded-lg bg-card">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Are the calculator results accurate?
                </h3>
                <p className="text-base text-muted-foreground">
                  We strive to provide accurate calculations, but results are estimates and should not replace professional advice. Always consult qualified professionals for important decisions. See our{' '}
                  <Link href="/terms-conditions" className="text-primary hover:underline">
                    Terms & Conditions
                  </Link>{' '}
                  for more information.
                </p>
              </div>

              <div className="p-5 border rounded-lg bg-card">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  How often do you add new calculators?
                </h3>
                <p className="text-base text-muted-foreground">
                  We regularly update our website with new calculators and improvements. Check back often to discover new tools!
                </p>
              </div>
            </div>
          </section>

          {/* Additional Links */}
          <section className="prose dark:prose-invert max-w-none">
            <h2 className="text-3xl font-bold text-foreground mb-4">Additional Information</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Link
                href="/privacy-policy"
                className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow block"
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">Privacy Policy</h3>
                <p className="text-sm text-muted-foreground">
                  Learn how we collect, use, and protect your information.
                </p>
              </Link>
              <Link
                href="/terms-conditions"
                className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow block"
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">Terms & Conditions</h3>
                <p className="text-sm text-muted-foreground">
                  Read our terms of service and usage guidelines.
                </p>
              </Link>
            </div>
          </section>

          {/* Disclaimer Note */}
          <section className="prose dark:prose-invert max-w-none">
            <div className="p-5 border rounded-lg bg-muted">
              <p className="text-base text-muted-foreground italic">
                <strong>Note:</strong> Our calculators are for informational purposes only and not a substitute for professional medical, financial, or legal advice.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

