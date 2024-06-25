import { Head, Html, Preview, Text } from '@react-email/components';
import EmailLayout from './EmailLayout';
import { Team } from '@prisma/client';

interface SubscriptionRequestProps {
  companyName: string;
  address: string;
  zipCode: string;
  country: string;
  vatId: string;
  email: string;
  team: Team;
  subscription: string;
}

const SubscriptionRequest = ({
  companyName,
  address,
  zipCode,
  country,
  vatId,
  email,
  team,
  subscription,
}: SubscriptionRequestProps) => {
  return (
    <Html>
      <Head />
      <Preview>Subscription Request</Preview>
      <EmailLayout>
        <Text>Company name: {companyName}</Text>
        <Text>Address: {address}</Text>
        <Text>ZIP Code: {zipCode}</Text>
        <Text>Country: {country}</Text>
        <Text>VAT ID: {vatId}</Text>
        <Text>Email: {email}</Text>
        <Text>Team name: {team.name}</Text>
        <Text>Subscription plan: {subscription}</Text>
      </EmailLayout>
    </Html>
  );
};

export default SubscriptionRequest;
