import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

type CodeBlockProps = {
  language: string;
  text: string;
  shouldWrapLongLines?: boolean;
  codeBidiWarningTooltipEnabled?: boolean;
  i18nIsDynamicList?: boolean;
  showLineNumbers?: boolean;
};

export const CodeBlock = ({
  language,
  text,
  shouldWrapLongLines = false,
  showLineNumbers = false,
}: CodeBlockProps) => (
  <SyntaxHighlighter
    language={language}
    style={oneDark}
    wrapLongLines={shouldWrapLongLines}
    showLineNumbers={showLineNumbers}
    customStyle={{
      borderRadius: '0.5rem',
      padding: '1rem',
      fontSize: '0.875rem',
    }}
  >
    {text}
  </SyntaxHighlighter>
);
