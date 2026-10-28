'use client';

import { forwardRef, useId } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

const CONTROL =
  'w-full rounded-lg border bg-white px-3 text-sm text-sand-900 transition-colors ' +
  'placeholder:text-sand-400 ' +
  'focus:border-clay-500 focus:outline-none focus:ring-2 focus:ring-clay-500/25 ' +
  'disabled:cursor-not-allowed disabled:bg-sand-100 disabled:text-sand-500 ' +
  'dark:bg-walnut-900 dark:text-sand-100 dark:placeholder:text-sand-600 dark:disabled:bg-walnut-950';

const BORDER = 'border-sand-300 dark:border-walnut-800';
const BORDER_ERROR = 'border-rose-400 dark:border-rose-700';

function controlClass(error?: boolean, className?: string) {
  return cn(CONTROL, error ? BORDER_ERROR : BORDER, className);
}

/* ------------------------------------------------------------------- field */

export interface FieldProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: string | null;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

/** Label + control + hint/error wrapper used by every form in the app. */
export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <label
          htmlFor={htmlFor}
          className="text-xs font-semibold uppercase tracking-wide text-sand-600 dark:text-sand-400"
        >
          {label}
          {required ? <span className="ml-1 text-rose-500">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------- input */

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: React.ReactNode;
  error?: string | null;
  /** Leading adornment, e.g. a search icon. */
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leftIcon, rightSlot, className, containerClassName, id, ...rest },
  ref
) {
  const generated = useId();
  const inputId = id ?? generated;

  const control = (
    <div className="relative">
      {leftIcon ? (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sand-400">
          {leftIcon}
        </span>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={controlClass(
          Boolean(error),
          cn('h-10', Boolean(leftIcon) && 'pl-9', Boolean(rightSlot) && 'pr-10', className)
        )}
        {...rest}
      />
      {rightSlot ? (
        <span className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</span>
      ) : null}
    </div>
  );

  if (!label && !hint && !error) return control;
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={rest.required}
      htmlFor={inputId}
      className={containerClassName}
    >
      {control}
    </Field>
  );
});

/* ---------------------------------------------------------------- textarea */

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: React.ReactNode;
  error?: string | null;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, className, containerClassName, id, rows = 4, ...rest },
  ref
) {
  const generated = useId();
  const fieldId = id ?? generated;

  const control = (
    <textarea
      ref={ref}
      id={fieldId}
      rows={rows}
      aria-invalid={error ? true : undefined}
      className={controlClass(Boolean(error), cn('py-2 leading-relaxed', className))}
      {...rest}
    />
  );

  if (!label && !hint && !error) return control;
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={rest.required}
      htmlFor={fieldId}
      className={containerClassName}
    >
      {control}
    </Field>
  );
});

/* ------------------------------------------------------------------ select */

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  hint?: React.ReactNode;
  error?: string | null;
  options?: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    hint,
    error,
    options = [],
    placeholder,
    className,
    containerClassName,
    id,
    children,
    ...rest
  },
  ref
) {
  const generated = useId();
  const fieldId = id ?? generated;

  const control = (
    <div className="relative">
      <select
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        className={controlClass(
          Boolean(error),
          cn('h-10 cursor-pointer appearance-none pr-9', className)
        )}
        {...rest}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-sand-400"
        aria-hidden
      />
    </div>
  );

  if (!label && !hint && !error) return control;
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={rest.required}
      htmlFor={fieldId}
      className={containerClassName}
    >
      {control}
    </Field>
  );
});

/* ---------------------------------------------------------------- checkbox */

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string | null;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, error, className, id, ...rest },
  ref
) {
  const generated = useId();
  const fieldId = id ?? generated;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="group flex cursor-pointer items-start gap-2.5">
        <input
          ref={ref}
          id={fieldId}
          type="checkbox"
          className={cn(
            'mt-0.5 size-4 shrink-0 cursor-pointer rounded border-sand-300 text-clay-600',
            'focus:ring-2 focus:ring-clay-500/30 focus:ring-offset-0',
            'dark:border-walnut-800 dark:bg-walnut-900 dark:checked:bg-clay-600',
            className
          )}
          {...rest}
        />
        {label || description ? (
          <span className="flex flex-col gap-0.5">
            {label ? (
              <span className="text-sm font-medium text-sand-800 dark:text-sand-200">{label}</span>
            ) : null}
            {description ? <span className="text-xs text-muted">{description}</span> : null}
          </span>
        ) : null}
      </label>
      {error ? (
        <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
      ) : null}
    </div>
  );
});

/* ------------------------------------------------------------------ switch */

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  name?: string;
}

/** Accessible on/off toggle used across the Settings screens. */
export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  id,
  name,
}: SwitchProps) {
  const generated = useId();
  const fieldId = id ?? generated;

  return (
    <div className="flex items-start justify-between gap-4">
      {label || description ? (
        <label htmlFor={fieldId} className="flex cursor-pointer flex-col gap-0.5">
          {label ? (
            <span className="text-sm font-medium text-sand-800 dark:text-sand-200">{label}</span>
          ) : null}
          {description ? <span className="text-xs text-muted">{description}</span> : null}
        </label>
      ) : null}
      <button
        id={fieldId}
        name={name}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-500',
          checked ? 'bg-clay-600' : 'bg-sand-300 dark:bg-walnut-800',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <span
          className={cn(
            'inline-block size-4 transform rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------- radio group */

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export function RadioGroup({
  name,
  value,
  onChange,
  options,
  columns = 2,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  columns?: number;
}) {
  return (
    <div
      className={cn(
        'grid gap-2.5',
        columns === 1 ? 'grid-cols-1' : columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <label
            key={option.value}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all',
              active
                ? 'border-clay-500 bg-clay-50 ring-1 ring-clay-500/30 dark:bg-clay-950/40'
                : 'border-sand-300 hover:border-sand-400 hover:bg-sand-100 dark:border-walnut-800 dark:hover:bg-walnut-800'
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={active}
              onChange={() => onChange(option.value)}
              className="mt-0.5 size-4 cursor-pointer text-clay-600 focus:ring-clay-500/30"
            />
            <span className="flex flex-col gap-0.5">
              <span className="flex items-center gap-1.5 text-sm font-medium text-sand-900 dark:text-sand-100">
                {option.icon}
                {option.label}
              </span>
              {option.description ? (
                <span className="text-xs text-muted">{option.description}</span>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}
