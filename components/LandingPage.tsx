import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, NavigationProps } from '../types';
import { useAuth } from '../src/contexts/AuthContext';

const TypingAnimation = () => {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const phrases = [
    "while you study",
    "with ease",
    "like a pro", 
    "for your future"
  ];

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % phrases.length;
      const fullText = phrases[i];

      setText(isDeleting 
        ? fullText.substring(0, text.length - 1) 
        : fullText.substring(0, text.length + 1)
      );

      setTypingSpeed(isDeleting ? 30 : 150);

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed]);

  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
      {text}
      <span className="animate-pulse border-r-2 border-purple-600 ml-1"></span>
    </span>
  );
};

export default function LandingPage({ navigateTo }: NavigationProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeSlide, setActiveSlide] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Auth-guarded navigation for tools
  const handleToolClick = (toolPath: string) => {
    if (isAuthenticated) {
      navigate(toolPath);
    } else {
      // Redirect to signup with intended destination
      const redirectTo = encodeURIComponent(toolPath);
      navigate(`/signup/step-1?redirect_to=${redirectTo}`);
    }
  };

  useEffect(() => {
    // Slide rotation
    const slideTimer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 4);
    }, 5000);

    // Real-time clock update
    const clockTimer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // Update every minute

    return () => {
      clearInterval(slideTimer);
      clearInterval(clockTimer);
    };
  }, []);

  const getGreeting = () => {
    const hour = currentDate.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const formattedTime = currentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="bg-[#f0f2f5] min-h-screen overflow-x-hidden selection:bg-primary/20 pt-20">
      {/* Liquid Background Blobs */}
      <div className="fixed inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <header className="fixed top-0 z-50 w-full bg-white/80 dark:bg-[#111421]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-20 transition-all duration-200">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => navigateTo(Screen.LANDING)}>
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[20px]">school</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">StudentOS</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate('/')} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors">Home</button>
            <button onClick={() => navigate('/about')} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors">About</button>
            <div className="group relative h-full flex items-center">
              <button className="flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors py-6 focus:outline-none">
                Tools
                <span className="material-symbols-outlined text-[18px] transition-transform duration-300 group-hover:-rotate-180">keyboard_arrow_down</span>
              </button>
              <div className="mega-menu absolute left-1/2 top-[80%] z-50 w-[640px] -translate-x-1/2 translate-y-2 rounded-2xl border border-white/50 bg-white/90 backdrop-blur-xl p-5 shadow-2xl ring-1 ring-black/5 transition-all duration-300 ease-out invisible opacity-0 scale-95 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 dark:bg-[#1e2130]/95 dark:border-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <button onClick={() => handleToolClick('/app/cv-ats')} className="w-full text-left flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group/item">
                      <span className="material-symbols-outlined text-primary mt-1 group-hover/item:scale-110 transition-transform">fact_check</span>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">CV & ATS Checker</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Optimize for recruitment algorithms</div>
                      </div>
                    </button>
                    <button onClick={() => handleToolClick('/app/cover-letter')} className="w-full text-left flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group/item">
                      <span className="material-symbols-outlined text-primary mt-1 group-hover/item:scale-110 transition-transform">edit_document</span>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">AI Cover Letter Generator</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Create tailored letters in seconds</div>
                      </div>
                    </button>
                    <button onClick={() => handleToolClick('/app/jobs')} className="w-full text-left flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group/item">
                      <span className="material-symbols-outlined text-primary mt-1 group-hover/item:scale-110 transition-transform">work_outline</span>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">Job Finder</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Internships & graduate roles</div>
                      </div>
                    </button>
                    <button onClick={() => handleToolClick('/app/plagiarism')} className="w-full text-left flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group/item">
                      <span className="material-symbols-outlined text-primary mt-1 group-hover/item:scale-110 transition-transform">gavel</span>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">Plagiarism & AI Checker</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Ensure academic integrity</div>
                      </div>
                    </button>
                  </div>
                  <div className="space-y-2">
                    <button onClick={() => handleToolClick('/app/presentation')} className="w-full text-left flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group/item">
                      <span className="material-symbols-outlined text-primary mt-1 group-hover/item:scale-110 transition-transform">co_present</span>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">Presentation Maker</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Create slides in minutes</div>
                      </div>
                    </button>
                    <button onClick={() => handleToolClick('/app/scholarships')} className="w-full text-left flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group/item">
                      <span className="material-symbols-outlined text-primary mt-1 group-hover/item:scale-110 transition-transform">school</span>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">Scholarship Finder</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Find funding opportunities</div>
                      </div>
                    </button>
                    <button onClick={() => handleToolClick('/app/habit-tracker')} className="w-full text-left flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group/item">
                      <span className="material-symbols-outlined text-primary mt-1 group-hover/item:scale-110 transition-transform">check_circle</span>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">Habit Tracker</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Build study routines</div>
                      </div>
                    </button>
                    <button onClick={() => handleToolClick('/app/learning-plan')} className="w-full text-left flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group/item">
                      <span className="material-symbols-outlined text-primary mt-1 group-hover/item:scale-110 transition-transform">route</span>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">Learning Plan Builder</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Customized curriculum paths</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={() => handleToolClick('/app/community')} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors">Community</button>
            <button onClick={() => navigate('/blog')} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors">Blog</button>
            <button onClick={() => navigate('/contact')} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors">Contact</button>
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/signin')} className="hidden text-sm font-medium text-slate-900 dark:text-white hover:text-primary dark:hover:text-primary sm:block transition-colors">Sign In</button>
            <button onClick={() => navigate('/signup/step-1')} className="rounded-xl bg-slate-900 dark:bg-primary px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800 dark:hover:bg-primary-dark hover:shadow-lg hover:shadow-slate-500/20 active:scale-95">Get Started</button>
          </div>
        </div>
      </header>
      <main className="flex flex-col items-center">
        <section className="relative w-full px-4 py-16 sm:px-6 lg:px-8 lg:py-24 max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="flex flex-col gap-6 text-left relative z-10">
              <div className="inline-flex w-fit items-center rounded-full border border-blue-200/50 bg-white/60 backdrop-blur-md px-3 py-1 text-sm font-medium text-primary shadow-sm">
                <span className="mr-2 flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                New: AI Cover Letter Generator
              </div>




              <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-slate-900 sm:text-6xl drop-shadow-sm min-h-[140px] sm:min-h-[auto]">
                Build your career <br />
                <TypingAnimation />
              </h1>

              <div className="flex flex-wrap gap-3 pt-2">
                <button onClick={() => navigate('/signup/step-1')} className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-base font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/30 hover:shadow-primary/40">
                  Start free 3-day trial
                </button>
                <button 
                  onClick={() => {
                    const element = document.getElementById('features');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-white/60 bg-white/40 backdrop-blur-md px-6 text-base font-bold text-slate-700 transition-colors hover:bg-white/60 hover:text-slate-900 shadow-sm cursor-pointer"
                >
                  Explore tools
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="material-symbols-outlined text-[18px] text-green-500 filled">check_circle</span>
                <span>No credit card required</span>
              </div>
            </div>
            
            {/* 3D Floating Screen Container */}
            <div className="relative lg:h-auto z-10 perspective-1000">
              {/* Glass liquid glow behind screen */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-purple-500/30 blur-3xl rounded-full opacity-60 animate-blob"></div>

              <div 
                className="relative overflow-hidden rounded-2xl border border-white/40 shadow-2xl bg-white/90 backdrop-blur-xl aspect-[4/3] w-full group transition-transform duration-700 ease-in-out hover:scale-[1.02]"
                style={{ transform: 'perspective(1000px) rotateY(-8deg) rotateX(4deg) scale(0.95)' }}
              >
                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-transparent z-20 pointer-events-none"></div>

                {/* Status Bar */}
                <div className="h-8 bg-white/50 backdrop-blur-sm border-b border-white/20 flex items-center justify-between px-4 gap-2">
                    <div className="flex gap-2">
                      <div className="size-3 rounded-full bg-red-400 shadow-inner"></div>
                      <div className="size-3 rounded-full bg-amber-400 shadow-inner"></div>
                      <div className="size-3 rounded-full bg-green-400 shadow-inner"></div>
                    </div>
                    <div className="text-[10px] font-medium text-slate-500 tracking-wide">{formattedTime}</div>
                </div>

                {/* Carousel Container */}
                <div className="relative w-full h-[calc(100%-32px)] bg-slate-50/50 overflow-hidden">
                  
                  {/* Slide 1: Dashboard Mock */}
                  <div className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${activeSlide === 0 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'} p-6 sm:p-8 flex flex-col`}>
                     <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">{getGreeting()}, Alex</h2>
                            <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                              {formattedDate}
                            </p>
                        </div>
                        
                        {/* Search Bar - Real Data Component */}
                        <div className="hidden sm:flex mx-6 flex-1 relative group">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] group-focus-within:text-primary transition-colors">search</span>
                            <input 
                              type="text" 
                              placeholder="Search..." 
                              className="w-full bg-white border border-slate-200 rounded-full py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-700 placeholder:text-slate-400 shadow-sm"
                            />
                        </div>

                        <div className="size-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-100 border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhG4np0VVE22WojP2CGz7Ch6oi2UbBGvY215GNeJl-qbqiIkvVO0e4VJCR48HYD7zcjJ60KfnEAbHOCeMGlVJwochpZSwqE5sh6rBSYgIsX8LQz5UE6yBSk2CJMQ8HXNzUxgZG2yHaebJYk7QmIl7Z2KUZH1fL8p4S0iaspKV4wNVdgBRvRv1lXYD-NeEM5GHeF11YqbTWAvllHQzT4AqVhoA_CKzfcl5nPMHa4BOHNacdhm-S2FFPGfH8ZhQF4TdbUdOb1vS8lg0" alt="Profile" className="w-full h-full object-cover" />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="glass p-4 rounded-2xl border border-blue-100/50 bg-blue-50/50">
                            <div className="text-blue-600 font-bold text-3xl">3.8</div>
                            <div className="text-blue-400 text-xs font-semibold uppercase tracking-wider">GPA</div>
                        </div>
                        <div className="glass p-4 rounded-2xl border border-green-100/50 bg-green-50/50">
                            <div className="text-green-600 font-bold text-3xl">12</div>
                            <div className="text-green-400 text-xs font-semibold uppercase tracking-wider">Applications</div>
                        </div>
                     </div>
                     <div className="glass rounded-2xl p-5 shadow-sm flex-1 flex flex-col border border-white/60">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-700 text-sm">Study Hours</h3>
                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">This Week</span>
                        </div>
                        <div className="flex-1 flex items-end justify-between gap-2 px-2">
                            {[40, 70, 45, 90, 60, 30, 50].map((h, i) => (
                                <div key={i} className="w-full bg-primary/20 rounded-t-md relative group cursor-pointer hover:bg-primary/40 transition-colors" style={{ height: `${h}%` }}>
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">{h}m</div>
                                </div>
                            ))}
                        </div>
                     </div>
                  </div>

                  {/* Slide 2: Job Board Mock */}
                  <div className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${activeSlide === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'} p-6 sm:p-8 flex flex-col`}>
                     <div className="flex items-center justify-between mb-6 border-b border-slate-200/50 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-blue-100/50 text-blue-600 flex items-center justify-center shadow-sm"><span className="material-symbols-outlined text-xl">work</span></div>
                            <div><div className="font-bold text-slate-800 text-lg">Job Board</div><div className="text-xs text-slate-400 font-medium">Applications Pipeline</div></div>
                        </div>
                     </div>
                     <div className="flex-1 grid grid-cols-3 gap-3">
                        <div className="bg-slate-100/50 rounded-xl p-2 space-y-2 border border-slate-200/50">
                            <div className="flex justify-between items-center mb-1 px-1">
                                <div className="text-[10px] font-bold text-slate-500 uppercase">Wishlist</div>
                                <span className="bg-white text-slate-600 text-[10px] px-1.5 rounded-full font-bold shadow-sm">4</span>
                            </div>
                            <div className="glass-card p-2 rounded-lg shadow-sm border border-white/50">
                                <div className="flex justify-between mb-1"><span className="font-bold text-xs text-slate-800">Product Intern</span></div>
                                <div className="text-[10px] text-slate-500 flex items-center gap-1"><div className="size-1.5 rounded-full bg-green-500"></div> Spotify</div>
                            </div>
                            <div className="glass-card p-2 rounded-lg shadow-sm border border-white/50">
                                <div className="flex justify-between mb-1"><span className="font-bold text-xs text-slate-800">UX Research</span></div>
                                <div className="text-[10px] text-slate-500 flex items-center gap-1"><div className="size-1.5 rounded-full bg-orange-500"></div> Airbnb</div>
                            </div>
                        </div>
                        <div className="bg-slate-100/50 rounded-xl p-2 space-y-2 border border-slate-200/50">
                            <div className="flex justify-between items-center mb-1 px-1">
                                <div className="text-[10px] font-bold text-slate-500 uppercase">Applied</div>
                                <span className="bg-blue-100 text-blue-600 text-[10px] px-1.5 rounded-full font-bold shadow-sm">12</span>
                            </div>
                            <div className="glass-card p-2 rounded-lg shadow-sm border border-white/50 border-l-2 border-l-blue-500">
                                <div className="flex justify-between mb-1"><span className="font-bold text-xs text-slate-800">Frontend Dev</span></div>
                                <div className="text-[10px] text-slate-500">Linear</div>
                            </div>
                        </div>
                        <div className="bg-slate-100/50 rounded-xl p-2 space-y-2 border border-slate-200/50">
                            <div className="flex justify-between items-center mb-1 px-1">
                                <div className="text-[10px] font-bold text-slate-500 uppercase">Interview</div>
                                <span className="bg-green-100 text-green-600 text-[10px] px-1.5 rounded-full font-bold shadow-sm">2</span>
                            </div>
                            <div className="glass-card p-2 rounded-lg shadow-sm border border-white/50 border-l-2 border-l-green-500">
                                <div className="flex justify-between mb-1"><span className="font-bold text-xs text-slate-800">Design Intern</span></div>
                                <div className="text-[10px] text-slate-500">Netflix</div>
                                <div className="mt-1 bg-green-50/80 text-green-700 text-[9px] px-1.5 py-0.5 rounded w-fit font-bold backdrop-blur-sm">Tomorrow</div>
                            </div>
                        </div>
                     </div>
                  </div>

                  {/* Slide 3: Learning Plan Mock */}
                  <div className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${activeSlide === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'} p-6 sm:p-8 flex flex-col`}>
                     <div className="flex items-center gap-5 mb-6 glass p-4 rounded-2xl border border-white/50">
                        <div className="relative size-12 flex-shrink-0">
                            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                              <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                              <path className="text-green-500 drop-shadow-sm" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="85, 100" strokeLinecap="round" strokeWidth="4"></path>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-green-600 font-bold text-xs">85%</div>
                        </div>
                        <div>
                            <div className="font-bold text-lg text-slate-900">Weekly Progress</div>
                            <div className="text-xs text-slate-500 font-medium">Just 2 tasks left!</div>
                        </div>
                     </div>
                     <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 glass-card rounded-xl shadow-sm hover:translate-x-1 transition-transform cursor-pointer">
                            <div className="size-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm"><span className="material-symbols-outlined text-lg">menu_book</span></div>
                            <div className="flex-1">
                                <div className="font-bold text-slate-800 text-xs">Read "Design of Everyday Things"</div>
                                <div className="text-[10px] text-slate-500 font-medium">Chapter 4</div>
                            </div>
                            <div className="size-4 rounded-full border-2 border-slate-200"></div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50/50 border border-transparent rounded-xl opacity-60">
                            <div className="size-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center grayscale"><span className="material-symbols-outlined text-lg">code</span></div>
                            <div className="flex-1">
                                <div className="font-bold text-slate-800 text-xs line-through">React Assignment</div>
                                <div className="text-[10px] text-slate-500 font-medium">Module 3</div>
                            </div>
                            <div className="size-4 rounded-full bg-green-500 flex items-center justify-center text-white"><span className="material-symbols-outlined text-[10px] font-bold">check</span></div>
                        </div>
                        <div className="flex items-center gap-3 p-3 glass-card rounded-xl shadow-sm hover:translate-x-1 transition-transform cursor-pointer">
                            <div className="size-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shadow-sm"><span className="material-symbols-outlined text-lg">edit_document</span></div>
                            <div className="flex-1">
                                <div className="font-bold text-slate-800 text-xs">Draft Cover Letter</div>
                                <div className="text-[10px] text-slate-500 font-medium">Google Internship</div>
                            </div>
                            <div className="size-4 rounded-full border-2 border-slate-200"></div>
                        </div>
                     </div>
                  </div>

                  {/* Slide 4: CV Checker Mock */}
                  <div className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${activeSlide === 3 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'} p-6 sm:p-8 flex flex-col`}>
                     <div className="flex items-center gap-3 mb-6">
                        <div className="size-10 rounded-xl bg-indigo-100/50 text-indigo-600 flex items-center justify-center shadow-sm"><span className="material-symbols-outlined text-xl">fact_check</span></div>
                        <div>
                            <div className="font-bold text-slate-800 text-lg">CV Analysis</div>
                            <div className="text-xs text-slate-400 font-medium">Resume vs Job Description</div>
                        </div>
                     </div>
                     <div className="flex gap-4 h-full">
                        <div className="flex-1 glass border border-white/50 rounded-lg p-3 relative overflow-hidden group">
                            <div className="space-y-2 opacity-30 blur-[1px] group-hover:blur-0 transition-all duration-500">
                                <div className="h-4 w-1/2 bg-slate-400 rounded"></div>
                                <div className="h-2 w-full bg-slate-300 rounded"></div>
                                <div className="h-2 w-full bg-slate-300 rounded"></div>
                                <div className="h-2 w-3/4 bg-slate-300 rounded"></div>
                                <div className="h-20 w-full bg-slate-300 rounded mt-4"></div>
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md shadow-xl rounded-full p-2 scale-110">
                                <span className="material-symbols-outlined text-green-500 text-2xl">check_circle</span>
                            </div>
                        </div>
                        <div className="w-1/3 flex flex-col gap-3">
                            <div className="glass-card border border-white/60 shadow-sm rounded-xl p-3 flex flex-col items-center justify-center">
                                <div className="text-3xl font-bold text-indigo-600 drop-shadow-sm">92%</div>
                                <div className="text-[10px] text-slate-400 uppercase font-bold">Match Score</div>
                            </div>
                            <div className="flex-1 bg-red-50/50 border border-red-100/50 rounded-xl p-3 backdrop-blur-sm">
                                <div className="text-[10px] font-bold text-red-400 uppercase mb-2">Missing Keywords</div>
                                <div className="flex flex-wrap gap-1">
                                    <span className="bg-white/80 text-red-600 text-[9px] px-1.5 py-0.5 rounded border border-red-100 shadow-sm">Figma</span>
                                    <span className="bg-white/80 text-red-600 text-[9px] px-1.5 py-0.5 rounded border border-red-100 shadow-sm">Agile</span>
                                </div>
                            </div>
                        </div>
                     </div>
                  </div>

                  {/* Navigation Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-1.5 bg-white/40 backdrop-blur-md rounded-full shadow-sm border border-white/20 ring-1 ring-black/5">
                    {[0, 1, 2, 3].map((idx) => (
                        <button 
                          key={idx} 
                          onClick={() => setActiveSlide(idx)} 
                          className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === idx ? 'w-6 bg-slate-800' : 'w-1.5 bg-slate-400 hover:bg-slate-600'}`} 
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Floating Badge (Glass Card) */}
              <div className="absolute -bottom-6 -left-6 hidden md:flex items-center gap-3 rounded-2xl bg-white/70 backdrop-blur-xl p-4 shadow-2xl border border-white/50 animate-float z-20 ring-1 ring-black/5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100/80 text-green-600 shadow-sm">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">GPA +0.4</p>
                  <p className="text-xs text-slate-500">This semester</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full border-y border-white/30 bg-white/40 backdrop-blur-sm py-10">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <p className="mb-6 text-sm font-semibold uppercase tracking-wider text-slate-400">Trusted by high-achievers at</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale transition-all hover:grayscale-0">
              <div className="flex items-center gap-2 text-xl font-bold text-slate-600 hover:text-primary transition-colors cursor-default">
                <span className="material-symbols-outlined">account_balance</span> Stanford
              </div>
              <div className="flex items-center gap-2 text-xl font-bold text-slate-600 hover:text-primary transition-colors cursor-default">
                <span className="material-symbols-outlined">school</span> MIT
              </div>
              <div className="flex items-center gap-2 text-xl font-bold text-slate-600 hover:text-primary transition-colors cursor-default">
                <span className="material-symbols-outlined">menu_book</span> Harvard
              </div>
              <div className="flex items-center gap-2 text-xl font-bold text-slate-600 hover:text-primary transition-colors cursor-default">
                <span className="material-symbols-outlined">local_library</span> Oxford
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full px-4 py-20 sm:px-6 lg:px-8 max-w-7xl scroll-mt-32">
          <div className="mb-16 flex flex-col items-center text-center">
            <h2 className="mb-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Powerful tools for your future
            </h2>
            <p className="max-w-2xl text-lg text-slate-600">
              Stop juggling spreadsheets and notes. StudentOS gives you a competitive edge with a suite of professional-grade tools designed for students.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: 'fact_check', title: 'CV & ATS Checker', desc: 'AI-powered analysis to ensure your resume passes Applicant Tracking Systems and gets seen by recruiters.', color: 'blue', action: 'Check CV', route: '/app/cv-ats' },
              { icon: 'edit_document', title: 'Cover Letter Generator', desc: 'Instantly create tailored cover letters for any job application using AI.', color: 'pink', action: 'Write Letter', route: '/app/cover-letter' },
              { icon: 'work_outline', title: 'Job Finder', desc: 'Smart filters specifically for student internships, part-time roles, and graduate programs.', color: 'purple', action: 'Find Jobs', route: '/app/jobs' },
              { icon: 'gavel', title: 'Plagiarism & AI Checker', desc: 'Verify your essays are original and citation-compliant before you hit submit.', color: 'orange', action: 'Check Work', route: '/app/plagiarism' },
              { icon: 'school', title: 'Scholarship Finder', desc: 'Match with thousands of scholarships based on your unique profile and academic interests.', color: 'teal', action: 'Find Funds', route: '/app/scholarships' },
              { icon: 'co_present', title: 'Presentation Maker', desc: 'AI-generated slides in multiple languages.', color: 'rose', action: 'Create Slides', route: '/app/presentation' },
              { icon: 'calendar_today', title: 'Habit Tracker', desc: 'Daily consistency with Telegram integration.', color: 'emerald', action: 'Start Tracking', route: '/app/habit-tracker' },
              { icon: 'map', title: 'Learning Plan Builder', desc: 'Customized academic and career roadmaps.', color: 'indigo', action: 'Build Plan', route: '/app/learning-plan' },
            ].map((feature, idx) => (
              <div key={idx} className="glass-card group relative flex flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-white/60">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-${feature.color}-50 text-${feature.color === 'blue' ? 'primary' : feature.color + '-600'} shadow-sm border border-${feature.color}-100`}>
                   <span className={`material-symbols-outlined ${feature.color === 'blue' ? 'text-primary' : `text-${feature.color}-600`}`}>{feature.icon}</span>
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-500">
                  {feature.desc}
                </p>
                <button onClick={() => navigate(feature.route)} className="inline-flex items-center text-sm font-bold text-primary hover:text-primary-dark transition-colors">
                  {feature.action} <span className="material-symbols-outlined ml-1 text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="w-full border-t border-white/20 bg-white/40 backdrop-blur-md py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded bg-gradient-to-br from-primary to-blue-600 text-white shadow-md">
                <span className="material-symbols-outlined text-[14px]">school</span>
              </div>
              <span className="text-lg font-bold text-slate-900">StudentOS</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              <a href="/privacy" className="text-sm text-slate-500 hover:text-primary transition-colors">Privacy Policy</a>
              <a href="/terms" className="text-sm text-slate-500 hover:text-primary transition-colors">Terms of Service</a>
              <button onClick={() => navigate('/contact')} className="text-sm text-slate-500 hover:text-primary transition-colors">Contact Support</button>
            </div>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-primary transition-colors p-2 hover:bg-white/50 rounded-full">
                <span className="material-symbols-outlined">share</span>
              </a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors p-2 hover:bg-white/50 rounded-full">
                <span className="material-symbols-outlined">alternate_email</span>
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-slate-400">
            © 2023 StudentOS Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}