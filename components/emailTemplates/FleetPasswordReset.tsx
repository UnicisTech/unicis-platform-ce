import app from '@/lib/app';
import {
  Button,
  Container,
  Head,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import EmailLayout from './EmailLayout';
import fleetMessages from '@/locales/en/fleet.json';

interface FleetPasswordResetEmailProps {
  url: string;
  subject: string;
  email: string;
}

const FleetPasswordResetEmail = ({
  url,
  subject,
  email,
}: FleetPasswordResetEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <EmailLayout>
        <Text>
          {fleetMessages['fleet-password-reset-email-request-prefix']}{' '}
          {app.name}{' '}
          {fleetMessages['fleet-password-reset-email-request-suffix']} {email}.
        </Text>
        <Container className="text-center">
          <Button href={url}>
            {fleetMessages['fleet-reset-password-link']}
          </Button>
        </Container>
        <Text>{fleetMessages['fleet-password-reset-email-ignore']}</Text>
        <Text>{fleetMessages['fleet-password-reset-email-expiry']}</Text>
      </EmailLayout>
    </Html>
  );
};

export default FleetPasswordResetEmail;
