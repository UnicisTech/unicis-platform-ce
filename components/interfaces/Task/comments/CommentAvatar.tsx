interface CommentAvatarProps {
  image: string | null;
  username: string;
}

const CommentAvatar = ({ image, username }: CommentAvatarProps) => (
  <label
    htmlFor="image"
    className="group relative mt-2 flex h-9 w-9 cursor-pointer flex-col items-center justify-center rounded-full border border-gray-300 bg-white transition-all hover:bg-gray-50"
  >
    <img
      src={
        image || `https://api.dicebear.com/7.x/initials/svg?seed=${username}`
      }
      alt={username}
      className="h-full w-full rounded-full object-cover"
    />
  </label>
);

export default CommentAvatar;
