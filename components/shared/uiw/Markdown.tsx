import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import dynamic from 'next/dynamic';
import React, { useMemo } from 'react';
import type { MDEditorProps } from '@uiw/react-md-editor';
import type { MarkdownPreviewProps } from '@uiw/react-markdown-preview';
import useTheme from 'hooks/useTheme';

const MDEditorBase = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

const MarkdownPreviewBase = dynamic(
  () => import('@uiw/react-markdown-preview').then((mod) => mod.default),
  { ssr: false }
);

const useResolvedColorMode = () => {
  const { theme } = useTheme();
  return useMemo(() => {
    if (theme === 'dark' || theme === 'light') return theme;
    if (typeof document === 'undefined') return 'light';
    return document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light';
  }, [theme]);
};

export const MDEditor = (props: MDEditorProps) => {
  const colorMode = useResolvedColorMode();
  return (
    <div data-color-mode={colorMode}>
      <MDEditorBase {...props} />
    </div>
  );
};

export const MarkdownPreview = (props: MarkdownPreviewProps) => {
  const colorMode = useResolvedColorMode();
  return (
    <div data-color-mode={colorMode}>
      <MarkdownPreviewBase {...props} />
    </div>
  );
};
