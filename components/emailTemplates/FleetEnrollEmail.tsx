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
  subject: string;
  teamName: string;
  enrollLink: string;
  tempPassword: string;
}

const FleetEnrollEmail = ({
  subject,
  teamName,
  enrollLink,
  tempPassword,
}: FleetEnrollEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <EmailLayout>
        <Text>
          You&apos;ve been invited to enroll Fleet access for team{' '}
          <b>{teamName}</b> on {app.name}.
        </Text>

        <Text>
          A temporary Fleet password has been generated for you:
        </Text>

        <Container className="text-center">
          <Text
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              letterSpacing: '0.5px',
            }}
          >
            {tempPassword}
          </Text>
        </Container>

        <Text>
          Use this password to complete enrollment. After your first login,
          you will be asked to set a new password.
        </Text>

        <Container className="text-center">
          <Button href={enrollLink}>Open Asset module</Button>
        </Container>

        <Text>
          If you didn&apos;t expect this email, you can ignore it.
        </Text>
      </EmailLayout>
    </Html>
  );
};

export default FleetEnrollEmail;
