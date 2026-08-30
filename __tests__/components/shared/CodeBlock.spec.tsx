import { fireEvent, render, screen } from '@testing-library/react';
import { CodeBlock } from '@/components/shared/CodeBlock';

jest.mock('next-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-hot-toast', () => ({
  toast: { success: jest.fn() },
}));

describe('CodeBlock', () => {
  it('copies copyText while rendering only the masked preview', () => {
    const writeText = jest.fn();

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    render(
      <CodeBlock
        text="enroll --secret=********"
        copyText="enroll --secret=real-secret"
      />
    );

    expect(screen.getByText('enroll --secret=********')).toBeTruthy();
    expect(screen.queryByText('enroll --secret=real-secret')).toBeNull();

    fireEvent.click(screen.getByTitle('copy-to-clipboard'));

    expect(writeText).toHaveBeenCalledWith('enroll --secret=real-secret');
  });
});
