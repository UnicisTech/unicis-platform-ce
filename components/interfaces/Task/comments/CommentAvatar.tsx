interface CommentAvatarProps {
  image: string | null;
  username: string;
}

const CommentAvatar = ({ image, username }: CommentAvatarProps) => (
  <div className="flex-shrink-0 h-7 w-7 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
    <img
      src={
        image || `https://api.dicebear.com/7.x/initials/svg?seed=${username}`
      }
      alt={username}
      className="h-full w-full object-cover"
    />
  </div>
);

export default CommentAvatar;
