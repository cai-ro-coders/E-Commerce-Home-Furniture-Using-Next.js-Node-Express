import type { Response } from 'express';
import type { Paginated } from '../types';

/**
 * Consistent success envelope. Every controller returns one of these so the
 * frontend never has to guess the shape of a response.
 */
export function ok<T>(res: Response, data: T, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function created<T>(res: Response, data: T, message = 'Created successfully') {
  return ok(res, data, message, 201);
}

export function paginated<T>(res: Response, result: Paginated<T>, message = 'Success') {
  // DataTables' server-side protocol needs its own envelope; see
  // `middleware/dataTables.ts` for why only the list endpoints opt in.
  const draw = res.locals?.dataTablesDraw;
  if (typeof draw === 'number' && Number.isFinite(draw)) {
    return res.status(200).json({
      draw,
      // `total` is the filtered count. The unfiltered total is not tracked
      // separately, so both counters carry it — DataTables only pages on
      // `recordsFiltered`, and the difference is the "of N entries" caption.
      recordsTotal: result.meta.total,
      recordsFiltered: result.meta.total,
      data: result.data,
      meta: result.meta,
    });
  }

  return res.status(200).json({
    success: true,
    message,
    data: result.data,
    meta: result.meta,
  });
}

export function noContent(res: Response) {
  return res.status(204).send();
}
