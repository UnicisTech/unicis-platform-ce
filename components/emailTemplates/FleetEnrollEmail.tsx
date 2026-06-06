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
import fleetMessages from '@/locales/en/fleet.json';

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
          {fleetMessages['fleet-enroll-email-invite-prefix']} <b>{teamName}</b>{' '}
          {fleetMessages['fleet-enroll-email-invite-suffix']} {app.name}.
        </Text>

        <Text>{fleetMessages['fleet-enroll-email-temp-password']}</Text>

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

        <Text>{fleetMessages['fleet-enroll-email-complete-enrollment']}</Text>

        <Container className="text-center">
          <Button href={enrollLink}>
            {fleetMessages['fleet-open-asset-module']}
          </Button>
        </Container>

        <Text>{fleetMessages['fleet-enroll-email-ignore']}</Text>
      </EmailLayout>
    </Html>
  );
};

export default FleetEnrollEmail;
