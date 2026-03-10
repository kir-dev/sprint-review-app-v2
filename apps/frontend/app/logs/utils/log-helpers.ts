import { Log, LogFilters, WorkPeriod } from '../types';

export function findWorkPeriodForDate(
  dateString: string | Date,
  workPeriods: WorkPeriod[],
) {
  if (!dateString) return null;
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);

  return (
    workPeriods.find((period) => {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return target >= start && target <= end;
    }) || null
  );
}

export function filterLogs(logs: Log[], filters: LogFilters): Log[] {
  return logs.filter((log) => {
    if (filters.category && log.category !== filters.category) return false;
    if (filters.projectId && log.projectId?.toString() !== filters.projectId)
      return false;
    if (
      filters.workPeriodId &&
      log.workPeriodId.toString() !== filters.workPeriodId
    )
      return false;

    if (filters.startDate || filters.endDate) {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);

      if (filters.startDate) {
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        if (logDate < start) return false;
      }

      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        if (logDate > end) return false;
      }
    }

    return true;
  });
}

export function exportLogsToCsv(logs: Log[], filters?: LogFilters) {
  if (!logs || logs.length === 0) return;

  const headers = [
    'Dátum',
    'Kategória',
    'Projekt',
    'Időszak',
    'Ráfordított idő (óra)',
    'Nehézség',
    'Leírás',
  ];

  const csvRows = logs.map((log) => {
    const date = new Date(log.date).toLocaleDateString('hu-HU');
    const categoryName = log.category;
    const projectName = log.project?.name || '';
    const workPeriodName = log.workPeriod?.name || '';
    const timeSpent = log.timeSpent?.toString() || '';
    const difficulty = log.difficulty || '';
    const desc = `"${(log.description || '').replace(/"/g, '""')}"`;

    return [
      date,
      categoryName,
      projectName,
      workPeriodName,
      timeSpent,
      difficulty,
      desc,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...csvRows].join('\n');
  const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
    type: 'text/csv;charset=utf-8;',
  }); // adding BOM for Excel
  const url = URL.createObjectURL(blob);

  let dateStr = new Date().toISOString().split('T')[0];
  if (filters?.startDate && filters?.endDate) {
    dateStr = `${filters.startDate}_${filters.endDate}`;
  } else if (filters?.startDate) {
    dateStr = `${filters.startDate}_tol`;
  } else if (filters?.endDate) {
    dateStr = `${filters.endDate}_ig`;
  }

  const linkTag = document.createElement('a');
  linkTag.href = url;
  linkTag.setAttribute('download', `munkanaplok_${dateStr}.csv`);
  document.body.appendChild(linkTag);
  linkTag.click();
  document.body.removeChild(linkTag);
}

export function calculateStats(logs: Log[]) {
  const totalHours = logs.reduce((sum, log) => sum + (log.timeSpent || 0), 0);

  // Csak azokat a logokat számoljuk, amelyeknek van timeSpent értéke
  const logsWithTimeSpent = logs.filter(
    (log) =>
      log.timeSpent !== null &&
      log.timeSpent !== undefined &&
      log.timeSpent > 0,
  );
  const avgHours =
    logsWithTimeSpent.length > 0
      ? parseFloat((totalHours / logsWithTimeSpent.length).toFixed(1))
      : 0;

  return {
    totalLogs: logs.length,
    totalHours,
    avgHours,
  };
}
