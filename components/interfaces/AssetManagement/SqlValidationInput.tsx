import React, { forwardRef, useEffect, useState } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { Input } from '@/components/shadcn/ui/input';
import { cn } from '@/components/shadcn/lib/utils';
import { validateFleetSqlQuery } from '@/lib/fleet/sqlValidation';

type ValidationState =
  | { status: 'idle' | 'pending' }
  | { status: 'valid' }
  | { status: 'invalid'; messageKey: string };

type SqlValidationInputProps = React.ComponentProps<typeof Input> & {
  error?: string;
  debounceMs?: number;
};

const SqlValidationInput = forwardRef<
  HTMLInputElement,
  SqlValidationInputProps
>(
  (
    {
      error,
      debounceMs = 1000,
      className,
      defaultValue,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const { t } = useTranslation('fleet');
    const [sql, setSql] = useState(() =>
      String(value ?? defaultValue ?? '')
    );
    const [validation, setValidation] = useState<ValidationState>(() =>
      sql.trim() ? { status: 'pending' } : { status: 'idle' }
    );

    useEffect(() => {
      if (!sql.trim()) return;

      const timeout = window.setTimeout(() => {
        const result = validateFleetSqlQuery(sql);

        setValidation(
          result.valid
            ? { status: 'valid' }
            : { status: 'invalid', messageKey: result.messageKey }
        );
      }, debounceMs);

      return () => window.clearTimeout(timeout);
    }, [debounceMs, sql]);

    const validationMessage =
      validation.status === 'valid'
        ? t('sql-query-valid')
        : validation.status === 'invalid'
          ? t(validation.messageKey)
          : undefined;
    const hasError = Boolean(error) || validation.status === 'invalid';

    return (
      <div>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            {validation.status === 'pending' && (
              <Loader2
                className="h-4 w-4 animate-spin text-muted-foreground"
                aria-hidden="true"
              />
            )}
            {validation.status === 'valid' && (
              <CheckCircle2
                className="h-4 w-4 text-green-600"
                aria-hidden="true"
              />
            )}
            {validation.status === 'invalid' && (
              <XCircle
                className="h-4 w-4 text-destructive"
                aria-hidden="true"
              />
            )}
          </span>
          <Input
            {...props}
            ref={ref}
            value={value}
            defaultValue={defaultValue}
            className={cn('pl-9', className)}
            aria-invalid={hasError}
            onChange={(event) => {
              const nextSql = event.target.value;

              setSql(nextSql);
              setValidation(
                nextSql.trim() ? { status: 'pending' } : { status: 'idle' }
              );
              onChange?.(event);
            }}
          />
        </div>
        {(error || validationMessage) && (
          <p
            className={cn(
              'mt-1 text-sm',
              error || validation.status === 'invalid'
                ? 'text-destructive'
                : 'text-green-600'
            )}
            aria-live="polite"
          >
            {error || validationMessage}
          </p>
        )}
      </div>
    );
  }
);

SqlValidationInput.displayName = 'SqlValidationInput';

export default SqlValidationInput;
