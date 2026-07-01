export type Priority = 'high' | 'mid' | 'low';

export interface Subtask {
  id:    string;
  title: string;
  done:  boolean;
}

export interface Task {
  id:        string;
  title:     string;
  date:      string;      // ISO string
  dateLabel: string;      // 'завтра', 'пятница', '25.12.2025'
  time:      string | null;
  priority:  Priority;
  category:  string;
  done:      boolean;
  created:   number;      // Date.now()
  subtasks:  Subtask[];
}

//Dictionaries

const TRIGGERS = [
  'нужно','надо','сделать','доделать','завершить','выполнить',
  'купить','заказать','оплатить','позвонить','написать','отправить',
  'встретиться','принести','забрать','починить','настроить','собрать',
  'убрать','помыть','вынести','сварить','приготовить','испечь',
  'пожарить','запланировать',
];

const CONFIRM_VERBS = [
  'сварить','пожарить','испечь','приготовить','купить','заказать',
  'оплатить','починить','собрать','убрать','помыть','вынести',
  'позвонить','написать',
];

const PRIORITY_HIGH = ['срочно','важно','кровь из носу','немедленно','обязательно'];
const PRIORITY_LOW  = ['было бы неплохо','может быть','необязательно','если успею'];

const DAYS_RU: Record<string, number> = {
  'понедельник':1,'вторник':2,'среда':3,'четверг':4,'пятница':5,'суббота':6,'воскресенье':0,
  'пн':1,'вт':2,'ср':3,'чт':4,'пт':5,'сб':6,'вс':0,
  'понедельника':1,'вторника':2,'среды':3,'четверга':4,'пятницы':5,'субботы':6,'воскресенья':0,
};

const MONTHS: Record<string, number> = {
  'января':1,'февраля':2,'марта':3,'апреля':4,'мая':5,'июня':6,
  'июля':7,'августа':8,'сентября':9,'октября':10,'ноября':11,'декабря':12,
};

const CATEGORIES: { key: string; label: string; words: string[] }[] = [
  { key:'work',   label:'💼 Работа',   words:['отчёт','проект','клиент','созвон','встреча','дедлайн','презентация','задача','рабочий','совещание'] },
  { key:'food',   label:'🍲 Готовка',  words:['сварить','пожарить','испечь','приготовить','пельмени','суп','ужин','завтрак','обед','готовить','блюдо'] },
  { key:'shop',   label:'🛒 Покупки',  words:['купить','заказать','оплатить','хлеб','молоко','продукты','магазин','аптека'] },
  { key:'home',   label:'🏠 Домашнее', words:['убрать','помыть','вынести','починить','прибраться','постирать','убраться','ремонт'] },
  { key:'health', label:'💊 Здоровье', words:['врач','лекарство','спорт','тренировка','записаться','доктор','больница','сон'] },
  { key:'social', label:'👤 Личное',   words:['маме','папе','другу','подруге','день рождения','родители','семья','позвонить','встретиться'] },
];

//Helpers

export function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function todayMidnight(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

//Core parsing functions

export function splitSentences(text: string): string[] {
  return text
    .split(/[.!?;\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 2);
}

export function hasTrigger(sentence: string): boolean {
  const lower = sentence.toLowerCase();
  return TRIGGERS.some(t => lower.includes(t));
}

export function hasConfirmVerb(sentence: string): boolean {
  const lower = sentence.toLowerCase();
  // Only fires if NOT already caught by a trigger
  if (hasTrigger(sentence)) return false;
  return CONFIRM_VERBS.some(t => lower.includes(t));
}

export function parseDate(sentence: string): { date: Date; label: string } {
  const lower = sentence.toLowerCase();
  const today = todayMidnight();

  //dd.mm.yyyy or dd/mm/yyyy
  let m = lower.match(/(\d{1,2})[./](\d{1,2})[./](\d{2,4})/);
  if (m) {
    const year = +m[3] < 100 ? 2000 + +m[3] : +m[3];
    const d = new Date(year, +m[2] - 1, +m[1]);
    return { date: d, label: formatDate(d) };
  }

  //dd monthname
  m = lower.match(/(\d{1,2})\s+(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)/);
  if (m) {
    const d = new Date(today.getFullYear(), MONTHS[m[2]] - 1, +m[1]);
    return { date: d, label: formatDate(d) };
  }

  if (lower.includes('послезавтра')) {
    const d = new Date(today);
    d.setDate(d.getDate() + 2);
    return { date: d, label: 'послезавтра' };
  }

  if (lower.includes('завтра')) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return { date: d, label: 'завтра' };
  }

  if (lower.includes('сегодня')) {
    return { date: today, label: 'сегодня' };
  }

  //Day of week — find first match
  for (const [name, dow] of Object.entries(DAYS_RU)) {
    if (lower.includes(name)) {
      const d = new Date(today);
      let diff = (dow - d.getDay() + 7) % 7;
      if (diff === 0) diff = 7; // never "today", always next occurrence
      d.setDate(d.getDate() + diff);
      return { date: d, label: name };
    }
  }

  return { date: today, label: 'сегодня' };
}

export function parseTime(sentence: string): string | null {
  const m = sentence.match(/(\d{1,2})[:\.](\d{2})/);
  if (m) return `${m[1]}:${m[2]}`;
  if (/вечер/i.test(sentence))      return 'вечером';
  if (/утр/i.test(sentence))        return 'утром';
  if (/ночь|ночью/i.test(sentence)) return 'ночью';
  if (/обед/i.test(sentence))       return 'в обед';
  return null;
}

export function parsePriority(sentence: string): Priority {
  const lower = sentence.toLowerCase();
  if (PRIORITY_HIGH.some(w => lower.includes(w))) return 'high';
  if (PRIORITY_LOW.some(w => lower.includes(w)))  return 'low';
  return 'mid';
}

export function parseCategory(sentence: string): string {
  const lower = sentence.toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat.words.some(w => lower.includes(w))) return cat.label;
  }
  return '❓ Другое';
}

