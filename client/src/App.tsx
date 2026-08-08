import React, { useEffect, useState } from 'react';
import type { CreateTaskDto, Task, StatusType } from './types/task';
import type { User } from './types/auth';
import AuthModal from './componenths/AuthModal';
import {
  Circle,
  Plus,
  Trash2,
  CheckCircle2,
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Settings,
  LogOut,
  Search,
  Bell,
  User as UserIcon,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';
import api from './api/axios';
import './App.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'today' | 'completed' | 'settings'>(
    'dashboard',
  );
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [profileName, setProfileName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);
      setProfileName(parsedUser.name);
    }
  }, []);

  const fetchTasks = async (): Promise<void> => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const response = await api.get<Task[]>('/tasks');
      setTasks(response.data);
      const pendingCount = response.data.filter((t) => t.status === 'pending').length;
      const newNotifs = [];
      if (pendingCount > 0) {
        newNotifs.push(`You have ${pendingCount} outstanding tasks.`);
      } else {
        newNotifs.push('All tasks completed! Great job 🎉');
      }
      setNotifications(newNotifs);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentUser]);

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!title.trim() || !currentUser) return;
    const newTaskData: CreateTaskDto = {
      title,
      priority: 'HIGH',
      userId: currentUser._id,
    };
    try {
      const response = await api.post<Task>('/tasks', newTaskData);
      setTasks([response.data, ...tasks]);
      setTitle('');
      setNotifications((prev) => [`New task added: "${response.data.title}"`, ...prev]);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleToggleStatus = async (task: Task): Promise<void> => {
    const newStatus: StatusType = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const response = await api.put<Task>(`/tasks/${task._id}`, { status: newStatus });
      setTasks(tasks.map((t) => (t._id === task._id ? response.data : t)));
      if (newStatus === 'completed') {
        setNotifications((prev) => [`Task "${task.title}" completed! ✅`, ...prev]);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteTask = async (id: string): Promise<void> => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setTasks([]);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const updatedUser = { ...currentUser, name: profileName };
    setCurrentUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    alert('Name successfully updated!');
  };

  const handleTabChange = (tab: 'dashboard' | 'today' | 'completed' | 'settings') => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  if (!currentUser) {
    return (
      <AuthModal
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setProfileName(user.name);
        }}
      />
    );
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;

  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.createdAt && t.createdAt.startsWith(todayDateStr));

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'pending'
          ? task.status === 'pending'
          : task.status === 'completed';
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderNavigationLinks = () => (
    <nav className='space-y-2'>
      <button
        onClick={() => handleTabChange('dashboard')}
        className={`flex items-center gap-3 w-full px-4 py-3 font-semibold rounded-xl transition-colors ${
          activeTab === 'dashboard'
            ? 'bg-indigo-50 text-indigo-600'
            : 'text-slate-500 hover:bg-slate-50'
        }`}
      >
        <LayoutDashboard size={20} />
        Dashboard
      </button>
      <button
        onClick={() => handleTabChange('today')}
        className={`flex items-center gap-3 w-full px-4 py-3 font-semibold rounded-xl transition-colors ${
          activeTab === 'today'
            ? 'bg-indigo-50 text-indigo-600'
            : 'text-slate-500 hover:bg-slate-50'
        }`}
      >
        <Calendar size={20} />
        Today's Tasks
      </button>
      <button
        onClick={() => handleTabChange('completed')}
        className={`flex items-center gap-3 w-full px-4 py-3 font-semibold rounded-xl transition-colors ${
          activeTab === 'completed'
            ? 'bg-indigo-50 text-indigo-600'
            : 'text-slate-500 hover:bg-slate-50'
        }`}
      >
        <CheckSquare size={20} />
        Completed
      </button>
      <button
        onClick={() => handleTabChange('settings')}
        className={`flex items-center gap-3 w-full px-4 py-3 font-semibold rounded-xl transition-colors ${
          activeTab === 'settings'
            ? 'bg-indigo-50 text-indigo-600'
            : 'text-slate-500 hover:bg-slate-50'
        }`}
      >
        <Settings size={20} />
        Settings
      </button>
    </nav>
  );
  return (
    <div className='flex min-h-screen bg-slate-100 font-sans text-slate-800 relative overflow-x-hidden'>
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className='fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity'
        />
      )}
      <aside className='w-64 bg-white border-r border-slate-200 p-6 flex-col justify-between hidden md:flex shrink-0'>
        <div>
          <div className='flex items-center gap-3 mb-10'>
            <div className='bg-indigo-600 p-2 rounded-xl text-white'>
              <CheckSquare size={24} />
            </div>
            <span className='text-xl font-bold text-slate-900'>TaskFlow</span>
          </div>
          {renderNavigationLinks()}
        </div>
        <button
          onClick={handleLogout}
          className='flex items-center gap-3 text-slate-400 hover:text-red-500 font-medium px-4 py-2 transition-colors'
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </aside>
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-white border-r border-slate-200 p-6 z-50 flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className='flex items-center justify-between mb-8'>
            <div className='flex items-center gap-3'>
              <div className='bg-indigo-600 p-2 rounded-xl text-white'>
                <CheckSquare size={24} />
              </div>
              <span className='text-xl font-bold text-slate-900'>TaskFlow</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className='p-2 text-slate-400 hover:text-slate-600 rounded-lg'
            >
              <X size={24} />
            </button>
          </div>
          {renderNavigationLinks()}
        </div>
        <button
          onClick={handleLogout}
          className='flex items-center gap-3 text-slate-400 hover:text-red-500 font-medium px-4 py-2 transition-colors mt-auto'
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </aside>
      <main className='flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto w-full max-w-full'>
        <header className='flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-8'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className='p-2 bg-white rounded-xl border border-slate-200 text-slate-600 md:hidden hover:bg-slate-50 transition-colors'
              aria-label='Open menu'
            >
              <Menu size={22} />
            </button>
            <div className='relative w-full sm:w-72'>
              <Search className='absolute left-3 top-3 text-slate-400' size={18} />
              <input
                type='text'
                placeholder='Search tasks...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm'
              />
            </div>
          </div>
          <div className='relative'>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className='p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 relative transition-colors'
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className='absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold'>
                  {notifications.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className='fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 mt-2 sm:w-80 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-4'>
                <div className='flex items-center justify-between mb-3 border-b pb-2'>
                  <h3 className='font-bold text-slate-800 text-sm'>Notifications</h3>
                  <button
                    onClick={() => setNotifications([])}
                    className='text-xs text-indigo-600 hover:underline'
                  >
                    Clear
                  </button>
                </div>

                {notifications.length === 0 ? (
                  <p className='text-xs text-slate-400 text-center py-4'>No new notifications</p>
                ) : (
                  <div className='space-y-2 max-h-60 overflow-y-auto'>
                    {notifications.map((note, index) => (
                      <div
                        key={index}
                        className='text-xs p-2.5 bg-slate-50 rounded-xl text-slate-600 border border-slate-100'
                      >
                        {note}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>
        {activeTab === 'dashboard' && (
          <>
            <div className='mb-8'>
              <h1 className='text-2xl sm:text-3xl font-bold text-slate-900'>
                Good Day, {currentUser.name}! 👋
              </h1>
              <p className='text-slate-500 mt-1 text-sm sm:text-base'>
                Here's what's happening with your tasks today.
              </p>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8'>
              <div className='bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between'>
                <div>
                  <p className='text-xs sm:text-sm font-medium text-slate-400'>Total Tasks</p>
                  <p className='text-2xl sm:text-3xl font-bold text-slate-900 mt-1'>{totalTasks}</p>
                </div>
                <div className='p-3 bg-indigo-50 text-indigo-600 rounded-xl'>
                  <LayoutDashboard size={24} />
                </div>
              </div>
              <div className='bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between'>
                <div>
                  <p className='text-xs sm:text-sm font-medium text-slate-400'>Completed</p>
                  <p className='text-2xl sm:text-3xl font-bold text-slate-900 mt-1'>
                    {completedTasks}
                  </p>
                </div>
                <div className='p-3 bg-emerald-50 text-emerald-600 rounded-xl'>
                  <CheckCircle2 size={24} />
                </div>
              </div>
              <div className='bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between sm:col-span-2 md:col-span-1'>
                <div>
                  <p className='text-xs sm:text-sm font-medium text-slate-400'>Pending</p>
                  <p className='text-2xl sm:text-3xl font-bold text-slate-900 mt-1'>
                    {pendingTasks}
                  </p>
                </div>
                <div className='p-3 bg-amber-50 text-amber-600 rounded-xl'>
                  <Circle size={24} />
                </div>
              </div>
            </div>
            <form onSubmit={handleCreateTask} className='mb-6 flex flex-col sm:flex-row gap-3'>
              <input
                type='text'
                placeholder='+ Add a new task...'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className='flex-1 px-4 sm:px-5 py-3 sm:py-3.5 bg-white rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm sm:text-base'
              />
              <button
                type='submit'
                className='px-6 py-3 sm:py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-2xl transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2'
              >
                <Plus size={20} />
                <span>Add Task</span>
              </button>
            </form>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4'>
              <h2 className='text-lg sm:text-xl font-bold text-slate-900'>
                My Tasks{' '}
                {searchQuery && (
                  <span className='text-sm font-normal text-slate-400'>
                    (search: "{searchQuery}")
                  </span>
                )}
              </h2>
              <div className='flex bg-slate-200/60 p-1 rounded-xl gap-1 text-xs sm:text-sm font-medium w-full sm:w-auto overflow-x-auto'>
                <button
                  onClick={() => setFilter('all')}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-lg transition-all ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-lg transition-all ${filter === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-lg transition-all ${filter === 'completed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  Completed
                </button>
              </div>
            </div>
            {loading ? (
              <p className='text-center text-slate-400 py-10'>Loading tasks...</p>
            ) : filteredTasks.length === 0 ? (
              <div className='text-center py-12 bg-white rounded-2xl border border-slate-200'>
                <p className='text-slate-400 text-sm sm:text-base'>
                  {searchQuery ? 'Задач по вашему запросу не найдено' : 'Нет задач'}
                </p>
              </div>
            ) : (
              <div className='space-y-3'>
                {filteredTasks.map((task) => (
                  <div
                    key={task._id}
                    className='flex items-center justify-between p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all gap-3'
                  >
                    <div className='flex items-center gap-3 min-w-0'>
                      <button
                        onClick={() => handleToggleStatus(task)}
                        className='text-slate-400 hover:text-indigo-600 transition-colors shrink-0'
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 size={22} className='text-emerald-500' />
                        ) : (
                          <Circle size={22} />
                        )}
                      </button>
                      <span
                        className={`font-medium text-sm sm:text-base truncate ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-700'}`}
                      >
                        {task.title}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className='text-slate-300 hover:text-red-500 transition-colors p-1 shrink-0'
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {activeTab === 'today' && (
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold text-slate-900 mb-2'>Today's Tasks 📅</h1>
            <p className='text-slate-500 mb-6 text-sm sm:text-base'>
              Tasks created today ({new Date().toLocaleDateString()})
            </p>
            {todayTasks.length === 0 ? (
              <div className='text-center py-12 bg-white rounded-2xl border border-slate-200'>
                <p className='text-slate-400 text-sm sm:text-base'>
                  No tasks have been added yet today.
                </p>
              </div>
            ) : (
              <div className='space-y-3'>
                {todayTasks.map((task) => (
                  <div
                    key={task._id}
                    className='flex items-center justify-between p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-sm gap-3'
                  >
                    <div className='flex items-center gap-3 min-w-0'>
                      <button onClick={() => handleToggleStatus(task)} className='shrink-0'>
                        {task.status === 'completed' ? (
                          <CheckCircle2 size={22} className='text-emerald-500' />
                        ) : (
                          <Circle size={22} />
                        )}
                      </button>
                      <span
                        className={`text-sm sm:text-base truncate ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-700'}`}
                      >
                        {task.title}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className='text-slate-300 hover:text-red-500 shrink-0'
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'completed' && (
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold text-slate-900 mb-2'>
              Completed Tasks ✅
            </h1>
            <p className='text-slate-500 mb-6 text-sm sm:text-base'>Archive of completed tasks</p>
            {tasks.filter((t) => t.status === 'completed').length === 0 ? (
              <div className='text-center py-12 bg-white rounded-2xl border border-slate-200'>
                <p className='text-slate-400 text-sm sm:text-base'>You have no completed tasks.</p>
              </div>
            ) : (
              <div className='space-y-3'>
                {tasks
                  .filter((t) => t.status === 'completed')
                  .map((task) => (
                    <div
                      key={task._id}
                      className='flex items-center justify-between p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-sm gap-3'
                    >
                      <div className='flex items-center gap-3 min-w-0'>
                        <CheckCircle2 size={22} className='text-emerald-500 shrink-0' />
                        <span className='line-through text-slate-400 text-sm sm:text-base truncate'>
                          {task.title}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className='text-slate-300 hover:text-red-500 shrink-0'
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'settings' && (
          <div className='max-w-2xl'>
            <h1 className='text-2xl sm:text-3xl font-bold text-slate-900 mb-2'>
              Account Settings ⚙️
            </h1>
            <p className='text-slate-500 mb-6 sm:mb-8 text-sm sm:text-base'>
              Managing your profile and security
            </p>
            <div className='bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm mb-6'>
              <h2 className='text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2'>
                <UserIcon size={20} className='text-indigo-600' />
                Personal data
              </h2>
              <form onSubmit={handleUpdateProfile} className='space-y-4'>
                <div>
                  <label className='block text-xs font-semibold text-slate-500 mb-1'>
                    Username
                  </label>
                  <input
                    type='text'
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className='w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm'
                  />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-slate-500 mb-1'>Email</label>
                  <input
                    type='email'
                    disabled
                    value={currentUser.email}
                    className='w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 cursor-not-allowed text-sm'
                  />
                </div>
                <button
                  type='submit'
                  className='w-full sm:w-auto px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors text-sm'
                >
                  Save changes
                </button>
              </form>
            </div>
            <div className='bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm'>
              <h2 className='text-base sm:text-lg font-bold text-slate-900 mb-2 flex items-center gap-2'>
                <ShieldCheck size={20} className='text-emerald-600' />
                Safety
              </h2>
              <p className='text-xs sm:text-sm text-slate-500 leading-relaxed'>
                Your account is protected using JWT tokens. The password is encrypted in the MongoDB
                database using the bcrypt algorithm.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
