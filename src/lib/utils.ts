import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDriversWord(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'водителей';
  }

  if (lastDigit === 1) {
    return 'водитель';
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'водителя';
  }

  return 'водителей';
}

export function downloadAsCSV(data: any[], filename: string, orderedColumns: string[]) {
  // Convert data to CSV format
  const csvContent = [
    // Headers row
    orderedColumns.join(','),
    // Data rows
    ...data.map(row => 
      orderedColumns.map(header => {
        const value = row[header];
        // Handle special cases and formatting
        if (typeof value === 'number') {
          const currencyColumns = ['Баланс', 'Сумма выпущенных ЭПЛ', 'Остаток баланса', 'Цена ЭПЛ'];
          if (currencyColumns.includes(header)) {
            return value.toLocaleString('ru-RU');
          }
          return value.toString();
        }
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value || '');
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}