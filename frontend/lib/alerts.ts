import Swal, { type SweetAlertResult } from 'sweetalert2';

/**
 * SweetAlert2 wrappers themed to the app.
 *
 * Every call site goes through here so the confirm/success/error/warning
 * vocabulary — wording, colours, button order — is consistent, and so dark mode
 * only has to be wired up once.
 */

function isDark(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

const BRAND = '#c2542b';

function base() {
  return {
    confirmButtonColor: BRAND,
    cancelButtonColor: '#7d6f5c',
    background: isDark() ? '#211d19' : '#ffffff',
    color: isDark() ? '#f5f2ec' : '#2a241e',
    customClass: {
      popup: 'rounded-2xl',
    },
  };
}

export interface ConfirmOptions {
  title: string;
  text?: string;
  html?: string;
  confirmText?: string;
  cancelText?: string;
  /** Red confirm button for destructive actions. */
  danger?: boolean;
}

/** Delete/confirm dialog. Resolves `true` only when the user confirms. */
export async function confirmAction(options: ConfirmOptions): Promise<boolean> {
  const result: SweetAlertResult = await Swal.fire({
    ...base(),
    title: options.title,
    text: options.text,
    html: options.html,
    icon: options.danger ? 'warning' : 'question',
    showCancelButton: true,
    confirmButtonText: options.confirmText ?? (options.danger ? 'Yes, delete it' : 'Confirm'),
    cancelButtonText: options.cancelText ?? 'Cancel',
    confirmButtonColor: options.danger ? '#b91c1c' : BRAND,
    reverseButtons: true,
    focusCancel: Boolean(options.danger),
    customClass: { popup: 'rounded-2xl' },
  });
  return result.isConfirmed;
}

export function toast(
  message: string,
  icon: 'success' | 'error' | 'warning' | 'info' = 'success'
): void {
  void Swal.fire({
    ...base(),
    toast: true,
    position: 'top-end',
    icon,
    title: message,
    showConfirmButton: false,
    timer: icon === 'error' ? 5200 : 3000,
    timerProgressBar: true,
    didOpen: (element) => {
      element.addEventListener('mouseenter', Swal.stopTimer);
      element.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });
}

export const toastSuccess = (message: string) => toast(message, 'success');
export const toastError = (message: string) => toast(message, 'error');
export const toastWarning = (message: string) => toast(message, 'warning');
export const toastInfo = (message: string) => toast(message, 'info');

/** Blocking success panel with an optional "view it" link. */
export async function alertSuccess(title: string, text?: string): Promise<void> {
  await Swal.fire({ ...base(), icon: 'success', title, text, confirmButtonText: 'Done' });
}

export async function alertError(title: string, text?: string): Promise<void> {
  await Swal.fire({ ...base(), icon: 'error', title, text, confirmButtonText: 'Close' });
}

export async function alertWarning(title: string, text?: string): Promise<void> {
  await Swal.fire({ ...base(), icon: 'warning', title, text, confirmButtonText: 'OK' });
}

export async function alertInfo(title: string, text?: string): Promise<void> {
  await Swal.fire({ ...base(), icon: 'info', title, text, confirmButtonText: 'OK' });
}

/**
 * A spinner that stays up while `task` runs, then closes itself. Used for
 * multi-step saves where a bare button spinner is easy to miss.
 */
export async function withSpinner<T>(title: string, task: () => Promise<T>): Promise<T> {
  void Swal.fire({
    ...base(),
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => Swal.showLoading(),
  });
  try {
    return await task();
  } finally {
    Swal.close();
  }
}

/** Form-embedded input dialog, used by the file "rename" action. */
export async function promptText(options: {
  title: string;
  inputValue?: string;
  placeholder?: string;
  confirmText?: string;
}): Promise<string | null> {
  const result = await Swal.fire({
    ...base(),
    title: options.title,
    input: 'text',
    inputValue: options.inputValue ?? '',
    inputPlaceholder: options.placeholder,
    showCancelButton: true,
    confirmButtonText: options.confirmText ?? 'Save',
    reverseButtons: true,
  });
  if (!result.isConfirmed) return null;
  return String(result.value ?? '').trim();
}

export { Swal };
