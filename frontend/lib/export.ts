/**
 * Client-side table export.
 *
 * The spec asks for CSV, Excel, PDF and Print on every table. Rather than
 * pulling in jsPDF + jszip + pdfmake (and DataTables Buttons to glue them
 * together), all four formats are generated from the same declarative column
 * list the table already renders. That keeps one source of truth for what a
 * column is called and how a cell is formatted, and works identically for
 * server-side and client-side data.
 */

export interface ExportColumn<T> {
  /** Field name on the row. */
  key: string;
  /** Human-readable heading. */
  header: string;
  /** Pull the display value for export. Defaults to `row[key]`. */
  value?: (row: T) => string | number | null | undefined;
}

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'print' | 'json';

function cellValue<T>(row: T, column: ExportColumn<T>): string {
  const raw = column.value
    ? column.value(row)
    : (row as Record<string, unknown>)[column.key];
  if (raw === null || raw === undefined) return '';
  if (typeof raw === 'boolean') return raw ? 'Yes' : 'No';
  return String(raw);
}

function table<T>(rows: T[], columns: ExportColumn<T>[]): string[][] {
  return [
    columns.map((column) => column.header),
    ...rows.map((row) => columns.map((column) => cellValue(row, column))),
  ];
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Give the browser a tick to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function stamp(): string {
  return new Date().toISOString().slice(0, 10);
}

/* -------------------------------------------------------------------- CSV */

export function toCsv<T>(rows: T[], columns: ExportColumn<T>[]): string {
  const escape = (value: string): string => {
    // A leading =, +, - or @ makes Excel treat the cell as a formula.
    const guarded = /^[=+\-@]/.test(value) ? `'${value}` : value;
    return /[",\n\r]/.test(guarded) ? `"${guarded.replace(/"/g, '""')}"` : guarded;
  };
  return table(rows, columns)
    .map((line) => line.map(escape).join(','))
    .join('\r\n');
}

/* ------------------------------------------------------------------ Excel */

/**
 * SpreadsheetML-flavoured HTML table with an `.xls` extension. Excel opens it
 * natively and preserves cell types, which a CSV cannot do without asking the
 * user about delimiters on every open.
 */
function toExcelHtml<T>(rows: T[], columns: ExportColumn<T>[], title: string): string {
  const grid = table(rows, columns);
  const [head, ...body] = grid;
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta charset="utf-8" />
    <!--[if gte mso 9]><xml>
      <x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
        <x:Name>${escapeHtml(title).slice(0, 31)}</x:Name>
        <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
      </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook>
    </xml><![endif]-->
    <style>
      table { border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
      th { background: #c2542b; color: #fff; font-weight: bold; }
      th, td { border: 1px solid #d3ccbd; padding: 6px 10px; vertical-align: top; }
      tr:nth-child(even) td { background: #faf9f7; }
    </style>
  </head>
  <body>
    <h3>${escapeHtml(title)}</h3>
    <table>
      <thead><tr>${head.map((cell) => `<th>${escapeHtml(cell)}</th>`).join('')}</tr></thead>
      <tbody>
        ${body
          .map(
            (line) =>
              `<tr>${line
                .map((cell) => {
                  // Bare numbers should stay numbers so Excel can sum them.
                  const numeric = /^-?\d+(\.\d+)?$/.test(cell.replace(/,/g, ''));
                  return numeric
                    ? `<td>${escapeHtml(cell.replace(/,/g, ''))}</td>`
                    : `<td>${escapeHtml(cell)}</td>`;
                })
                .join('')}</tr>`
          )
          .join('')}
      </tbody>
    </table>
  </body>
</html>`;
}

/* -------------------------------------------------------------------- PDF */

/**
 * Print-to-PDF: open a styled document in a hidden iframe and invoke the
 * browser's print dialog, where "Save as PDF" is a first-class destination.
 * This avoids shipping a 1 MB font-embedding PDF library for what is, in
 * practice, the same output.
 */
function printHtml(html: string): void {
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(frame);

  const cleanup = () => {
    setTimeout(() => frame.remove(), 500);
  };

  frame.onload = () => {
    const win = frame.contentWindow;
    if (!win) {
      cleanup();
      return;
    }
    win.focus();
    win.print();
    cleanup();
  };

  const doc = frame.contentDocument;
  if (!doc) {
    cleanup();
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();
}

function printDocument<T>(rows: T[], columns: ExportColumn<T>[], title: string, subtitle: string): string {
  const grid = table(rows, columns);
  const [head, ...body] = grid;
  return `<!doctype html>
<html><head><meta charset="utf-8" /><title>${escapeHtml(title)}</title>
<style>
  @page { size: A4 landscape; margin: 14mm; }
  * { box-sizing: border-box; }
  body { font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
         color: #211d19; margin: 0; }
  header { display: flex; align-items: flex-end; justify-content: space-between;
           border-bottom: 2px solid #c2542b; padding-bottom: 10px; margin-bottom: 16px; }
  h1 { font-size: 17px; margin: 0; }
  .sub { font-size: 11px; color: #7d6f5c; margin-top: 4px; }
  .brand { font-size: 13px; font-weight: 700; color: #c2542b; letter-spacing: .04em; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; }
  th { background: #f3f1ec; text-align: left; text-transform: uppercase;
       letter-spacing: .05em; font-size: 9px; color: #665a4b;
       padding: 7px 8px; border-bottom: 1px solid #d3ccbd; }
  td { padding: 7px 8px; border-bottom: 1px solid #e6e2d9; vertical-align: top; }
  tr:nth-child(even) td { background: #faf9f7; }
  footer { margin-top: 14px; font-size: 9px; color: #968873; }
</style></head>
<body>
  <header>
    <div>
      <h1>${escapeHtml(title)}</h1>
      <div class="sub">${escapeHtml(subtitle)} · ${rows.length} record${rows.length === 1 ? '' : 's'}</div>
    </div>
    <div class="brand">LUMERA HOME</div>
  </header>
  <table>
    <thead><tr>${head.map((cell) => `<th>${escapeHtml(cell)}</th>`).join('')}</tr></thead>
    <tbody>${body
      .map((line) => `<tr>${line.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
      .join('')}</tbody>
  </table>
  <footer>Generated ${new Date().toLocaleString('en-PH')}</footer>
</body></html>`;
}

/* ------------------------------------------------------------------- entry */

export interface ExportOptions {
  filename: string;
  title: string;
  subtitle?: string;
}

/**
 * Export or print `rows`.
 *
 * `pdf` and `print` both go through the browser's print pipeline — "pdf" just
 * names the intent so the caller does not have to know that.
 */
export function exportRows<T>(
  rows: T[],
  columns: ExportColumn<T>[],
  format: ExportFormat,
  options: ExportOptions
): void {
  const { filename, title, subtitle = `${rows.length} records` } = options;
  const safeName = filename.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();

  switch (format) {
    case 'csv':
      triggerDownload(
        new Blob([`\uFEFF${toCsv(rows, columns)}`], { type: 'text/csv;charset=utf-8;' }),
        `${safeName}-${stamp()}.csv`
      );
      break;

    case 'excel':
      triggerDownload(
        new Blob([toExcelHtml(rows, columns, title)], {
          type: 'application/vnd.ms-excel;charset=utf-8;',
        }),
        `${safeName}-${stamp()}.xls`
      );
      break;

    case 'json':
      triggerDownload(
        new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' }),
        `${safeName}-${stamp()}.json`
      );
      break;

    case 'pdf':
    case 'print':
      printHtml(printDocument(rows, columns, title, subtitle));
      break;
  }
}

/** Save a blob fetched from an API export endpoint. */
export function saveBlob(blob: Blob, filename: string): void {
  triggerDownload(blob, filename);
}

/** Print an element on the current page (receipts, order details). */
export function printElement(element: HTMLElement | null): void {
  if (!element) return;
  printHtml(`<!doctype html><html><head><meta charset="utf-8" />
    <style>
      @page { size: A4; margin: 14mm; }
      body { font-family: ui-sans-serif, system-ui, sans-serif; color: #211d19; margin: 0; }
      img { max-width: 100%; }
      table { width: 100%; border-collapse: collapse; font-size: 11px; }
      th, td { padding: 6px 8px; border-bottom: 1px solid #e6e2d9; text-align: left; }
      .print-hidden, button, .no-print { display: none !important; }
    </style></head><body>${element.outerHTML}</body></html>`);
}
