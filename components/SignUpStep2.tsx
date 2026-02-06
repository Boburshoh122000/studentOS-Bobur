import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Screen, NavigationProps } from '../types';

export default function SignUpStep2({ navigateTo }: NavigationProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['job']);

  const toggleGoal = (value: string) => {
    if (selectedGoals.includes(value)) {
      setSelectedGoals(selectedGoals.filter(g => g !== value));
    } else {
      setSelectedGoals([...selectedGoals, value]);
    }
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    // Check if there's a redirect destination from tools navigation
    const redirectTo = searchParams.get('redirect_to');
    if (redirectTo) {
      navigate(decodeURIComponent(redirectTo));
    } else {
      // Default: navigate to dashboard
      navigateTo(Screen.DASHBOARD);
    }
  };


  return (
    <div className="font-display bg-background-light text-slate-850 antialiased min-h-screen flex flex-col relative overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -left-[10%] -top-[10%] h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]"></div>
        <div className="absolute -right-[10%] top-[40%] h-[400px] w-[400px] rounded-full bg-blue-400/5 blur-[100px]"></div>
      </div>
      
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8 z-10">
        <div className="mx-auto max-w-3xl flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo(Screen.LANDING)}>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[20px]">school</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">StudentOS</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 bg-white/50 px-3 py-1 rounded-full border border-slate-200/50 backdrop-blur-sm">
            Step 2 of 2
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-start justify-center px-4 sm:px-6 lg:px-8 pb-12 pt-4 z-10">
        <div className="w-full max-w-3xl">
          <div className="mb-8 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out w-full shadow-[0_0_10px_rgba(45,77,224,0.5)]"></div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-blue-400 to-primary"></div>
            <div className="p-6 sm:p-10">
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 tracking-tight">Help us personalize your experience</h1>
                <p className="text-slate-500 text-lg">Tell us a bit about your academic journey so we can tailor StudentOS for you.</p>
              </div>
              
              <form onSubmit={handleFinish} className="space-y-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label htmlFor="education_level" className="block text-sm font-semibold text-slate-700 mb-2">Current Education Level</label>
                      <select id="education_level" name="education_level" className="form-select w-full rounded-xl border-slate-200 bg-slate-50 py-3 px-4 text-slate-900 focus:border-primary focus:ring-primary transition-shadow hover:border-slate-300 cursor-pointer" defaultValue="undergrad">
                        <option disabled value="">Select your level</option>
                        <option value="highschool">High School</option>
                        <option value="undergrad">Undergraduate</option>
                        <option value="postgrad">Postgraduate (Masters/PhD)</option>
                        <option value="bootcamp">Bootcamp / Trade School</option>
                        <option value="self">Self-Taught</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="university" className="block text-sm font-semibold text-slate-700 mb-2">University / School</label>
                      <div className="relative group">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-primary transition-colors">
                          <span className="material-symbols-outlined text-[20px]">account_balance</span>
                        </span>
                        <input type="text" id="university" name="university" className="form-input w-full rounded-xl border-slate-200 bg-slate-50 pl-11 py-3 text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-primary transition-shadow hover:border-slate-300" placeholder="e.g. Stanford University" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="grad_year" className="block text-sm font-semibold text-slate-700 mb-2">Graduation Year</label>
                      <select id="grad_year" name="grad_year" className="form-select w-full rounded-xl border-slate-200 bg-slate-50 py-3 px-4 text-slate-900 focus:border-primary focus:ring-primary transition-shadow hover:border-slate-300 cursor-pointer" defaultValue="2025">
                        <option disabled value="">Select year</option>
                        <option>2023</option>
                        <option>2024</option>
                        <option>2025</option>
                        <option>2026</option>
                        <option>2027</option>
                        <option>2028+</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="major" className="block text-sm font-semibold text-slate-700 mb-2">Major / Field of Study</label>
                      <div className="relative group">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-primary transition-colors">
                          <span className="material-symbols-outlined text-[20px]">class</span>
                        </span>
                        <input type="text" id="major" name="major" className="form-input w-full rounded-xl border-slate-200 bg-slate-50 pl-11 py-3 text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-primary transition-shadow hover:border-slate-300" placeholder="e.g. Computer Science" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-sm font-semibold text-slate-700 mb-2">Country of Study</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none z-10">
                          <span className="material-symbols-outlined text-[20px]">public</span>
                        </span>
                        <select id="country" name="country" className="form-select w-full rounded-xl border-slate-200 bg-slate-50 pl-11 py-3 text-slate-900 focus:border-primary focus:ring-primary transition-shadow hover:border-slate-300 cursor-pointer" defaultValue="us">
                          <option value="us">United States</option>
                          <option value="uk">United Kingdom</option>
                          <option value="ca">Canada</option>
                          <option value="de">Germany</option>
                          <option value="fr">France</option>
                          <option value="in">India</option>
                          <option value="au">Australia</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <hr className="border-slate-200" />
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-4">What is your primary goal right now? <span className="text-slate-400 font-normal ml-1">(Select all that apply)</span></label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: 'job', icon: 'work', color: 'blue', title: 'Land a Job/Internship', desc: 'Secure roles at top companies' },
                      { id: 'gpa', icon: 'trending_up', color: 'emerald', title: 'Boost Academic GPA', desc: 'Improve grades & study habits' },
                      { id: 'network', icon: 'groups', color: 'purple', title: 'Expand Network', desc: 'Connect with peers & mentors' },
                      { id: 'skills', icon: 'bolt', color: 'orange', title: 'Learn New Skills', desc: 'Master tools & certifications' },
                    ].map((goal) => (
                      <label key={goal.id} className="relative cursor-pointer group">
                        <input 
                          type="checkbox" 
                          name="goals" 
                          value={goal.id} 
                          className="peer sr-only"
                          checked={selectedGoals.includes(goal.id)}
                          onChange={() => toggleGoal(goal.id)}
                        />
                        <div className={`h-full p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-blue-300 peer-checked:border-primary peer-checked:bg-blue-50/50 peer-checked:shadow-sm transition-all duration-200`}>
                          <div className="flex items-start gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-${goal.color}-100 text-${goal.color === 'blue' ? 'primary' : goal.color + '-600'}`}>
                               <span className={`material-symbols-outlined ${goal.color === 'blue' ? 'text-primary' : `text-${goal.color}-600`}`}>{goal.icon}</span>
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-slate-900 text-sm">{goal.title}</div>
                              <div className="text-xs text-slate-500 mt-1 leading-relaxed">{goal.desc}</div>
                            </div>
                            <div className="shrink-0 text-slate-200 peer-checked:text-primary transition-colors">
                              <span className="material-symbols-outlined text-[24px] filled">check_circle</span>
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                  <button type="submit" className="w-full sm:w-auto flex-1 rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2">
                    Save & Finish
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleFinish(e); }} className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors py-2 px-4 rounded-lg hover:bg-slate-100">
                    Skip for now
                  </a>
                </div>
              </form>
            </div>
            
            <div className="bg-slate-50 px-6 sm:px-10 py-4 border-t border-slate-200 flex items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-slate-400">lock</span>
                <span>Your data is secure</span>
              </div>
              <div className="flex gap-4">
                <a href="/privacy" className="hover:text-primary">Privacy</a>
                <a href="#" className="hover:text-primary">Help</a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}