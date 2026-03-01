import { Screen, NavigationProps } from '../types';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

export default function TermsOfService({ navigateTo }: NavigationProps) {
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
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8">
          Terms of Service
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Last updated: February 5, 2026</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              By accessing and using StudentOS ("the Service"), you accept and agree to be bound by
              the terms and conditions of this agreement. If you do not agree to these terms, please
              do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              2. Description of Service
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              StudentOS provides educational tools and resources for students, including scholarship
              discovery, job search assistance, AI-powered document analysis, habit tracking, and
              community features. The Service is provided "as is" and we reserve the right to modify
              or discontinue features at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              3. User Accounts
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities that occur under your account. You must notify us immediately
              of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              4. User Conduct
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              You agree not to use the Service for any unlawful purpose or in any way that could
              damage, disable, or impair the Service. You may not attempt to gain unauthorized
              access to any part of the Service or its related systems.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              5. Intellectual Property
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              All content, features, and functionality of the Service are owned by StudentOS and are
              protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              6. Limitation of Liability
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              StudentOS shall not be liable for any indirect, incidental, special, consequential, or
              punitive damages arising out of or related to your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              7. Changes to Terms
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of
              significant changes by posting a notice on the Service. Your continued use of the
              Service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">8. Contact</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              If you have any questions about these Terms, please contact us at{' '}
              <a href="mailto:legal@studentos.com" className="text-primary hover:underline">
                legal@studentos.com
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
