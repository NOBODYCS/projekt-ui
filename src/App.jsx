import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Search, Moon, Sun, Check, AlertTriangle, Calendar, Tag, X } from 'lucide-react';

export default function App() {
  // State
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [sortBy, setSortBy] = useState('date'); // date, priority, alphabetical
  
  // Modals & Toast State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Praca',
    priority: 'Średni',
    deadline: ''
  });
  const [formError, setFormError] = useState('');

  // Effects
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handlers
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        category: task.category,
        priority: task.priority,
        deadline: task.deadline
      });
    } else {
      setEditingTask(null);
      setFormData({ title: '', category: 'Praca', priority: 'Średni', deadline: '' });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveTask = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Nazwa zadania jest wymagana.');
      return;
    }

    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...formData } : t));
      showToast('Zadanie zaktualizowane.');
    } else {
      setTasks([...tasks, { ...formData, id: Date.now().toString(), completed: false }]);
      showToast('Dodano nowe zadanie.');
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
  };

  const confirmDelete = () => {
    setTasks(tasks.filter(t => t.id !== taskToDelete.id));
    setTaskToDelete(null);
    showToast('Zadanie usunięte.');
  };

  const toggleComplete = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Processing tasks (Filter, Search, Sort)
  const priorityWeight = { 'Wysoki': 3, 'Średni': 2, 'Niski': 1 };
  
  const processedTasks = tasks
    .filter(t => {
      if (filter === 'active') return !t.completed;
      if (filter === 'completed') return t.completed;
      return true;
    })
    .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'priority') return priorityWeight[b.priority] - priorityWeight[a.priority];
      if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
      // Sort by date (empty dates go last)
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });

  // Priority Color helper
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Wysoki': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      case 'Średni': return 'text-orange-500 bg-orange-100 dark:bg-orange-900/30';
      case 'Niski': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Moje Zadania</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Zarządzaj swoim czasem efektywnie</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Szukaj zadań..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-10 py-2 w-full md:w-64 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  aria-label="Wyczyść wyszukiwanie"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Przełącz tryb ciemny"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Filters & Sorting */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700 w-full md:w-auto">
            {['all', 'active', 'completed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === f ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                {f === 'all' ? 'Wszystkie' : f === 'active' ? 'Aktywne' : 'Ukończone'}
              </button>
            ))}
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full md:w-auto px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="date">Sortuj: Najbliższy termin</option>
            <option value="priority">Sortuj: Priorytet</option>
            <option value="alphabetical">Sortuj: Alfabetycznie</option>
          </select>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {processedTasks.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 border-dashed">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Brak zadań</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? 'Nie znaleziono zadań pasujących do wyszukiwania.' : 'Wszystko zrobione! Kliknij "+" aby dodać nowe zadanie.'}
              </p>
            </div>
          ) : (
            processedTasks.map(task => (
              <div 
                key={task.id} 
                className={`flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border transition-all hover:shadow-md ${task.completed ? 'border-gray-200 dark:border-gray-700 opacity-60' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <button
                  onClick={() => toggleComplete(task.id)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-400 hover:border-blue-500 dark:border-gray-500'}`}
                >
                  {task.completed && <Check className="w-4 h-4" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium truncate ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                    {task.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Tag className="w-3 h-3" /> {task.category}
                    </span>
                    {task.deadline && (
                      <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" /> {task.deadline}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleOpenModal(task)}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    aria-label="Edytuj"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(task)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    aria-label="Usuń"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FAB */}
        <button
          onClick={() => handleOpenModal()}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          aria-label="Dodaj zadanie"
        >
          <Plus className="w-6 h-6" />
        </button>

      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">{editingTask ? 'Edytuj zadanie' : 'Nowe zadanie'}</h2>
            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nazwa zadania *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="np. Przygotowanie raportu"
                  autoFocus
                />
                {formError && <p className="text-red-500 text-xs mt-1">{formError}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kategoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option>Praca</option>
                    <option>Dom</option>
                    <option>Uczelnia</option>
                    <option>Inne</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priorytet</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option>Wysoki</option>
                    <option>Średni</option>
                    <option>Niski</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Termin wykonania</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  {editingTask ? 'Zapisz zmiany' : 'Dodaj zadanie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (UI Fix from Stage 4) */}
      {taskToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 mx-auto flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Usunąć zadanie?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Czy na pewno chcesz usunąć "{taskToDelete.title}"? Tego działania nie można cofnąć.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
              >
                Anuluj
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification (UI Fix from Stage 4) */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-green-400 dark:text-green-600" />
          {toastMessage}
        </div>
      )}
      
    </div>
  );
}