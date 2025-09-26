import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "quill/dist/quill.snow.css";
import type ReactQuillType from "react-quill-new";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const QuillEditor = (props: ReactQuillType.ReactQuillProps) => {
    // Quill modules (incl. markdown shortcuts) are registered on the client
    const [modules, setModules] = useState<any | null>(null);

    useEffect(() => {
        let disposed = false;
        (async () => {
            const Quill = (await import("quill")).default;
            const MarkdownShortcuts = (await import("quill-markdown-shortcuts")).default;
            // register once
            Quill.register("modules/markdownShortcuts", MarkdownShortcuts);
            if (!disposed) {
                setModules({
                    toolbar: [
                        ["bold", "italic", "underline", "strike"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["blockquote", "code-block", "link"],
                        ["clean"],
                    ],
                    markdownShortcuts: {}, // use library defaults
                });
            }
        })();
        return () => {
            disposed = true;
        };
    }, []);
    return (
        <>
            {modules ? (
                <ReactQuill
                    theme="snow"
                    modules={modules}
                    {...props}
                />
            ) : (
                <div className="h-32 rounded border animate-pulse" />
            )}
        </>

    )
}

export default QuillEditor;