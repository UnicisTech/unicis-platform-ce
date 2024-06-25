import React, { ReactNode } from 'react';
import {
  Body,
  Container,
  Hr,
  Img,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import app from '@/lib/app';

interface EmailLayoutProps {
  children: ReactNode;
}

const EmailLayout = ({ children }: EmailLayoutProps) => {
  console.log('EmailLayout', app.logoUrl);
  return (
    <Tailwind>
      <Body className="bg-white my-auto mx-auto font-sans">
        <Container className="border border-solid bg-white border-[#f0f0f0] rounded my-[40px] mx-auto p-[20px] w-[465px]">
          <Img src={app.logoUrl} alt={app.name} className="my-8 mx-auto" />

          <Section>
            {children}

            <Hr className="border border-solid border-[#eaeaea] my-[20px] mx-0 w-full" />

            <Text className="my-0 text-center text-xs text-[#666666]">
              <span className="block">{app.name}</span>
            </Text>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  );
};

export default EmailLayout;
