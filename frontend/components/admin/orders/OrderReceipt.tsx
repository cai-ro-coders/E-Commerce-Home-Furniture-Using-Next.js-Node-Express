'use client';

/**
 * Printable order receipt.
 *
 * Rendered two ways: on screen inside the order detail page, and off-screen for
 * `printOrderReceipt`. The offscreen copy is mounted in its own React root so the
 * print stylesheet — which only knows about `.receipt-*` rules — sees plain
 * markup with none of the app's dark-mode or layout chrome.
 */
import { createRoot } from 'react-dom/client';
import { imageUrl } from '@/lib/api';
import { printElement } from '@/lib/export';
import { formatDate, formatDateTime, formatMoney, num } from '@/lib/format';
import { BRAND } from '@/lib/nav';
import { PAYMENT_METHOD_LABELS, type Order } from '@/types';

export function OrderReceipt({ order }: { order: Order }) {
  const address = order.shipping_address;
  const items = order.items ?? [];

  return (
    <div className="receipt flex flex-col gap-5 text-sand-900">
      <header className="flex items-start justify-between gap-6 border-b border-sand-200 pb-4">
        <div>
          <p className="font-display text-xl font-semibold">{BRAND.name}</p>
          <p className="text-xs text-sand-500">{BRAND.tagline}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-lg font-semibold">Receipt</p>
          <p className="text-sm font-medium text-sand-700">{order.order_number}</p>
          <p className="text-xs text-sand-500">Placed {formatDate(order.created_at)}</p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-[0.65rem] font-semibold uppercase tracking-wide text-sand-500">
            Billed to
          </h3>
          <p className="mt-1 text-sm font-medium">{order.customer_name ?? 'Guest customer'}</p>
          {order.customer_email ? (
            <p className="text-xs text-sand-500">{order.customer_email}</p>
          ) : null}
        </div>
        <div>
          <h3 className="text-[0.65rem] font-semibold uppercase tracking-wide text-sand-500">
            Ship to
          </h3>
          {address ? (
            <address className="mt-1 not-italic text-xs leading-relaxed text-sand-600">
              <span className="block font-medium text-sand-800">{address.full_name}</span>
              <span className="block">{address.address_line_1}</span>
              {address.address_line_2 ? <span className="block">{address.address_line_2}</span> : null}
              <span className="block">
                {[address.city, address.province, address.postal_code]
                  .filter(Boolean)
                  .join(', ')}
              </span>
              <span className="block">{address.country}</span>
              <span className="block">{address.phone}</span>
            </address>
          ) : (
            <p className="mt-1 text-xs text-sand-500">
              {order.city ? `${order.city}${order.province ? `, ${order.province}` : ''}` : '—'}
            </p>
          )}
        </div>
      </section>

      <table>
        <thead>
          <tr className="border-b border-sand-300 text-[0.65rem] uppercase tracking-wide text-sand-500">
            <th className="py-1.5 pr-2 text-left font-semibold">Item</th>
            <th className="py-1.5 pr-2 text-left font-semibold">SKU</th>
            <th className="py-1.5 pr-2 text-right font-semibold">Qty</th>
            <th className="py-1.5 pr-2 text-right font-semibold">Price</th>
            <th className="py-1.5 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-sand-200 align-top">
              <td className="py-2 pr-2">
                <span className="flex items-center gap-2">
                  {item.product_image ? (
                    // Uploaded images are SVG placeholders; see `next.config.ts`.
                    <img
                      src={imageUrl(item.product_image)}
                      alt=""
                      width={32}
                      height={32}
                      className="size-8 rounded border border-sand-200 object-cover"
                    />
                  ) : null}
                  <span className="text-xs font-medium">{item.product_name}</span>
                </span>
              </td>
              <td className="py-2 pr-2 text-xs text-sand-500">{item.sku}</td>
              <td className="py-2 pr-2 text-right text-xs tabular-nums">{item.quantity}</td>
              <td className="py-2 pr-2 text-right text-xs tabular-nums">
                {formatMoney(item.price, 'PHP')}
              </td>
              <td className="py-2 text-right text-xs font-semibold tabular-nums">
                {formatMoney(item.total, 'PHP')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="flex justify-end">
        <dl className="flex w-64 flex-col gap-1.5 text-xs">
          <Line label="Subtotal" value={order.subtotal} />
          {num(order.discount) > 0 ? (
            <Line label="Discount" value={`− ${formatMoney(order.discount, 'PHP')}`} />
          ) : null}
          <Line label="Shipping" value={order.shipping_fee} />
          {num(order.tax) > 0 ? <Line label="Tax" value={order.tax} /> : null}
          <div className="mt-1 flex items-baseline justify-between border-t border-sand-300 pt-2">
            <dt className="text-sm font-semibold">Total</dt>
            <dd className="font-display text-lg font-semibold tabular-nums">
              {formatMoney(order.grand_total, 'PHP')}
            </dd>
          </div>
        </dl>
      </section>

      <section className="grid grid-cols-2 gap-6 border-t border-sand-200 pt-4 text-xs">
        <div>
          <h3 className="text-[0.65rem] font-semibold uppercase tracking-wide text-sand-500">
            Payment
          </h3>
          <p className="mt-1">
            {PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method} · {order.payment_status}
          </p>
          {order.payment?.transaction_id ? (
            <p className="text-sand-500">Ref {order.payment.transaction_id}</p>
          ) : null}
          {order.payment?.paid_at ? (
            <p className="text-sand-500">Paid {formatDateTime(order.payment.paid_at)}</p>
          ) : null}
        </div>
        <div className="text-right">
          <h3 className="text-[0.65rem] font-semibold uppercase tracking-wide text-sand-500">
            Fulfilment
          </h3>
          <p className="mt-1">{order.order_status}</p>
          {order.notes ? <p className="mt-1 text-sand-500">{order.notes}</p> : null}
        </div>
      </section>

      <footer className="border-t border-sand-200 pt-3 text-center text-[0.65rem] text-sand-400">
        Thank you for shopping with {BRAND.name}. Keep this receipt for returns and exchanges.
      </footer>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-sand-500">{label}</dt>
      <dd className="tabular-nums text-sand-700">{formatMoney(value, 'PHP')}</dd>
    </div>
  );
}

/**
 * Render the receipt off-screen and send it to the printer.
 *
 * Mounting rather than stringifying keeps the receipt a single component: the
 * same JSX serves the screen and the paper, so the two cannot drift.
 */
export function printOrderReceipt(order: Order): void {
  const host = document.createElement('div');
  // Off-screen, not `display: none` — a hidden subtree has no layout, and
  // `printElement` reads the rendered box.
  host.style.cssText = 'position:fixed;left:-10000px;top:0;width:720px;background:#fff';
  document.body.appendChild(host);

  const root = createRoot(host);
  root.render(<OrderReceipt order={order} />);

  const cleanup = () => {
    root.unmount();
    host.remove();
    window.removeEventListener('afterprint', cleanup);
  };

  // Give React a frame to paint (and any images a moment to decode) before the
  // print dialog captures the DOM.
  window.setTimeout(() => {
    printElement(host.firstElementChild as HTMLElement | null);
    window.addEventListener('afterprint', cleanup, { once: true });
  }, 250);
}
