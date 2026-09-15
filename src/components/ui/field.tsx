import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------------------
   Form field.

   Label above the control, helper below the label, error below the control.
   Placeholders are never used as labels. Every text colour here clears WCAG AA
   against the cobalt field.
   -------------------------------------------------------------------------- */

export function Field({
  label,
  htmlFor,
  helper,
  error,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  helper?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        htmlFor={htmlFor}
        className="text-[13px] font-semibold text-paper/90"
      >
        {label}
        {required && (
          <span className="ml-1 text-volt" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {helper && <p className="-mt-1 text-xs text-paper/55">{helper}</p>}

      {children}

      {error && (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="text-xs font-medium text-volt"
        >
          {error}
        </p>
      )}
    </div>
  );
}

const CONTROL =
  "w-full rounded-[2px] border border-[var(--line-strong)] bg-cobalt-950/60 px-3 py-2.5 text-sm text-paper placeholder:text-paper/40 outline-none transition-colors focus:border-volt";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(CONTROL, "appearance-none pr-8", className)} {...props}>
      {children}
    </select>
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(CONTROL, "min-h-24 resize-y", className)} {...props} />;
}
