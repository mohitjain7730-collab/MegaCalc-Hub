
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
            Last updated: July 26, 2024
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <p>
            Welcome to Mycalculating.com. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website.
          </p>

          <h2>Information We Collect</h2>
          <p>
            We may collect information about you in a variety of ways. The information we may collect on the Site includes:
          </p>
          <ul>
            <li>
              <strong>Usage Data:</strong> We automatically collect information when you access and use the Site. This includes your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the Site. We use Firebase Analytics for this purpose.
            </li>
            <li>
              <strong>Calculation Data:</strong> The data you enter into our calculators is processed in your browser or on our servers to provide you with results. We do not store or log the specific inputs or results of your calculations.
            </li>
          </ul>

          <h2>Use of Your Information</h2>
          <p>
            Having accurate information permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
          </p>
          <ul>
            <li>Analyze usage and trends to improve our website and services.</li>
            <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
            <li>Compile anonymous statistical data and analysis for use internally.</li>
          </ul>

          <h2>Third-Party Services</h2>
          <p>
            We use Firebase, a Google service, for website analytics. This service may collect information about your use of the website and other websites, including your IP address, time of visit, pages visited, and other standard log information. This information is used for the purpose of evaluating your use of the website and compiling statistical reports on website activity.
          </p>

          <h2>Security of Your Information</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>

          <h2>Policy for Children</h2>
          <p>
            We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.
          </p>

          <h2>Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us at: [Your Contact Email Address Here]
          </p>
        </div>
      </div>
    </div>
  );
}
