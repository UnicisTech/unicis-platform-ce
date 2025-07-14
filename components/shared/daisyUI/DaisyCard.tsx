import React, { ElementType, ReactNode } from 'react';

const Base = ({
  children,
  bordered = true,
  className = '',
}: {
  children: ReactNode;
  bordered?: boolean;
  className?: string;
}) => (
  <div
    className={`card shadow-lg bg-white ${
      bordered ? 'border border-gray-300' : ''
    } ${className}`}
  >
    {children}
  </div>
);

const Title = ({
  children,
  tag: Tag = 'div',
  className = '',
}: {
  children: ReactNode;
  tag?: ElementType;
  className?: string;
}) => <Tag className={`card-title font-bold ${className}`}>{children}</Tag>;

const Body = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => <div className={`card-body ${className}`}>{children}</div>;

const Actions = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => <div className={`card-actions justify-end ${className}`}>{children}</div>;

const DaisyCard = Object.assign(Base, {
  Title,
  Body,
  Actions,
});

export default DaisyCard;
