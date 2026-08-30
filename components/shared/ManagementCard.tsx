import * as React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/ui/card';
import { cn } from '@/components/shadcn/lib/utils';

export type ManagementCardProps = React.ComponentPropsWithoutRef<typeof Card>;

export const ManagementCard = React.forwardRef<
  React.ElementRef<typeof Card>,
  ManagementCardProps
>(({ className, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      'overflow-hidden rounded-xl border border-slate-200 bg-white shadow-none dark:border-slate-700 dark:bg-slate-800',
      className
    )}
    {...props}
  />
));
ManagementCard.displayName = 'ManagementCard';

export interface ManagementCardHeaderProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CardHeader>, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  titleClassName?: string;
  descriptionClassName?: string;
}

export const ManagementCardHeader = React.forwardRef<
  React.ElementRef<typeof CardHeader>,
  ManagementCardHeaderProps
>(
  (
    {
      title,
      description,
      action,
      className,
      titleClassName,
      descriptionClassName,
      ...props
    },
    ref
  ) => (
    <CardHeader
      ref={ref}
      className={cn(
        'flex flex-col gap-3 space-y-0 border-b border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
      {...props}
    >
      <div className="min-w-0">
        <CardTitle
          className={cn(
            'text-[12px] font-semibold uppercase leading-4 tracking-wide text-slate-700 dark:text-slate-200',
            titleClassName
          )}
        >
          {title}
        </CardTitle>

        {description != null && (
          <CardDescription
            className={cn(
              'mt-0.5 text-xs text-slate-500 dark:text-slate-400',
              descriptionClassName
            )}
          >
            {description}
          </CardDescription>
        )}
      </div>

      {action != null && <div className="shrink-0">{action}</div>}
    </CardHeader>
  )
);
ManagementCardHeader.displayName = 'ManagementCardHeader';

export interface ManagementCardContentProps
  extends React.ComponentPropsWithoutRef<typeof CardContent> {
  scrollable?: boolean;
}

export const ManagementCardContent = React.forwardRef<
  React.ElementRef<typeof CardContent>,
  ManagementCardContentProps
>(({ className, scrollable = false, ...props }, ref) => (
  <CardContent
    ref={ref}
    className={cn('p-0', scrollable && 'overflow-x-auto', className)}
    {...props}
  />
));
ManagementCardContent.displayName = 'ManagementCardContent';

export type ManagementCardFooterProps = React.ComponentPropsWithoutRef<
  typeof CardFooter
>;

export const ManagementCardFooter = React.forwardRef<
  React.ElementRef<typeof CardFooter>,
  ManagementCardFooterProps
>(({ className, ...props }, ref) => (
  <CardFooter
    ref={ref}
    className={cn(
      'flex flex-col items-stretch gap-2 border-t border-slate-200 px-4 py-3 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-end [&>button]:w-full sm:[&>button]:w-auto',
      className
    )}
    {...props}
  />
));
ManagementCardFooter.displayName = 'ManagementCardFooter';
