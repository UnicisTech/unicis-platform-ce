import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { ExtendedCommentDto } from 'types';

const REACTION_EMOJIS = [
  { emoji: '\u{1F44D}', label: 'Thumbs up' },
  { emoji: '\u{1F44E}', label: 'Thumbs down' },
  { emoji: '\u{1F604}', label: 'Smile' },
  { emoji: '\u{1F389}', label: 'Celebration' },
  { emoji: '\u{1F615}', label: 'Confused' },
  { emoji: '\u{2764}\u{FE0F}', label: 'Heart' },
];

interface CommentReactionsProps {
  comment: ExtendedCommentDto;
  onReact: (commentId: number, emoji: string) => Promise<void>;
}

const CommentReactions = ({ comment, onReact }: CommentReactionsProps) => {
  const { data: session } = useSession();
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const currentUserId = session?.user?.id;

  // Group reactions by emoji
  const reactionGroups = (comment.reactions || []).reduce(
    (acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = { count: 0, users: [], reactedByMe: false };
      }
      acc[reaction.emoji].count++;
      acc[reaction.emoji].users.push(reaction.user.name);
      if (reaction.userId === currentUserId) {
        acc[reaction.emoji].reactedByMe = true;
      }
      return acc;
    },
    {} as Record<
      string,
      { count: number; users: string[]; reactedByMe: boolean }
    >
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReact = async (emoji: string) => {
    setPickerOpen(false);
    await onReact(comment.id, emoji);
  };

  return (
    <div className="flex flex-wrap items-center gap-1 mt-1">
      {Object.entries(reactionGroups).map(([emoji, group]) => (
        <button
          key={emoji}
          onClick={() => handleReact(emoji)}
          title={group.users.join(', ')}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors hover:bg-gray-100 ${
            group.reactedByMe
              ? 'border-blue-300 bg-blue-50'
              : 'border-gray-200 bg-white'
          }`}
        >
          <span>{emoji}</span>
          <span className="text-gray-600">{group.count}</span>
        </button>
      ))}
      <div className="relative" ref={pickerRef}>
        <button
          onClick={() => setPickerOpen(!pickerOpen)}
          className="inline-flex items-center justify-center rounded-full border border-dashed border-gray-300 px-1.5 py-0.5 text-xs text-gray-400 transition-colors hover:border-gray-400 hover:bg-gray-50 hover:text-gray-600"
          title="Add reaction"
        >
          +
        </button>
        {pickerOpen && (
          <div className="absolute bottom-full left-0 z-10 mb-1 flex gap-1 rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg">
            {REACTION_EMOJIS.map(({ emoji, label }) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                title={label}
                className="rounded p-1 text-base transition-transform hover:scale-125 hover:bg-gray-100"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentReactions;
