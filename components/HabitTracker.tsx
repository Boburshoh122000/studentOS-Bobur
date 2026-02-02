
import React, { useState, useRef } from 'react';
import { Screen, NavigationProps } from '../types';

interface Habit {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: 'indigo' | 'teal' | 'amber' | 'blue';
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
  history: ('completed' | 'missed' | 'skip')[]; // Last 4 days
}

const initialHabits: Habit[] = [
  {
    id: '1',
    title: 'Learn to Code',
    subtitle: 'Python Course • 1 hour daily',
    icon: 'code',
    color: 'indigo',
    currentStreak: 12,
    longestStreak: 15,
    completedToday: false,
    history: ['completed', 'completed', 'completed', 'missed']
  },
  {
    id: '2',
    title: 'Morning Meditation',
    subtitle: 'Mindfulness • 15 mins',
    icon: 'self_improvement',
    color: 'teal',
    currentStreak: 0,
    longestStreak: 21,
    completedToday: false,
    history: ['completed', 'missed', 'missed', 'missed']
  },
  {
    id: '3',
    title: 'Read Non-Fiction',
    subtitle: 'Personal Growth • 10 pages',
    icon: 'menu_book',
    color: 'amber',
    currentStreak: 5,
    longestStreak: 10,
    completedToday: true,
    history: ['completed', 'completed', 'completed', 'completed']
  },
  {
    id: '4',
    title: 'Drink Water',
    subtitle: 'Health • 2.5 Liters',
    icon: 'water_drop',
    color: 'blue',
    currentStreak: 24,
    longestStreak: 45,
    completedToday: false,
    history: ['completed', 'completed', 'completed', 'completed']
  }
];

