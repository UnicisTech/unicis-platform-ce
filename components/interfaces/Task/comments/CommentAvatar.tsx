import { useState } from 'react';

interface CommentAvatarProps {
  slug: string;
  userId: string;
  username: string;
}

const CommentAvatar = ({ slug, userId, username }: CommentAvatarProps) => {
  const avatarUrl = `/api/teams/${encodeURIComponent(slug)}/members/${encodeURIComponent(userId)}/avatar`;
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const hasError = failedUrl === avatarUrl;

  return (
    <div className="flex-shrink-0 h-7 w-7 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
      {hasError ? (
        <span className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          {username.charAt(0).toUpperCase() || '?'}
        </span>
      ) : (
        <img
          src={avatarUrl}
          alt={username}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setFailedUrl(avatarUrl)}
        />
      )}
    </div>
  );
};

export default CommentAvatar;
