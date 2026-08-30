import { render, screen } from '@testing-library/react';
import {
  ManagementCard,
  ManagementCardContent,
  ManagementCardFooter,
  ManagementCardHeader,
} from '@/components/shared/ManagementCard';

describe('ManagementCard', () => {
  it('renders its header action, content, and footer actions', () => {
    const createLabel = 'Create tag';
    const content = 'Tag list';
    const deleteLabel = 'Delete';
    const saveLabel = 'Save';

    render(
      <ManagementCard>
        <ManagementCardHeader
          title="Tags"
          description="Manage Fleet tags"
          action={<button type="button">{createLabel}</button>}
        />
        <ManagementCardContent scrollable data-testid="content">
          {content}
        </ManagementCardContent>
        <ManagementCardFooter>
          <button type="button">{deleteLabel}</button>
          <button type="button">{saveLabel}</button>
        </ManagementCardFooter>
      </ManagementCard>
    );

    expect(screen.getByText('Tags')).toBeTruthy();
    expect(screen.getByText('Manage Fleet tags')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Create tag' })).toBeTruthy();
    expect(screen.getByText('Tag list')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
    expect(screen.getByTestId('content').className).toContain(
      'overflow-x-auto'
    );
  });
});
