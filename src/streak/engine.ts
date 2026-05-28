interface ActivityRow {
  date: string;
  lessons_completed: number;
}

export function computeStreak(rows: ActivityRow[]): number {
  if (rows.length === 0) return 0;

  const dates = new Set(rows.map((r) => r.date));
  const today = new Date().toISOString().split("T")[0];

  if (!dates.has(today)) return 0;

  let streak = 0;
  const current = new Date();

  while (true) {
    const d = current.toISOString().split("T")[0];
    if (dates.has(d)) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function computeMaxStreak(
  rows: ActivityRow[],
  historicalMax: number,
): number {
  const currentStreak = computeStreak(rows);
  return Math.max(historicalMax, currentStreak);
}

function getWeekMonday(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = (day + 6) % 7;
  now.setDate(now.getDate() - diff);
  return now.toISOString().split("T")[0];
}

function getLastWeekMonday(): string {
  const monday = new Date(getWeekMonday());
  monday.setDate(monday.getDate() - 7);
  return monday.toISOString().split("T")[0];
}

export function computeFreezesEarned(rows: ActivityRow[]): number {
  const lastMonday = getLastWeekMonday();
  const thisMonday = getWeekMonday();

  const lastWeekLessons = rows
    .filter((r) => r.date >= lastMonday && r.date < thisMonday)
    .reduce((sum, r) => sum + r.lessons_completed, 0);

  return lastWeekLessons >= 4 ? 1 : 0;
}

export function computeFreezesToConsume(
  availableFreezes: number,
  hasActivityToday: boolean,
): number {
  if (hasActivityToday) return 0;
  return availableFreezes > 0 ? 1 : 0;
}

export function computeWeeklyProgress(rows: ActivityRow[]): number {
  const thisMonday = getWeekMonday();
  return rows
    .filter((r) => r.date >= thisMonday)
    .reduce((sum, r) => sum + r.lessons_completed, 0);
}
