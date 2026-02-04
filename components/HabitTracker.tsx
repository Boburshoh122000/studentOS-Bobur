
import React, { useState, useRef, useEffect } from 'react';
import { Screen, NavigationProps } from '../types';
import { habitApi, authApi } from '../src/services/api';
import { ThemeToggle } from './ThemeToggle';
import { NotificationDropdown } from './NotificationDropdown';
import toast from 'react-hot-toast';

interface Habit {
  id: string;
  title: string;
  icon: string;
  color: string;
  completedToday: boolean;
  streak: number;
  logs: { completedAt: string }[];
}

interface HabitStats {
  totalHabits: number;
  completedToday: number;
  longestStreak: number;
  completionRate: number;
}

const getColorClasses = (color: string) => {
  switch (color) {
    case 'indigo': return { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-300' };
    case 'teal': return { bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-600 dark:text-teal-300' };
    case 'amber': return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-300' };
    case 'blue': return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-300' };
    default: return { bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-300' };
  }
};

export default function HabitTracker({ navigateTo }: NavigationProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [streakFreezes, setStreakFreezes] = useState(2);
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [showNewHabitModal, setShowNewHabitModal] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitIcon, setNewHabitIcon] = useState('check_circle');
  const [newHabitColor, setNewHabitColor] = useState('indigo');
  const hoverTimeoutRef = useRef<any>(null);
  const MAX_FREEZES = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [habitsRes, statsRes] = await Promise.all([
        habitApi.list(),
        habitApi.getStats()
      ]);
      
      if (habitsRes.data) setHabits(habitsRes.data as Habit[]);
      if (statsRes.data) setStats(statsRes.data as HabitStats);
    } catch (error) {
      console.error('Failed to fetch habits:', error);
      toast.error('Failed to load habits');
    } finally {
      setIsLoading(false);
    }
  };

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

  const toggleHabit = async (id: string, currentlyCompleted: boolean) => {
    try {
      if (currentlyCompleted) {
        await habitApi.unlog(id);
        toast.success('Habit unmarked');
      } else {
        await habitApi.log(id);
        toast.success('Habit completed! 🎉');
      }
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Failed to toggle habit:', error);
      toast.error('Failed to update habit');
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    try {
      const { error } = await habitApi.create({
        title: newHabitTitle,
        icon: newHabitIcon,
        color: newHabitColor
      });

      if (error) {
        toast.error(error);
        return;
      }

      toast.success('Habit created!');
      setNewHabitTitle('');
      setShowNewHabitModal(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to create habit');
    }
  };

  const handleDeleteHabit = async (id: string) => {
    if (!confirm('Are you sure you want to delete this habit?')) return;
    
    try {
      await habitApi.delete(id);
      toast.success('Habit deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete habit');
    }
  };

  const maxStreak = stats?.longestStreak || 0;
  const completedCount = stats?.completedToday || 0;
  const completionRate = stats?.completionRate || 0;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-text-sub">Loading habits...</p>
        </div>
      </div>
    );
  }

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
               { screen: Screen.FINANCE, icon: 'payments', label: 'Finance Tracker' },
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
          <div 
            onClick={() => navigateTo(Screen.PROFILE)}
            className={`flex items-center ${isSidebarExpanded ? 'gap-3 px-3 py-2 w-full' : 'justify-center size-10'} rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer`}
          >
            <div className="size-8 rounded-full bg-gray-200 bg-cover bg-center ring-2 ring-white dark:ring-gray-700 flex-shrink-0" style={{ backgroundImage: "url('https://ui-avatars.com/api/?name=User&background=random')" }}></div>
            <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isSidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                <span className="text-sm font-bold text-text-main dark:text-white truncate">My Profile</span>
                <span className="text-xs text-text-sub truncate">View settings</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-background-light dark:bg-background-dark">
        <header className="h-20 px-8 flex items-center justify-between flex-shrink-0 bg-background-light dark:bg-background-dark z-10">
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-text-main dark:text-white flex items-center gap-3">
              Habit Tracker
            </h2>
            <p className="text-sm text-text-sub">Track your daily goals, build consistency, and analyze your progress.</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <NotificationDropdown />
            <button 
              onClick={() => setShowNewHabitModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors shadow-sm text-sm font-medium"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Habit
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 pb-8 pt-2">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-text-sub">Best Streak</span>
                  <span className="material-symbols-outlined text-orange-500 bg-orange-50 dark:bg-orange-900/20 p-1.5 rounded-md">local_fire_department</span>
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
                  <span className="material-symbols-outlined text-primary bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded-md">data_usage</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-text-main dark:text-white">{completionRate}%</h3>
                </div>
                <p className="text-xs text-text-sub mt-2">{completedCount} of {habits.length} habits done</p>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mt-3">
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
                </div>
              </div>

              <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-text-sub">Active Habits</span>
                  <span className="material-symbols-outlined text-purple-500 bg-purple-50 dark:bg-purple-900/20 p-1.5 rounded-md">list_alt</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-text-main dark:text-white">{habits.length}</h3>
                </div>
                <p className="text-xs text-text-sub mt-2">Total tracked habits</p>
              </div>
            </div>

            {/* Habits List */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-text-main dark:text-white">Today's Habits</h3>
              
              {habits.length === 0 ? (
                <div className="bg-card-light dark:bg-card-dark rounded-xl p-12 text-center border border-gray-100 dark:border-gray-800">
                  <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700 mb-4">track_changes</span>
                  <h4 className="text-lg font-bold text-text-main dark:text-white mb-2">No habits yet</h4>
                  <p className="text-text-sub mb-4">Start building your daily routine by creating your first habit.</p>
                  <button 
                    onClick={() => setShowNewHabitModal(true)}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                  >
                    Create Your First Habit
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {habits.map((habit) => {
                    const colors = getColorClasses(habit.color || 'indigo');
                    return (
                      <div key={habit.id} className={`bg-white dark:bg-card-dark rounded-xl p-5 border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${habit.completedToday ? 'border-green-200 dark:border-green-900/30' : 'border-gray-100 dark:border-gray-800'}`}>
                        {habit.completedToday && (
                          <div className="absolute top-0 right-0 p-0">
                            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-bl-xl text-xs font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span> Completed
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-4">
                            <div className={`size-12 rounded-lg ${colors.bg} flex items-center justify-center ${colors.text}`}>
                              <span className="material-symbols-outlined">{habit.icon || 'check_circle'}</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-text-main dark:text-white">{habit.title}</h4>
                              <p className="text-sm text-text-sub">Streak: {habit.streak} days</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 mr-12 sm:mr-0">
                             <div className="flex items-center gap-1 text-orange-500 bg-orange-50 dark:bg-orange-900/10 px-2 py-1 rounded-md">
                              <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
                              <span className="text-xs font-bold">{habit.streak} Days</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                          <div className="flex gap-2 w-full sm:w-auto">
                            {!habit.completedToday ? (
                               <button 
                                 onClick={() => toggleHabit(habit.id, false)} 
                                 className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark text-sm font-medium transition-colors shadow-sm shadow-primary/20"
                               >
                                 Mark Complete
                               </button>
                            ) : (
                               <button 
                                 onClick={() => toggleHabit(habit.id, true)} 
                                 className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm font-medium transition-colors shadow-sm"
                               >
                                 Undo
                               </button>
                            )}
                            <button 
                              onClick={() => handleDeleteHabit(habit.id)}
                              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* New Habit Modal */}
      {showNewHabitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-card-dark rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text-main dark:text-white">Create New Habit</h3>
              <button 
                onClick={() => setShowNewHabitModal(false)}
                className="text-text-sub hover:text-text-main transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-main dark:text-white mb-2">Habit Name</label>
                <input
                  type="text"
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  placeholder="e.g., Read for 30 minutes"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-main dark:text-white mb-2">Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {['check_circle', 'fitness_center', 'menu_book', 'code', 'water_drop', 'self_improvement', 'edit_note', 'music_note'].map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewHabitIcon(icon)}
                      className={`p-3 rounded-lg border transition-colors ${newHabitIcon === icon ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 dark:border-gray-700 text-text-sub hover:border-primary'}`}
                    >
                      <span className="material-symbols-outlined">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-main dark:text-white mb-2">Color</label>
                <div className="flex gap-2">
                  {['indigo', 'teal', 'amber', 'blue'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewHabitColor(color)}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        newHabitColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                      } ${
                        color === 'indigo' ? 'bg-indigo-500' :
                        color === 'teal' ? 'bg-teal-500' :
                        color === 'amber' ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewHabitModal(false)}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-text-main dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
                >
                  Create Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
