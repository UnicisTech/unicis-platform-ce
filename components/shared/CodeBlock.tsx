import { CopyToClipboardButton } from '@/components/shared';
import { cn } from '../shadcn/lib/utils';

interface CodeBlockProps {
  text: string;
  language?: string;
  shouldWrapLongLines?: boolean;
  className?: string;
  showLineNumbers?: boolean;
}

export const CodeBlock = ({
  text,
  shouldWrapLongLines = true,
  className,
}: CodeBlockProps) => {
  return (
    <div className={cn('relative w-full overflow-x-auto', className)}>
      <pre
        className={cn(
          'relative bg-secondary/60 text-muted-foreground rounded-md p-4 font-mono text-sm border border-border',
          shouldWrapLongLines
            ? 'whitespace-pre-wrap break-words'
            : 'whitespace-pre overflow-x-auto'
        )}
        style={{
          maxWidth: '100%',
          overflowX: 'auto',
          wordBreak: 'break-word',
          whiteSpace: shouldWrapLongLines ? 'pre-wrap' : 'pre',
        }}
      >
        <code>{text}</code>
        <CopyToClipboardButton value={text} />
      </pre>
    </div>
  );
};
