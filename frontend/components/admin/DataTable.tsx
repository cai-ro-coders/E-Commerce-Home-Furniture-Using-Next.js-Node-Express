'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DataTables from 'datatables.net-dt';
import type { AjaxData, Api, ColumnOptions, Config } from 'datatables.net';
import {
  FileJson,
  FileSpreadsheet,
  FileText,
  Loader2,
  Printer,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { exportRows, type ExportColumn, type ExportFormat } from '@/lib/export';
import { ACTIONS_COLUMN, actionButtons, orDash, type CellAction } from '@/lib/tableHtml';
import { cn } from '@/lib/cn';
import { toastError } from '@/lib/alerts';
import { Dropdown } from '@/components/ui/Dropdown';

/* ------------------------------------------------------------------- types */

export interface DataTableColumn<T> {
  /**
   * Row field to read. Doubles as the server-side sort key, so it must match a
   * column the list endpoint allows in `ORDER BY`. Use `ACTIONS_COLUMN` for the
   * trailing action column.
   */
  data: string;
  title: string;
  /** Allow the header to sort. Ignored for columns the API cannot order by. */
  sortable?: boolean;
  /**
   * Cell markup. DataTables renders rows itself, so this returns an **HTML
   * string** — build it with the helpers in `lib/tableHtml.ts`, which escape.
   */
  render?: (row: T, rowId: number | string) => string;
  /** Plain value for CSV/Excel/PDF. Defaults to the raw field. */
  exportValue?: (row: T) => string | number | null | undefined;
  /** Heading used in exports. Defaults to `title`. */
  exportTitle?: string;
  /** Keep this column out of exports (images, action buttons). */
  skipExport?: boolean;
  /** Applied to both `<th>` and `<td>`, e.g. `text-right`. */
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  /** Used for the DataTables instance id and DOM ids. */
  id: string;
  /** API path, e.g. `/products`. */
  endpoint: string;
  columns: DataTableColumn<T>[];
  /** Filter params merged into every request. */
  filters?: Record<string, string | number | undefined>;
  /** Field holding the row id. Defaults to `id`. */
  rowIdField?: string;
  /** Actions for the `ACTIONS_COLUMN` cell. */
  actions?: (row: T) => CellAction[];
  /** Fired by action buttons that have no `href`. */
  onAction?: (key: string, row: T) => void;
  /** Extra toolbar controls rendered next to the search box. */
  toolbar?: React.ReactNode;
  searchPlaceholder?: string;
  /** Base filename for exports. Defaults to `id`. */
  exportName?: string;
  exportTitle?: string;
  pageLength?: number;
  /** Initial sort. Defaults to the first sortable column, descending. */
  initialSort?: { column: string; dir: 'asc' | 'desc' };
  emptyMessage?: string;
  hideSearch?: boolean;
  hideExport?: boolean;
  /** Skip rows-per-page control (the footer shows them). */
  dense?: boolean;
  /**
   * Bump to force a refetch.
   *
   * Row actions that change the underlying data (a delete, a bulk update) cannot
   * reach into the DataTables instance, so the owner increments this instead.
   * Only a refetch happens — page, search and sort are left alone.
   */
  reloadToken?: number;
  onLoaded?: (rows: T[], total: number) => void;
  className?: string;
}

/** DataTables is happier with a flat string map than with `ListParams`. */
type Query = Record<string, string>;

const ROW_LENGTHS = [10, 25, 50, 100];

/* --------------------------------------------------------------- component */

/**
 * A server-side DataTables grid.
 *
 * DataTables owns the request protocol (`draw`, `start`, `length`, `order`,
 * `search`) and the paging UI; React owns the toolbar, the empty/loading states
 * and the row actions. The request is issued through `lib/api.ts` rather than
 * DataTables' own `ajax`, so the table automatically gets the httpOnly cookie,
 * the CSRF header, the 401-refresh-and-replay behaviour and CORS.
 *
 * Sorting, searching and filtering therefore all happen in MySQL — the browser
 * only ever holds one page of rows.
 */
export function DataTable<T extends object>({
  id,
  endpoint,
  columns,
  filters,
  rowIdField = 'id',
  actions,
  onAction,
  toolbar,
  searchPlaceholder = 'Search…',
  exportName,
  exportTitle,
  pageLength = 10,
  initialSort,
  emptyMessage = 'No records found',
  hideSearch = false,
  hideExport = false,
  reloadToken = 0,
  onLoaded,
  className,
}: DataTableProps<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<Api<T> | null>(null);
  const rowsRef = useRef<Map<string, T>>(new Map());
  const columnsRef = useRef(columns);
  const actionsRef = useRef(actions);
  const onActionRef = useRef(onAction);
  const onLoadedRef = useRef(onLoaded);
  const filtersRef = useRef(filters ?? {});
  const endpointRef = useRef(endpoint);
  const lastQueryRef = useRef<{ search: string; sortBy: string; sortDir: 'asc' | 'desc' }>({
    search: '',
    sortBy: 'id',
    sortDir: 'desc',
  });

  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState({ page: 1, pages: 0, total: 0, from: 0, to: 0 });
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  const rowIdOf = useCallback(
    (row: T): string => String((row as Record<string, unknown>)[rowIdField] ?? ''),
    [rowIdField]
  );

  /** DataTables -> flat query -> `/api/...`. */
  const load = useCallback(
    async (request: AjaxData, callback: (json: unknown) => void): Promise<void> => {
      const query: Query = {
        draw: String(request.draw ?? 1),
        start: String(request.start ?? 0),
        length: String(request.length ?? pageLength),
      };

      const term = request.search?.value?.trim() ?? '';
      if (term) query['search[value]'] = term;

      const order = request.order?.[0];
      request.order?.forEach((entry, index) => {
        query[`order[${index}][column]`] = String(entry.column);
        query[`order[${index}][dir]`] = entry.dir;
      });
      request.columns?.forEach((column, index) => {
        if (column?.data !== null && column?.data !== undefined) {
          query[`columns[${index}][data]`] = String(column.data);
        }
        const columnTerm = column?.search?.value;
        if (columnTerm) query[`columns[${index}][search][value]`] = columnTerm;
      });

      const orderColumn = order ? request.columns?.[order.column]?.data : undefined;
      lastQueryRef.current = {
        search: term,
        sortBy: typeof orderColumn === 'string' && orderColumn ? orderColumn : 'id',
        sortDir: order?.dir === 'asc' ? 'asc' : 'desc',
      };

      for (const [key, value] of Object.entries(filtersRef.current)) {
        if (value === undefined || value === null || value === '') continue;
        query[key] = String(value);
      }

      try {
        const response = await api.download(endpointRef.current, query);
        const json = (await response.json()) as { data?: T[]; recordsTotal?: number };

        const rows = json.data ?? [];
        rowsRef.current = new Map(rows.map((row) => [rowIdOf(row), row]));
        callback(json);
        onLoadedRef.current?.(rows, json.recordsTotal ?? rows.length);
      } catch (error) {
        // Hand DataTables an empty result so it stops its own spinner, then
        // surface the real reason to the user.
        setLoading(false);
        callback({
          draw: request.draw ?? 1,
          recordsTotal: 0,
          recordsFiltered: 0,
          data: [],
        });
        toastError(error instanceof Error ? error.message : 'Could not load the table');
      }
    },
    [pageLength, rowIdOf]
  );

  const loadRef = useRef(load);

  /**
   * Hand the latest props to the DataTables callbacks.
   *
   * Options are read from inside callbacks that fire long after render, and
   * `new DataTables(...)` runs before the instance is assigned — so the values
   * are read through refs. Synced in an effect declared *above* the instance
   * setup, so a rebuilt table always sees current props.
   */
  useEffect(() => {
    columnsRef.current = columns;
    actionsRef.current = actions;
    onActionRef.current = onAction;
    onLoadedRef.current = onLoaded;
    filtersRef.current = filters ?? {};
    endpointRef.current = endpoint;
    loadRef.current = load;
  }, [columns, actions, onAction, onLoaded, filters, endpoint, load]);

  /* ------------------------------------------------------- instance setup */

  // Structural identity of the columns. Renderers are read through the ref, so
  // the table only needs rebuilding when the *shape* changes.
  const columnSignature = useMemo(
    () => JSON.stringify(columns.map((column) => [column.data, column.title, !!column.sortable])),
    [columns]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // React only owns the wrapper: DataTables builds and tears down the whole
    // <table>, which avoids two libraries fighting over the same DOM nodes.
    container.innerHTML = '';
    const table = document.createElement('table');
    table.className = 'dataTable w-full';
    container.appendChild(table);

    const definitions: ColumnOptions[] = columnsRef.current.map((column, index) => {
      const isActions = column.data === ACTIONS_COLUMN;
      return {
        data: isActions ? null : column.data,
        title: column.title,
        orderable: isActions ? false : Boolean(column.sortable),
        searchable: false,
        className: cn('dt-cell', column.className),
        // `render` is only used for display; sorting and filtering are the
        // server's job, so the raw value is passed straight back through.
        render: isActions
          ? (_value: unknown, type: string, row: T) => {
              if (type !== 'display') return '';
              const rowId = String((row as Record<string, unknown>)[rowIdField] ?? '');
              const list = actionsRef.current?.(row) ?? [];
              return list.length ? actionButtons(list, rowId) : '';
            }
          : (value: unknown, type: string, row: T) => {
              if (type !== 'display') return value as string;
              const definition = columnsRef.current[index];
              const rowId = String((row as Record<string, unknown>)[rowIdField] ?? '');
              return definition?.render ? definition.render(row, rowId) : orDash(value);
            },
      };
    });

    // Default to the first sortable column so every table loads in a stable,
    // meaningful order rather than by primary key.
    const sortColumnIndex = initialSort
      ? columnsRef.current.findIndex((column) => column.data === initialSort.column)
      : columnsRef.current.findIndex((column) => column.sortable);
    const order: Array<[number, 'asc' | 'desc']> =
      sortColumnIndex >= 0
        ? [[sortColumnIndex, initialSort?.dir ?? 'desc']]
        : [[0, 'desc']];

    const config: Config = {
      serverSide: true,
      processing: false,
      searching: true,
      ordering: true,
      paging: true,
      autoWidth: false,
      pageLength,
      lengthMenu: [ROW_LENGTHS, ROW_LENGTHS],
      order,
      columns: definitions,
      // The toolbar, search box and export controls are React's; DataTables
      // keeps only the record count and the pagination buttons.
      layout: {
        topStart: null,
        topEnd: null,
        bottomStart: 'info',
        bottomEnd: 'paging',
        bottom2Start: null,
        bottom2End: null,
      },
      language: {
        processing: 'Loading…',
        search: '',
        searchPlaceholder: 'Search…',
        lengthMenu: '_MENU_',
        info: 'Showing <b>_START_</b>–<b>_END_</b> of <b>_TOTAL_</b>',
        infoEmpty: 'No records',
        infoFiltered: '(filtered from _MAX_)',
        zeroRecords: 'No matching records',
        emptyTable: emptyMessage,
        loadingRecords: 'Loading…',
        paginate: { first: 'First', last: 'Last', next: 'Next', previous: 'Previous' },
      },
      ajax: (request, callback) => {
        void loadRef.current(request as AjaxData, callback);
      },
      preDrawCallback: () => setLoading(true),
      drawCallback: () => {
        setLoading(false);
        const api_ = instanceRef.current;
        if (!api_) return;
        const pageInfo = api_.page.info();
        setInfo({
          page: pageInfo.page + 1,
          pages: pageInfo.pages,
          total: pageInfo.recordsDisplay,
          from: pageInfo.start + 1,
          to: pageInfo.end,
        });
      },
    };

    instanceRef.current = new DataTables(table, config) as Api<T>;

    const onContainerClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        '[data-row-action]'
      );
      if (!target || !container.contains(target)) return;
      const key = target.dataset.rowAction;
      const rowId = target.dataset.rowId;
      if (!key || rowId === undefined) return;
      const row = rowsRef.current.get(rowId);
      if (row) onActionRef.current?.(key, row);
    };
    container.addEventListener('click', onContainerClick);

    return () => {
      container.removeEventListener('click', onContainerClick);
      instanceRef.current?.destroy();
      instanceRef.current = null;
      container.innerHTML = '';
    };
    // `pageLength`, `emptyMessage` and `initialSort` are intentionally not
    // dependencies: changing them rebuilds the whole table, which would drop
    // the user's current page and search term.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnSignature, rowIdField]);

  /* ------------------------------------------------------------ reactions */

  // A filter change re-queries from page 1.
  const filtersKey = JSON.stringify(filters ?? {});
  useEffect(() => {
    instanceRef.current?.ajax.reload(undefined, false);
  }, [filtersKey]);

  // Debounced server-side search.
  useEffect(() => {
    const handle = setTimeout(() => {
      const instance = instanceRef.current;
      if (!instance) return;
      if (instance.search() === search) return;
      instance.search(search).draw();
    }, 300);
    return () => clearTimeout(handle);
  }, [search]);

  // Owner-driven refetch after a row action changed the data.
  const reloadTokenRef = useRef(reloadToken);
  useEffect(() => {
    if (reloadTokenRef.current === reloadToken) return;
    reloadTokenRef.current = reloadToken;
    instanceRef.current?.ajax.reload(undefined, false);
  }, [reloadToken]);

  const reload = useCallback(() => {
    instanceRef.current?.ajax.reload(undefined, false);
  }, []);

  /* --------------------------------------------------------------- export */

  const exportColumns = useMemo<Array<ExportColumn<T>>>(
    () =>
      columns
        .filter((column) => column.data !== ACTIONS_COLUMN && !column.skipExport)
        .map((column) => ({
          key: column.data,
          header: column.exportTitle ?? column.title,
          value: column.exportValue,
        })),
    [columns]
  );

  /**
   * Walk every page of the current result set at the largest size the API
   * allows. Exports therefore honour the active search, sort and filters
   * rather than only dumping the page the user happens to be looking at.
   */
  const fetchAll = useCallback(async (): Promise<T[]> => {
    const { search: term, sortBy, sortDir } = lastQueryRef.current;
    const collected: T[] = [];
    let page = 1;
    let pages = 1;

    do {
      const result = await api.list<T>(endpointRef.current, {
        ...filtersRef.current,
        search: term || undefined,
        sortBy,
        sortDir,
        page,
        pageSize: 200,
      });
      collected.push(...result.data);
      pages = result.meta.totalPages;
      page += 1;
    } while (page <= pages && page <= 100);

    return collected;
  }, []);

  const runExport = useCallback(
    async (format: ExportFormat) => {
      setExporting(format);
      try {
        const rows = await fetchAll();
        if (rows.length === 0) {
          toastError('There is nothing to export');
          return;
        }
        exportRows(rows, exportColumns, format, {
          filename: exportName ?? id,
          title: exportTitle ?? id,
        });
      } catch (error) {
        toastError(error instanceof Error ? error.message : 'Could not build the export');
      } finally {
        setExporting(null);
      }
    },
    [exportColumns, exportName, exportTitle, fetchAll, id]
  );

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* ---------------------------------------------------------- toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {hideSearch ? null : (
            <div className="relative min-w-56 flex-1 sm:max-w-xs">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-sand-400"
                aria-hidden
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="h-9 w-full rounded-lg border border-sand-300 bg-white pl-9 pr-8 text-sm text-sand-900 placeholder:text-sand-400 focus:border-clay-500 focus:outline-none focus:ring-2 focus:ring-clay-500/25 dark:border-walnut-800 dark:bg-walnut-900 dark:text-sand-100"
              />
              {search ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-sand-400 hover:text-sand-700 dark:hover:text-sand-200"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>
          )}
          {toolbar}
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden whitespace-nowrap text-xs text-muted sm:inline">
            {info.total} {info.total === 1 ? 'record' : 'records'}
          </span>
          {hideExport ? null : (
            <Dropdown
              label="Export"
              trigger={
                <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-sand-300 px-3 text-xs font-medium text-sand-700 transition-colors hover:bg-sand-100 dark:border-walnut-800 dark:text-sand-300 dark:hover:bg-walnut-800">
                  {exporting ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <FileText className="size-3.5" />
                  )}
                  Export
                </span>
              }
              items={[
                {
                  label: 'CSV (.csv)',
                  icon: <FileText className="size-4" />,
                  onClick: () => void runExport('csv'),
                },
                {
                  label: 'Excel (.xls)',
                  icon: <FileSpreadsheet className="size-4" />,
                  onClick: () => void runExport('excel'),
                },
                {
                  label: 'PDF (print)',
                  icon: <Printer className="size-4" />,
                  onClick: () => void runExport('pdf'),
                },
                {
                  label: 'Print',
                  icon: <Printer className="size-4" />,
                  onClick: () => void runExport('print'),
                },
                {
                  label: 'JSON (.json)',
                  icon: <FileJson className="size-4" />,
                  divider: true,
                  onClick: () => void runExport('json'),
                },
              ]}
            />
          )}
          <button
            type="button"
            onClick={reload}
            aria-label="Reload"
            title="Reload"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-sand-300 text-sand-600 transition-colors hover:bg-sand-100 dark:border-walnut-800 dark:text-sand-300 dark:hover:bg-walnut-800"
          >
            <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------ table */}
      <div className="surface-card relative overflow-hidden">
        <div className="overflow-x-auto">
          <div ref={containerRef} id={`datatable-${id}`} className="table-shell" />
        </div>

        {loading ? (
          <div className="absolute inset-0 z-10 flex items-start justify-center bg-white/60 pt-24 backdrop-blur-[1px] dark:bg-walnut-950/60">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-4 py-2 text-xs font-medium text-sand-600 shadow-sm dark:text-sand-300">
              <Loader2 className="size-3.5 animate-spin text-clay-600" />
              Loading…
            </span>
          </div>
        ) : null}
      </div>

      <p className="text-xs text-muted sm:hidden">
        {info.total} {info.total === 1 ? 'record' : 'records'}
      </p>
    </div>
  );
}
