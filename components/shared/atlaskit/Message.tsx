import { ReactNode } from 'react';
import SectionMessage, { Appearance } from '@atlaskit/section-message';

const Message = ({
  title,
  appearance,
  text,
  isBold,
}: {
  title?: string;
  appearance?: Appearance | undefined;
  text: ReactNode;
  isBold?: boolean;
}) => {
  return (
    <div style={{ margin: '5px' }}>
      <SectionMessage title={title} appearance={appearance}>
        <p className={`${isBold ? 'font-bold' : ''}`}>{text}</p>
      </SectionMessage>
    </div>
  );
};

export default Message;
