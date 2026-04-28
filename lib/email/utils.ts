import dns from 'dns';
import env from '../env';
import blockedDomains from './freeEmailService.json';

export const isBusinessEmail = (email: string) => {
  if (email.indexOf('@') > 0 && email.indexOf('@') < email.length - 3) {
    const emailDomain = email.split('@')[1];

    return !blockedDomains[emailDomain];
  }
};

export const isEmailAllowed = (email: string) => {
  if (!env.disableNonBusinessEmailSignup) {
    return true;
  }

  return isBusinessEmail(email);
};

export function extractEmailDomain(email: string) {
  return email.split('@')[1];
}

export function generateInvitationLink(token: string) {
  return `${env.appUrl}/invitations/${token}`;
}

// Resolves with true if the domain has at least one MX record, false otherwise.
// Times out after 5 s so a slow DNS server never hangs the request.
export async function hasActiveMxRecord(domain: string): Promise<boolean> {
  const timeout = new Promise<false>((resolve) =>
    setTimeout(() => resolve(false), 5000)
  );
  const lookup = dns.promises
    .resolveMx(domain)
    .then((records) => records.length > 0)
    .catch(() => false);

  return Promise.race([lookup, timeout]);
}

export async function validateEmailDomain(email: string): Promise<void> {
  const domain = email.split('@')[1];
  if (!domain) return;

  const valid = await hasActiveMxRecord(domain);
  if (!valid) {
    throw new Error('email-domain-invalid');
  }
}
