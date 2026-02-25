
import React, { useState, useEffect, useRef } from 'react';
import { notificationApi } from '../src/services/api';
import toast from 'react-hot-toast';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    const res = await notificationApi.list();
    if (res.data) {
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      await notificationApi.markRead(id);
      fetchNotifications();
  };

  const handleMarkAllRead = async () => {
      await notificationApi.markAllRead();
      fetchNotifications();
      toast.success('All notifications marked as read');
  };

  const getIcon = (type: string) => {
      switch(type) {
          case 'SUCCESS': return 'check_circle';
          case 'WARNING': return 'warning';
          case 'ERROR': return 'error';
          case 'SYSTEM': return 'dns';
          default: return 'notifications';
      }
  };

  const getColor = (type: string) => {
      switch(type) {
          case 'SUCCESS': return 'text-green-500';
          case 'WARNING': return 'text-yellow-500';
          case 'ERROR': return 'text-red-500';
          case 'SYSTEM': return 'text-blue-500';
          default: return 'text-primary';
      }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 text-text-sub hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
            <span className="absolute top-0 right-0 size-3 bg-red-500 rounded-full border-2 border-white dark:border-card-dark animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 md:w-96 bg-white dark:bg-card-dark rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
                <button 
                    onClick={handleMarkAllRead}
                    className="text-xs text-primary hover:text-primary/80 font-medium"
                >
                    Mark all read
                </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                    <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">notifications_off</span>
                    <p className="text-sm">No notifications yet</p>
                </div>
            ) : (
                notifications.map((n) => (
                    <div 
                        key={n.id} 
                        className={`p-4 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors relative group ${!n.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                    >
                        <div className="flex gap-3">
                            <div className={`mt-1 ${getColor(n.type)}`}>
                                <span className="material-symbols-outlined text-[20px]">{getIcon(n.type)}</span>
                            </div>
                            <div className="flex-1">
                                <h4 className={`text-sm ${!n.isRead ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                                    {n.title}
                                </h4>
                                <p className="text-xs text-text-sub mt-1 leading-relaxed">
                                    {n.message}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-2">
                                    {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            {!n.isRead && (
                                <button 
                                    onClick={(e) => handleMarkRead(n.id, e)}
                                    className="absolute top-4 right-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Mark as read"
                                >
                                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                </button>
                            )}
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
