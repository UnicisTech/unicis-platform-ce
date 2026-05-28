import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import 'quill/dist/quill.snow.css';
import { Smile } from 'lucide-react';
import type {
  EmojiClickData,
  Props as EmojiPickerProps,
} from 'emoji-picker-react';
import type ReactQuillType from 'react-quill-new';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/popover';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), {
  ssr: false,
});

interface ReactQuillWithRefProps extends ReactQuillType.ReactQuillProps {
  forwardedRef?: React.Ref<any>;
}

const ReactQuill = dynamic<ReactQuillWithRefProps>(
  async () => {
    const { default: ReactQuillComponent } = await import('react-quill-new');
    const ReactQuillWithRef = ({
      forwardedRef,
      ...props
    }: ReactQuillWithRefProps) => (
      <ReactQuillComponent ref={forwardedRef} {...props} />
    );

    ReactQuillWithRef.displayName = 'ReactQuillWithRef';

    return ReactQuillWithRef;
  },
  { ssr: false }
);

let quillModulesRegistered = false;

interface QuillEditorProps extends ReactQuillType.ReactQuillProps {
  enableEmojiPicker?: boolean;
}

const defaultToolbar = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote', 'code-block', 'link'],
  ['clean'],
];

const QuillEditor = ({
  enableEmojiPicker = false,
  modules: modulesProp,
  onChangeSelection,
  readOnly,
  ...props
}: QuillEditorProps) => {
  // Quill modules (incl. markdown shortcuts) are registered on the client
  const [modules, setModules] = useState<any | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const quillRef = useRef<any>(null);
  const lastSelectionRef = useRef<{ index: number; length: number } | null>(
    null
  );
  const toolbarId = `quill-toolbar-${useId().replace(/:/g, '')}`;
  const shouldShowEmojiPicker = enableEmojiPicker && !readOnly && !modulesProp;

  useEffect(() => {
    let disposed = false;
    (async () => {
      const [QuillModule, MarkdownShortcutsModule] = await Promise.all([
        import('quill'),
        import('quill-markdown-shortcuts'),
      ]);

      if (!quillModulesRegistered) {
        QuillModule.default.register(
          'modules/markdownShortcuts',
          MarkdownShortcutsModule.default,
          true
        );
        quillModulesRegistered = true;
      }

      if (!disposed) {
        setModules({
          toolbar: shouldShowEmojiPicker
            ? { container: `#${toolbarId}` }
            : defaultToolbar,
          markdownShortcuts: {}, // use library defaults
        });
        setIsReady(true);
      }
    })();
    return () => {
      disposed = true;
    };
  }, [shouldShowEmojiPicker, toolbarId]);

  const handleChangeSelection: NonNullable<
    ReactQuillType.ReactQuillProps['onChangeSelection']
  > = useCallback(
    (selection, source, editor) => {
      if (selection) {
        lastSelectionRef.current = selection;
      }
      onChangeSelection?.(selection, source, editor);
    },
    [onChangeSelection]
  );

  const handleEmojiClick = useCallback((emojiData: EmojiClickData) => {
    const editor = quillRef.current?.getEditor?.();
    if (!editor) {
      return;
    }

    const selection = editor.getSelection() ||
      lastSelectionRef.current || {
        index: Math.max(0, editor.getLength() - 1),
        length: 0,
      };

    editor.focus();
    if (selection.length > 0) {
      editor.deleteText(selection.index, selection.length, 'user');
    }
    editor.insertText(selection.index, emojiData.emoji, 'user');

    const nextIndex = selection.index + emojiData.emoji.length;
    editor.setSelection(nextIndex, 0, 'user');
    lastSelectionRef.current = { index: nextIndex, length: 0 };
    setEmojiPickerOpen(false);
  }, []);

  const activeModules = modulesProp || modules;

  return (
    <>
      {isReady && activeModules ? (
        <>
          {shouldShowEmojiPicker && (
            <div id={toolbarId}>
              <span className="ql-formats">
                <button type="button" className="ql-bold" />
                <button type="button" className="ql-italic" />
                <button type="button" className="ql-underline" />
                <button type="button" className="ql-strike" />
              </span>
              <span className="ql-formats">
                <button type="button" className="ql-list" value="ordered" />
                <button type="button" className="ql-list" value="bullet" />
              </span>
              <span className="ql-formats">
                <button type="button" className="ql-blockquote" />
                <button type="button" className="ql-code-block" />
                <button type="button" className="ql-link" />
              </span>
              <span className="ql-formats">
                <Popover
                  open={emojiPickerOpen}
                  onOpenChange={setEmojiPickerOpen}
                >
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Insert emoji"
                      title="Insert emoji"
                      className="inline-flex items-center justify-center"
                    >
                      <Smile aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <EmojiPicker
                      height={360}
                      width={320}
                      emojiStyle={'native' as EmojiPickerProps['emojiStyle']}
                      previewConfig={{ showPreview: false }}
                      onEmojiClick={handleEmojiClick}
                    />
                  </PopoverContent>
                </Popover>
              </span>
              <span className="ql-formats">
                <button type="button" className="ql-clean" />
              </span>
            </div>
          )}
          <ReactQuill
            forwardedRef={quillRef}
            theme="snow"
            {...props}
            modules={activeModules}
            readOnly={readOnly}
            onChangeSelection={handleChangeSelection}
          />
        </>
      ) : (
        <div className="h-32 rounded border animate-pulse" />
      )}
    </>
  );
};

export default QuillEditor;
