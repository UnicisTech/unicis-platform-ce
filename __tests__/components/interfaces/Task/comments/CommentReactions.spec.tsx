import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CommentReactions from '@/components/interfaces/Task/comments/CommentReactions';
import type { TaskCommentDto } from 'types';

const mockCanAccess = jest.fn();

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'user-1' } } }),
}));
jest.mock('hooks/useCanAccess', () => ({
  __esModule: true,
  default: () => ({ canAccess: mockCanAccess }),
}));

const comment = {
  id: 10,
  text: 'Comment',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  taskId: 1,
  createdById: 'user-2',
  createdBy: { id: 'user-2', name: 'Other User' },
  reactions: [
    {
      id: 1,
      emoji: '👍',
      commentId: 10,
      userId: 'user-2',
      createdAt: '2026-01-01T00:00:00.000Z',
      user: { id: 'user-2', name: 'Other User' },
    },
  ],
} satisfies TaskCommentDto;

describe('CommentReactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows reaction counts without interactive controls when commenting is denied', () => {
    mockCanAccess.mockReturnValue(false);

    render(
      <CommentReactions
        slug="test-team"
        comment={comment}
        onReact={jest.fn()}
      />
    );

    expect(mockCanAccess).toHaveBeenCalledWith('task', ['comment']);
    expect(screen.getByTitle('Other User').tagName).toBe('SPAN');
    expect(screen.queryByTitle('Add reaction')).toBeNull();
  });

  it('allows reactions when commenting is permitted', async () => {
    mockCanAccess.mockReturnValue(true);
    const onReact = jest.fn().mockResolvedValue(undefined);

    render(
      <CommentReactions slug="test-team" comment={comment} onReact={onReact} />
    );

    fireEvent.click(screen.getByTitle('Other User'));

    await waitFor(() => expect(onReact).toHaveBeenCalledWith(10, '👍'));
    expect(screen.getByTitle('Add reaction')).toBeTruthy();
  });
});
