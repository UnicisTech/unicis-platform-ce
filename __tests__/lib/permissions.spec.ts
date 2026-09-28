import { permissions } from '@/lib/permissions';

describe('permissions', () => {
  it('allows auditors to comment on tasks without allowing task updates', () => {
    const taskPermission = permissions.AUDITOR.find(
      ({ resource }) => resource === 'task'
    );

    expect(taskPermission?.actions).toContain('read');
    expect(taskPermission?.actions).toContain('comment');
    expect(taskPermission?.actions).not.toContain('update');
  });
});
