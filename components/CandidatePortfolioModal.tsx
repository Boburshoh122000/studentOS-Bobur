import { useState, useEffect } from 'react';
import { employerApi } from '../src/services/api';
import {
  AcademicCapIcon,
  ArrowDownTrayIcon,
  BriefcaseIcon,
  ChartBarIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  MapPinIcon,
  SparklesIcon,
  TrophyIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';

interface CandidatePortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  candidateName?: string;
}

interface PortfolioData {
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  headline: string | null;
  educationLevel: string | null;
  university: string | null;
  graduationYear: number | null;
  major: string | null;
  country: string | null;
  skills: string[];
  cvUrl: string | null;
  atsScore: number | null;
  educationHistory: { school: string; degree: string; year: string; description?: string }[] | null;
  workExperience:
    | { company: string; role: string; duration: string; description?: string }[]
    | null;
  certificates: { name: string; issuer?: string; date?: string; fileUrl?: string }[] | null;
  goals: string[];
  email: string;
  userId: string;
}

export default function CandidatePortfolioModal({
  isOpen,
  onClose,
  userId,
  candidateName,
}: CandidatePortfolioModalProps) {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchPortfolio();
    }
    if (!isOpen) {
      setPortfolio(null);
      setError(null);
    }
  }, [isOpen, userId]);

  const fetchPortfolio = async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err } = await employerApi.getApplicantPortfolio(userId);
      if (err) {
        setError(err);
      } else {
        setPortfolio(data as PortfolioData);
      }
    } catch {
      setError('Failed to load portfolio');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isOpen) return null;

  const edu = Array.isArray(portfolio?.educationHistory) ? portfolio.educationHistory : [];
  const work = Array.isArray(portfolio?.workExperience) ? portfolio.workExperience : [];
  const certs = Array.isArray(portfolio?.certificates) ? portfolio.certificates : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden bg-white dark:bg-card-dark rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {candidateName ? `${candidateName}'s Portfolio` : 'Candidate Portfolio'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close portfolio modal"
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {isLoading ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                </div>
              </div>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <UserIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">{error}</p>
            </div>
          ) : portfolio ? (
            <div className="space-y-8">
              {/* Profile Header */}
              <div className="flex items-start gap-5">
                {portfolio.avatarUrl ? (
                  <img
                    src={portfolio.avatarUrl}
                    alt={portfolio.fullName || 'Candidate'}
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-slate-100 dark:ring-slate-700 shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl ring-4 ring-slate-100 dark:ring-slate-700 shrink-0">
                    {getInitials(portfolio.fullName || portfolio.email)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {portfolio.fullName || 'Unknown'}
                  </h3>
                  {portfolio.headline && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                      {portfolio.headline}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {portfolio.university && (
                      <span className="flex items-center gap-1.5">
                        <AcademicCapIcon className="w-4 h-4" />
                        {portfolio.university}
                      </span>
                    )}
                    {portfolio.major && (
                      <span className="flex items-center gap-1.5">
                        <DocumentTextIcon className="w-4 h-4" />
                        {portfolio.major}
                      </span>
                    )}
                    {portfolio.country && (
                      <span className="flex items-center gap-1.5">
                        <MapPinIcon className="w-4 h-4" />
                        {portfolio.country}
                      </span>
                    )}
                    {portfolio.email && (
                      <a
                        href={`mailto:${portfolio.email}`}
                        className="flex items-center gap-1.5 hover:text-primary transition-colors"
                      >
                        <EnvelopeIcon className="w-4 h-4" />
                        {portfolio.email}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* About Me */}
              {portfolio.bio && (
                <section>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-primary" />
                    About Me
                  </h4>
                  <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {portfolio.bio}
                    </p>
                  </div>
                </section>
              )}

              {/* Education History */}
              {edu.length > 0 && (
                <section>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AcademicCapIcon className="w-4 h-4 text-primary" />
                    Education
                  </h4>
                  <div className="space-y-3">
                    {edu.map((item, i) => (
                      <div
                        key={i}
                        className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border-l-4 border-primary/30"
                      >
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {item.school}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.degree} {item.year ? `· ${item.year}` : ''}
                        </div>
                        {item.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Work Experience */}
              {work.length > 0 && (
                <section>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BriefcaseIcon className="w-4 h-4 text-primary" />
                    Work Experience
                  </h4>
                  <div className="space-y-3">
                    {work.map((item, i) => (
                      <div
                        key={i}
                        className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border-l-4 border-blue-400/30"
                      >
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {item.role}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.company} {item.duration ? `· ${item.duration}` : ''}
                        </div>
                        {item.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Skills */}
              <section>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4 text-primary" />
                  Skills
                </h4>
                {portfolio.skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {portfolio.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                    No skills added yet
                  </p>
                )}
              </section>

              {/* Certifications */}
              {certs.length > 0 && (
                <section>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <TrophyIcon className="w-4 h-4 text-primary" />
                    Certifications
                  </h4>
                  <div className="space-y-2">
                    {certs.map((cert, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-slate-50 dark:bg-white/5 rounded-lg px-4 py-3"
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">
                            {cert.name}
                          </div>
                          {cert.issuer && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {cert.issuer} {cert.date ? `· ${cert.date}` : ''}
                            </div>
                          )}
                        </div>
                        {cert.fileUrl && (
                          <a
                            href={cert.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-dark text-xs font-medium"
                          >
                            View
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Resume / CV + ATS Score */}
              {portfolio.cvUrl && (
                <section>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4 text-primary" />
                    Resume / CV
                  </h4>
                  <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                        <DocumentTextIcon className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          Resume.pdf
                        </div>
                        {portfolio.atsScore != null && portfolio.atsScore > 0 && (
                          <div className="flex items-center gap-2 mt-1">
                            <ChartBarIcon className="w-3.5 h-3.5 text-primary" />
                            <span className="text-xs font-bold text-primary">
                              ATS Score: {portfolio.atsScore}%
                            </span>
                            <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${Math.min(portfolio.atsScore, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <a
                      href={portfolio.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                </section>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {portfolio && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
            {portfolio.email && (
              <a
                href={`mailto:${portfolio.email}`}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                <EnvelopeIcon className="w-4 h-4" />
                Message Candidate
              </a>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-dark transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