export function cleanTitle(sentence: string): string {
  return sentence
    .replace(/\b(завтра|сегодня|послезавтра|срочно|важно|немедленно|обязательно|нужно|надо)\b/gi, '')
    .replace(/\d{1,2}[:.]\d{2}/g, '')           // remove time like 15:00
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s,;–—]+|[\s,;–—]+$/g, '')
    .trim();
}

//Subtask builder

function makeSubtaskId(): string {
  return `sub-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function buildSubtask(title: string): Subtask {
  return { id: makeSubtaskId(), title: title.trim(), done: false };
}

// Auto-parse subtasks from a sentence like:
// "купить молоко, хлеб и яйца" → ["молоко", "хлеб", "яйца"]
// "позвонить маме и написать другу" → [] (multiple verbs = separate tasks, not subtasks)
export function parseSubtasks(sentence: string): Subtask[] {
  const lower = sentence.toLowerCase();

  // Find the trigger/verb in the sentence
  const triggerMatch = TRIGGERS.find(t => lower.includes(t));
  if (!triggerMatch) return [];

  // Get the part after the trigger verb
  const afterTrigger = lower.slice(lower.indexOf(triggerMatch) + triggerMatch.length).trim();
  if (!afterTrigger) return [];

  // Split by list separators: comma, "и", "а также", "плюс"
  const parts = afterTrigger
    .split(/,\s*|\s+и\s+|\s+а также\s+|\s+плюс\s+/)
    .map(p => p.trim())
    .filter(p => p.length > 1);

  // Only create subtasks if there are 2+ distinct items
  // and none of them contain another trigger verb (those would be separate tasks)
  if (parts.length < 2) return [];
  const hasNestedTrigger = parts.some(p => TRIGGERS.some(t => p.includes(t)));
  if (hasNestedTrigger) return [];

  return parts.map(p => buildSubtask(p));
}

//Task builder

export function buildTask(sentence: string): Task {
  const { date, label: dateLabel } = parseDate(sentence);
  const time     = parseTime(sentence);
  const priority = parsePriority(sentence);
  const category = parseCategory(sentence);
  const rawTitle = cleanTitle(sentence);
  const title    = rawTitle.length > 0 ? rawTitle : sentence.trim();
  const subtasks = parseSubtasks(sentence);

  return {
    id:        `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title,
    date:      date.toISOString(),
    dateLabel,
    time,
    priority,
    category,
    done:      false,
    created:   Date.now(),
    subtasks,
  };
}

//Main entry point

export interface ParseResult {
  tasks:   Task[];     // ready to add immediately
  pending: string[];   // sentences that need user confirmation
}

export function parseText(text: string): ParseResult {
  const sentences = splitSentences(text);
  const tasks:   Task[]   = [];
  const pending: string[] = [];

  for (const s of sentences) {
    if (hasTrigger(s)) {
      tasks.push(buildTask(s));
    } else if (hasConfirmVerb(s)) {
      pending.push(s);
    }
    // else: no actionable verb → ignore
  }

  return { tasks, pending };
}