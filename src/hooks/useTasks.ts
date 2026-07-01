import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, buildTask, parseText } from '../utils/parser';

export type FilterType = 'all' | 'active' | 'done';
export type SortType   = 'created' | 'date' | 'priority';

const STORAGE_KEY = 'tasks_v2';

function priorityWeight(p: Task['priority']): number {
  return p === 'high' ? 0 : p === 'mid' ? 1 : 2;
}

function sortTasks(arr: Task[], sortBy: SortType): Task[] {
  const copy = [...arr];
  if (sortBy === 'date') {
    copy.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } else if (sortBy === 'priority') {
    copy.sort((a, b) => priorityWeight(a.priority) - priorityWeight(b.priority));
  } else {
    copy.sort((a, b) => a.created - b.created);
  }
  return copy;
}

export function useTasks() {
  const [tasks,   setTasks]   = useState<Task[]>([]);
  const [pending, setPending] = useState<string[]>([]);   // sentences awaiting confirmation
  const [filter,  setFilter]  = useState<FilterType>('all');
  const [sortBy,  setSortBy]  = useState<SortType>('created');
  const [loading, setLoading] = useState(true);

  //Persistence

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (raw) setTasks(JSON.parse(raw));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback((next: Task[]) => {
    setTasks(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  //Parse input text

  const parse = useCallback((text: string) => {
    const result = parseText(text);
    persist([...tasks, ...result.tasks]);
    setPending(result.pending);
  }, [tasks, persist]);

  //Confirm / reject pending

  const confirmPending = useCallback((index: number) => {
    const sentence = pending[index];
    if (!sentence) return;
    persist([...tasks, buildTask(sentence)]);
    setPending(prev => prev.filter((_, i) => i !== index));
  }, [pending, tasks, persist]);

  const rejectPending = useCallback((index: number) => {
    setPending(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearPending = useCallback(() => setPending([]), []);

  //Task actions

  const toggleDone = useCallback((id: string) => {
    persist(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }, [tasks, persist]);

  const deleteTask = useCallback((id: string) => {
    persist(tasks.filter(t => t.id !== id));
  }, [tasks, persist]);

  const updateTask = useCallback((id: string, changes: Partial<Task>) => {
    persist(tasks.map(t => t.id === id ? { ...t, ...changes } : t));
  }, [tasks, persist]);

  //Subtask actions

  const addSubtask = useCallback((taskId: string, title: string) => {
    if (!title.trim()) return;
    const newSub: import('../utils/parser').Subtask = {
      id:    `sub-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: title.trim(),
      done:  false,
    };
    persist(tasks.map(t =>
      t.id === taskId
        ? { ...t, subtasks: [...(t.subtasks ?? []), newSub] }
        : t
    ));
  }, [tasks, persist]);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    persist(tasks.map(t =>
      t.id === taskId
        ? { ...t, subtasks: (t.subtasks ?? []).map(s =>
            s.id === subtaskId ? { ...s, done: !s.done } : s
          )}
        : t
    ));
  }, [tasks, persist]);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    persist(tasks.map(t =>
      t.id === taskId
        ? { ...t, subtasks: (t.subtasks ?? []).filter(s => s.id !== subtaskId) }
        : t
    ));
  }, [tasks, persist]);

  const clearAll = useCallback(() => {
    persist([]);
    setPending([]);
  }, [persist]);

  //Derived lists

  const activeTasks = sortTasks(tasks.filter(t => !t.done), sortBy);
  const doneTasks   = sortTasks(tasks.filter(t =>  t.done), sortBy);

  const visibleActive = filter === 'done'   ? [] : activeTasks;
  const visibleDone   = filter === 'active' ? [] : doneTasks;

  return {
    // state
    loading,
    pending,
    filter,
    sortBy,
    // counts
    totalCount:  tasks.length,
    activeCount: activeTasks.length,
    doneCount:   doneTasks.length,
    // derived
    visibleActive,
    visibleDone,
    // actions
    parse,
    confirmPending,
    rejectPending,
    clearPending,
    toggleDone,
    deleteTask,
    updateTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    clearAll,
    setFilter,
    setSortBy,
  };
}