const getColorClasses = (color: string) => {
  switch (color) {
    case 'indigo': return { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-300' };
    case 'teal': return { bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-600 dark:text-teal-300' };
    case 'amber': return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-300' };
    case 'blue': return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-300' };
    default: return { bg: 'bg-gray-50', text: 'text-gray-600' };
  }
};

export default function HabitTracker({ navigateTo }: NavigationProps) {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [streakFreezes, setStreakFreezes] = useState(2);
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const hoverTimeoutRef = useRef<any>(null);
  const MAX_FREEZES = 5;

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsSidebarHovered(true);
    }, 120);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsSidebarHovered(false);
    }, 320);
  };

  const isSidebarExpanded = isSidebarLocked || isSidebarHovered;

  const handleGetFreeze = () => {
    if (streakFreezes < MAX_FREEZES) {
      setStreakFreezes(prev => prev + 1);
    }
  };

  const toggleHabit = (id: string) => {
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        const isCompleted = !habit.completedToday;
        let newCurrentStreak = habit.currentStreak;
        let newLongestStreak = habit.longestStreak;

        if (isCompleted) {
          newCurrentStreak += 1;
          if (newCurrentStreak > newLongestStreak) {
            newLongestStreak = newCurrentStreak;
          }
        } else {
          newCurrentStreak = Math.max(0, newCurrentStreak - 1);
        }

        return {
          ...habit,
          completedToday: isCompleted,
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak
        };
      }
      return habit;
    }));
  };

  const maxStreak = Math.max(...habits.map(h => h.currentStreak));
  const completedCount = habits.filter(h => h.completedToday).length;
  const completionRate = Math.round((completedCount / habits.length) * 100);

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display overflow-hidden relative">
      {/* Spacer */}
      <div className={`${isSidebarLocked ? 'w-64' : 'w-20'} hidden md:block flex-shrink-0 transition-all duration-300 ease-in-out`} />

      {/* Sidebar */}
      <aside 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`${isSidebarExpanded ? 'w-64' : 'w-20'} bg-card-light dark:bg-card-dark border-r border-gray-200 dark:border-gray-800 flex-shrink-0 flex flex-col justify-between transition-all duration-300 ease-in-out hidden md:flex items-center py-6 absolute top-0 left-0 h-full z-50 shadow-xl`}
      >
        <button 
          onClick={() => setIsSidebarLocked(!isSidebarLocked)}
          className={`absolute -right-3 top-10 bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700 text-text-sub hover:text-primary rounded-full p-1 shadow-md transition-colors z-50 flex items-center justify-center size-6 ${isSidebarLocked ? 'text-primary border-primary' : ''}`}
        >
          <span className="material-symbols-outlined text-[14px]">{isSidebarLocked ? 'chevron_left' : 'chevron_right'}</span>
        </button>

        <div className={`flex flex-col ${isSidebarExpanded ? 'items-start px-4' : 'items-center'} gap-8 w-full transition-all duration-300`}>
          <div className={`flex items-center gap-3 w-full ${isSidebarExpanded ? 'justify-start' : 'justify-center'}`} onClick={() => navigateTo(Screen.LANDING)}>
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 cursor-pointer group hover:scale-105 transition-transform flex-shrink-0">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '24px' }}>school</span>
            </div>
            <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isSidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
              <h1 className="text-lg font-bold leading-none tracking-tight whitespace-nowrap">StudentOS</h1>
              <p className="text-xs text-text-sub font-medium mt-1 whitespace-nowrap">Pro Plan</p>
            </div>
          </div>
          
          <nav className={`flex flex-col ${isSidebarExpanded ? 'items-stretch' : 'items-center'} space-y-2 w-full`}>
             {[
               { screen: Screen.DASHBOARD, icon: 'dashboard', label: 'Dashboard' },
               { screen: Screen.CV_ATS, icon: 'description', label: 'CV and ATS' },
               { screen: Screen.COVER_LETTER, icon: 'edit_document', label: 'Cover Letter' },
               { screen: Screen.JOBS, icon: 'work', label: 'Job Finder' },
               { screen: Screen.LEARNING_PLAN, icon: 'book_2', label: 'Learning Plan' },
               { screen: null, icon: 'track_changes', label: 'Habit Tracker', active: true },
               { screen: Screen.SCHOLARSHIPS, icon: 'emoji_events', label: 'Scholarships' },
               { screen: Screen.PRESENTATION, icon: 'co_present', label: 'Presentation Maker' },
               { screen: Screen.PLAGIARISM, icon: 'plagiarism', label: 'Plagiarism Checker' },
             ].map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => item.screen && navigateTo(item.screen)}
                  className={`flex items-center ${isSidebarExpanded ? 'gap-3 px-3 py-2.5 w-full' : 'justify-center p-3 size-10'} rounded-lg transition-colors group relative ${item.active ? 'bg-primary/10 text-primary' : 'text-text-sub hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-text-main'}`}
                  title={!isSidebarExpanded ? item.label : ''}
                >
                  <span className={`material-symbols-outlined ${item.active ? 'icon-filled' : 'group-hover:text-primary'} ${!isSidebarExpanded ? 'text-2xl' : 'text-[20px]'}`}>
                    {item.icon}
                  </span>
                  {isSidebarExpanded && (
                    <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                  )}
                  {!isSidebarExpanded && (
                    <span className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      {item.label}
                    </span>
                  )}
                </button>
             ))}
          </nav>
        </div>

        <div className={`flex flex-col ${isSidebarExpanded ? 'items-stretch px-4' : 'items-center px-2'} space-y-2 w-full mt-auto`}>
          <button className={`flex items-center ${isSidebarExpanded ? 'gap-3 px-3 py-2.5 w-full' : 'justify-center p-3 size-10'} rounded-lg text-text-sub hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-text-main transition-colors group relative`} title="Settings">
            <span className="material-symbols-outlined group-hover:text-gray-600 dark:group-hover:text-gray-300 text-[20px]">settings</span>
            {isSidebarExpanded && <span className="text-sm font-medium">Settings</span>}
          </button>
          
          <div className={`flex items-center ${isSidebarExpanded ? 'gap-3 px-3 py-2 w-full' : 'justify-center size-10'} rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer`}>
            <div className="size-8 rounded-full bg-gray-200 bg-cover bg-center ring-2 ring-white dark:ring-gray-700 flex-shrink-0" data-alt="User profile picture placeholder" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAhG4np0VVE22WojP2CGz7Ch6oi2UbBGvY215GNeJl-qbqiIkvVO0e4VJCR48HYD7zcjJ60KfnEAbHOCeMGlVJwochpZSwqE5sh6rBSYgIsX8LQz5UE6yBSk2CJMQ8HXNzUxgZG2yHaebJYk7QmIl7Z2KUZH1fL8p4S0iaspKV4wNVdgBRvRv1lXYD-NeEM5GHeF11YqbTWAvllHQzT4AqVhoA_CKzfcl5nPMHa4BOHNacdhm-S2FFPGfH8ZhQF4TdbUdOb1vS8lg0')" }}></div>
            <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isSidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                <span className="text-sm font-bold text-text-main dark:text-white truncate">Alex Morgan</span>
                <span className="text-xs text-text-sub truncate">alex@student.edu</span>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-background-light dark:bg-background-dark">
        <header className="h-20 px-8 flex items-center justify-between flex-shrink-0 bg-background-light dark:bg-background-dark z-10">
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-text-main dark:text-white flex items-center gap-3">
              Habit Tracker
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">sync</span> Telegram Sync Active
              </span>
            </h2>
            <p className="text-sm text-text-sub">Track your daily goals, build consistency, and analyze your progress.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 text-text-sub hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm text-sm font-medium">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export Data
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors shadow-sm text-sm font-medium">
                <span className="material-symbols-outlined text-[18px]">add</span>
                New Habit
              </button>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-8 pb-8 pt-2">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-text-sub">Best Streak</span>
                  <span className="material-symbols-outlined text-orange-500 bg-orange-50 p-1.5 rounded-md">local_fire_department</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-text-main dark:text-white">{maxStreak}</h3>
                  <span className="text-sm text-text-sub">days</span>
                </div>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span> Top performing habit
                </p>
              </div>
              <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-text-sub">Today's Rate</span>
                  <span className="material-symbols-outlined text-primary bg-blue-50 p-1.5 rounded-md">data_usage</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-text-main dark:text-white">{completionRate}%</h3>
                </div>
                <p className="text-xs text-text-sub mt-2">{completedCount} of {habits.length} habits done</p>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
                  <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${completionRate}%` }}></div>
                </div>
              </div>
              <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 size-20 bg-blue-400/10 rounded-full blur-xl"></div>
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <span className="text-sm font-medium text-text-sub">Streak Freezes</span>
                  <span className="material-symbols-outlined text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded-md">ac_unit</span>
                </div>
                <div className="flex items-baseline gap-2 relative z-10">
                  <h3 className="text-3xl font-bold text-text-main dark:text-white">{streakFreezes}</h3>
                  <span className="text-sm text-text-sub">remaining</span>
                </div>
                <div className="mt-3 relative z-10">
                  {streakFreezes < MAX_FREEZES ? (
                    <button 
                      onClick={handleGetFreeze}
                      className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1 transition-colors"
                    >
                      Acquire (+1) <span className="material-symbols-outlined text-[14px]">add_circle</span>
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                      Max Capacity <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    </span>
                  )}
                  {streakFreezes < MAX_FREEZES && (
                    <p className="text-[10px] text-text-sub mt-1">Can earn {MAX_FREEZES - streakFreezes} more</p>
                  )}
                </div>
              </div>
              <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-text-sub">Active Habits</span>
                  <span className="material-symbols-outlined text-purple-500 bg-purple-50 p-1.5 rounded-md">list_alt</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-text-main dark:text-white">{habits.length}</h3>
                </div>
                <p className="text-xs text-text-sub mt-2">Across 4 categories</p>
              </div>
            </div>
            
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-text-main dark:text-white">Consistency Heatmap</h3>
                  <p className="text-sm text-text-sub">Visualizing your daily activity over the last 6 months</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-1 rounded-lg">
                  <button className="px-3 py-1 text-xs font-medium bg-white dark:bg-gray-700 text-text-main dark:text-white shadow-sm rounded-md">6 Months</button>
                  <button className="px-3 py-1 text-xs font-medium text-text-sub hover:text-text-main transition-colors">Year</button>
                </div>
              </div>
              <div className="w-full overflow-x-auto pb-2">
                <div className="min-w-[700px]">
                  <div className="flex gap-1 text-[10px] text-text-sub mb-2">
                    <span className="w-8"></span>
                    <span className="flex-1">Apr</span>
                    <span className="flex-1">May</span>
                    <span className="flex-1">Jun</span>
                    <span className="flex-1">Jul</span>
                    <span className="flex-1">Aug</span>
                    <span className="flex-1">Sep</span>
                    <span className="flex-1">Oct</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex flex-col gap-[3px] text-[10px] text-text-sub pt-1 w-6">
                      <span>Mon</span>
                      <span className="mt-2">Wed</span>
                      <span className="mt-2">Fri</span>
                    </div>
                    <div className="flex-1 grid grid-rows-7 grid-flow-col gap-[3px]">
                        {/* Mock data for heatmap visualization */}
                       {Array.from({ length: 180 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`size-3 rounded-sm ${Math.random() > 0.7 ? 'bg-gray-100 dark:bg-gray-800' : Math.random() > 0.5 ? 'bg-primary/20' : Math.random() > 0.3 ? 'bg-primary/60' : 'bg-primary'}`}
                          ></div>
                       ))}
                    </div>
                  </div>
                  <div className="flex justify-end items-center gap-2 mt-3 text-xs text-text-sub">
                    <span>Less</span>
                    <div className="size-3 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
                    <div className="size-3 rounded-sm bg-primary/20"></div>
                    <div className="size-3 rounded-sm bg-primary/40"></div>
                    <div className="size-3 rounded-sm bg-primary/60"></div>
                    <div className="size-3 rounded-sm bg-primary"></div>
                    <span>More</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-text-main dark:text-white">Today's Habits</h3>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {habits.map((habit) => {
                  const colors = getColorClasses(habit.color);
                  return (
                    <div key={habit.id} className={`bg-white dark:bg-card-dark rounded-xl p-5 border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${habit.completedToday ? 'border-green-200 dark:border-green-900/30' : 'border-gray-100 dark:border-gray-800'}`}>
                      {habit.completedToday && (
                        <div className="absolute top-0 right-0 p-0">
                          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-bl-xl text-xs font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span> Completed
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                          <div className={`size-12 rounded-lg ${colors.bg} flex items-center justify-center ${colors.text}`}>
                            <span className="material-symbols-outlined">{habit.icon}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-text-main dark:text-white">{habit.title}</h4>
                            <p className="text-sm text-text-sub">{habit.subtitle}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 mr-12 sm:mr-0">
                           <div className="flex items-center gap-1 text-orange-500 bg-orange-50 dark:bg-orange-900/10 px-2 py-1 rounded-md">
                            <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
                            <span className="text-xs font-bold">{habit.currentStreak} Days</span>
                          </div>
                          <span className="text-[10px] text-text-sub font-medium">Longest: {habit.longestStreak}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                        <div className="flex -space-x-1">
                          {/* Mock history visuals based on simple array for now */}
                          {habit.history.map((status, index) => (
                             <div 
                               key={index} 
                               className={`size-8 rounded-full border-2 border-white dark:border-card-dark flex items-center justify-center text-[10px] 
                               ${status === 'completed' ? 'bg-green-500 text-white' : 
                                 status === 'missed' ? 'bg-red-400 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`} 
                               title={index === 0 ? "Mon" : index === 1 ? "Tue" : index === 2 ? "Wed" : "Thu"}
                             >
                               {index === 0 ? "M" : index === 1 ? "T" : index === 2 ? "W" : "T"}
                             </div>
                          ))}
                          <div className={`size-8 rounded-full border-2 border-white dark:border-card-dark flex items-center justify-center text-[10px] font-bold
                            ${habit.completedToday ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`} 
                            title="Today">
                            Today
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button className={`flex-1 sm:flex-none px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${habit.completedToday ? 'opacity-50 pointer-events-none border-gray-200 text-gray-400' : 'border-gray-200 dark:border-gray-700 text-text-sub hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-text-main'}`}>Skip</button>
                          {!habit.completedToday ? (
                             <button onClick={() => toggleHabit(habit.id)} className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark text-sm font-medium transition-colors shadow-sm shadow-primary/20">Done</button>
                          ) : (
                             <button onClick={() => toggleHabit(habit.id)} className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm font-medium transition-colors shadow-sm">Undo</button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
