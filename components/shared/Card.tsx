import React from 'react';

interface CardProps {
  heading?: string;
  children: React.ReactNode;
  button?: React.ReactNode;
}

const Card = (props: CardProps) => {
  const { heading, children, button } = props;

  return (
    <div className="card w-full border border-rounded dark:border-gray-600 mb-5">
      <div className="border-b border-gray-300 bg-gray-100 dark:border-gray-600 px-3 py-3 text-sm font-medium text-gray-900 flex justify-between items-center dark:bg-gray-700 dark:text-gray-400">
        <div>{heading || ''}</div>
        <div>{button ? button : null}</div>
      </div>
      <div>{children}</div>
    </div>
  );
};

const Title = ({ children }: { children: React.ReactNode }) => {
  return (
    <h2 className="card-title text-xl font-medium leading-none tracking-tight">
      {children}
    </h2>
  );
};

const Description = ({ children }: { children: React.ReactNode }) => {
  return <p className="text-gray-600 dark:text-gray-400 text-sm">{children}</p>;
};

const Header = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex gap-3 flex-col">{children}</div>;
};

//TODO: card fix className
const Body = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`card-body gap-6 p-6 dark:bg-[color:hsla(var(--b1))] ${
        className || ''
      }`}
    >
      {children}
    </div>
  );
};

const Footer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="card-actions justify-end dark:border-gray-600 p-3 border-t bg-gray-50 dark:bg-inherit">
      {children}
    </div>
  );
};

Card.Body = Body;
Card.Title = Title;
Card.Description = Description;
Card.Header = Header;
Card.Footer = Footer;

export default Card;
