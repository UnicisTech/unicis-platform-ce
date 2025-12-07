import {
  Button,
  Container,
  Head,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import EmailLayout from './EmailLayout';
import app from '@/lib/app';

interface FleetEnrollEmailProps {
  teamName: string;
  enrollmentLink: string;
  subject: string;
}

export const FleetEnrollEmail = ({
  teamName,
  enrollmentLink,
  subject,
}: FleetEnrollEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <EmailLayout>
        <Text>
          You have been requested to enroll your device into Fleet for the{' '}
          {teamName} team on {app.name}.
        </Text>

        <Text>
          Fleet helps your team securely manage and monitor enrolled devices.
          Click the button below to start the enrollment process.
        </Text>

        <Container className="text-center">
          <Button href={enrollmentLink}>Enroll device</Button>
        </Container>

        <Text>
          If you didn’t expect this request, you can safely ignore this email.
        </Text>
      </EmailLayout>
    </Html>
  );
};

export default FleetEnrollEmail;
