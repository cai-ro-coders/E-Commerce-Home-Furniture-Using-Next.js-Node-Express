/**
 * CSV generation for the "export to CSV / download all orders" features.
 * Values are escaped per RFC 4180 and formula-injection is neutralised so a
 * product name like `=cmd|...` cannot execute when the file is opened in Excel.
 */
const FORMULA_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  let text = String(value);

  // Neutralise spreadsheet formula injection.
  if (FORMULA_PREFIXES.some((prefix) => text.startsWith(prefix))) {
    text = `'${text}`;
  }

  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export type CsvColumn<T> = {
  key: keyof T & string;
  header: string;
  map?: (row: T) => unknown;
};

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((column) => escapeCell(column.header)).join(',');
  const lines = rows.map((row) => {
    const record = row as Record<string, unknown>;
    return columns
      .map((column) => escapeCell(column.map ? column.map(row) : record[column.key]))
      .join(',');
  });
  return [header, ...lines].join('\r\n');
}
