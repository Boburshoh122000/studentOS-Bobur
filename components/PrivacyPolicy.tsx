import { Screen, NavigationProps } from '../types';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

export default function PrivacyPolicy({ navigateTo }: NavigationProps) {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigateTo(Screen.LANDING)}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8">Privacy Policy</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Last updated: February 5, 2026</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              1. Information We Collect
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We collect information you provide directly to us, such as when you create an account,
              update your profile, use our services, or contact us for support. This may include
              your name, email address, educational information, and any content you choose to
              share.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We use the information we collect to provide, maintain, and improve our services,
              personalize your experience, communicate with you about updates and opportunities, and
              protect the security of our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              3. Information Sharing
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We do not sell your personal information. We may share your information with
              third-party service providers who assist us in operating our platform, employers (with
              your explicit consent when you apply for jobs), and as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              4. Data Security
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your
              personal information against unauthorized access, alteration, disclosure, or
              destruction. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              5. Your Rights
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              You have the right to access, correct, or delete your personal information. You can
              update your account settings at any time or contact us to request data deletion. You
              may also opt out of marketing communications.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              6. Cookies and Tracking
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We use cookies and similar technologies to enhance your experience, analyze usage
              patterns, and personalize content. You can control cookie preferences through your
              browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              7. Children's Privacy
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Our Service is not directed to children under 13. We do not knowingly collect personal
              information from children under 13. If we learn we have collected such information, we
              will promptly delete it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              8. Changes to This Policy
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any
              material changes by posting the new policy on this page and updating the "Last
              updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              9. Contact Us
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@studentos.com" className="text-primary hover:underline">
                privacy@studentos.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-slate-500 dark:text-slate-400">
          © 2026 StudentOS. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
