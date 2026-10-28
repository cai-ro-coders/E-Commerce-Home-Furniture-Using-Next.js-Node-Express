'use client';

/**
 * Month view of trading activity.
 *
 * FullCalendar 7 is a themed, plugin-based rewrite: the grid itself comes from
 * `daygrid`, the "list" view from `list`, and all of the chrome from
 * `themes/classic`. The theme's palette is retargeted in `globals.css`.
 *
 * `data-color-scheme` is what the classic theme keys its dark palette off, so
 * it has to switch with the app theme rather than with the OS.
 */
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/react/daygrid';
import listPlugin from '@fullcalendar/react/list';
import classicThemePlugin from '@fullcalendar/react/themes/classic';
import type { EventClickInfo } from '@fullcalendar/react';
import { useMemo } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { CHART_COLORS } from '@/components/admin/Charts';
import { alertInfo } from '@/lib/alerts';
import { formatMoney, num } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { CalendarEvent } from '@/types';

interface DashboardCalendarProps {
  events: CalendarEvent[];
  currency?: string;
  loading?: boolean;
  className?: string;
}

/** Deeper red the busier the day, so a glance shows the peaks. */
function tintFor(orders: number, max: number): string {
  if (orders <= 0) return CHART_COLORS.sand;
  const ratio = max > 0 ? orders / max : 0;
  if (ratio > 0.75) return CHART_COLORS.clay;
  if (ratio > 0.4) return CHART_COLORS.amber;
  return CHART_COLORS.emerald;
}

export function DashboardCalendar({
  events,
  currency = 'PHP',
  loading = false,
  className,
}: DashboardCalendarProps) {
  const { resolvedTheme } = useTheme();

  const maxOrders = useMemo(
    () => events.reduce((max, event) => Math.max(max, event.orders), 0),
    [events]
  );

  const calendarEvents = useMemo(
    () =>
      events.map((event) => ({
        id: event.date,
        title: event.orders > 0 ? `${event.orders} order${event.orders === 1 ? '' : 's'}` : 'No orders',
        start: event.date,
        allDay: true,
        backgroundColor: tintFor(event.orders, maxOrders),
        borderColor: tintFor(event.orders, maxOrders),
        textColor: '#ffffff',
        extendedProps: {
          orders: event.orders,
          revenue: num(event.revenue),
          new_users: event.new_users,
        },
      })),
    [events, maxOrders]
  );

  const onEventClick = (info: EventClickInfo) => {
    const props = info.event.extendedProps as {
      orders?: number;
      revenue?: number;
      new_users?: number;
    };
    void alertInfo(
      info.event.startStr,
      `${props.orders ?? 0} orders · ${formatMoney(props.revenue ?? 0, currency, {
        decimals: 0,
      })} revenue · ${props.new_users ?? 0} new customers`
    );
  };

  return (
    <div
      className={cn('fc-shell relative', loading && 'pointer-events-none opacity-60', className)}
      data-color-scheme={resolvedTheme === 'dark' ? 'dark' : 'light'}
    >
      <FullCalendar
        plugins={[dayGridPlugin, listPlugin, classicThemePlugin]}
        initialView="dayGridMonth"
        height="auto"
        contentHeight="auto"
        firstDay={1}
        dayMaxEvents={2}
        events={calendarEvents}
        eventClick={onEventClick}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,listMonth',
        }}
        todayText="Today"
        monthText="Month"
        weekTextShort="Week"
        listText="List"
        eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
        noEventsText="No orders in this period"
      />
    </div>
  );
}
