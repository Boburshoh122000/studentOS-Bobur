import { useTranslation } from 'react-i18next';
import { Screen, NavigationProps } from '../types';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

export default function PrivacyPolicy({ navigateTo }: NavigationProps) {
  const { t } = useTranslation();
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
            {t('Legal.back_home')}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8">
          {t('Legal.privacy_title')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">{t('Legal.last_updated')}</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('Legal.privacy_s1_h')}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('Legal.privacy_s1_p')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('Legal.privacy_s2_h')}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('Legal.privacy_s2_p')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('Legal.privacy_s3_h')}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('Legal.privacy_s3_p')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('Legal.privacy_s4_h')}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('Legal.privacy_s4_p')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('Legal.privacy_s5_h')}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('Legal.privacy_s5_p')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('Legal.privacy_s6_h')}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('Legal.privacy_s6_p')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('Legal.privacy_s7_h')}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('Legal.privacy_s7_p')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('Legal.privacy_s8_h')}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('Legal.privacy_s8_p')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('Legal.privacy_s9_h')}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('Legal.privacy_contact_pre')}{' '}
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
          {t('Legal.rights')}
        </div>
      </footer>
    </div>
  );
}
