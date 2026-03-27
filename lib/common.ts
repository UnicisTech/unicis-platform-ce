import { enc, lib } from 'crypto-js';
import type { NextApiRequest } from 'next';

export const createRandomString = (length = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;

  let string = '';

  for (let i = 0; i < length; i++) {
    string += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return string;
};

// Create token
export function generateToken(length = 64) {
  const tokenBytes = lib.WordArray.random(length);

  return enc.Base64.stringify(tokenBytes);
}

export const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

// Fetch the auth token from the request headers
export const extractAuthToken = (req: NextApiRequest): string | null => {
  const authHeader = req.headers.authorization || null;

  return authHeader ? authHeader.split(' ')[1] : null;
};

export const domainRegex =
  /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/;

export const isValidDomain = (domain: string): boolean => {
  return domainRegex.test(domain);
};

export const validateDomain = (domain: string): boolean => {
  return domainRegex.test(domain);
};

export const validateEmail = (email: string): boolean => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

// TODO: combine this logic with validatePassword function
export const passwordPolicies = {
  minLength: 8,
};

export const validatePassword = (password: string): boolean => {
  // Password should be at least 8 characters long
  if (password.length < 8) {
    return false;
  }

  // Password should have at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return false;
  }

  // Password should have at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return false;
  }

  // Password should have at least one number
  if (!/\d/.test(password)) {
    return false;
  }

  // Password should have at least one special character
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return false;
  }

  return true;
};

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export const defaultHeaders = {
  'Content-Type': 'application/json',
};

export const authErrorKeyMap: Record<string, string> = {
  'invalid-credentials': 'errors.invalidCredentials',
  'token-not-found': 'errors.tokenInvalid',
  'confirm-your-email': 'errors.confirmYourEmail',
  'email-login-error': 'errors.emailLogin',
  'invitation-error-accepting': 'errors.invitationAccepting',
  'access-denied': 'errors.accessDenied',
};

export const getAuthErrorKey = (key?: string | null) =>
  key ? authErrorKeyMap[key] ?? key : 'errors.unknown';

// List of events used to create webhook endpoint
export const eventTypes = [
  'member.created',
  'member.removed',
  'invitation.created',
  'invitation.removed',
  'task.created',
  'task.updated',
  'task.commented',
  'task.deleted',
  'task.due',
];

export const maxLengthPolicies = {
  name: 104,
  nameShortDisplay: 20,
  email: 254,
  password: 70,
  team: 50,
  slug: 50,
  domain: 253,
  domains: 1024,
  apiKeyName: 64,
  webhookDescription: 100,
  webhookEndpoint: 2083,
  memberId: 64,
  eventType: 50,
  eventTypes: eventTypes.length,
  endpointId: 64,
  inviteToken: 64,
  expiredToken: 64,
  invitationId: 64,
  sendViaEmail: 10,
};

export const countries = [
  'andorra',
  'united arab emirates',
  'afghanistan',
  'antigua and barbuda',
  'anguilla',
  'albania',
  'armenia',
  'netherlands antilles',
  'angola',
  'antarctica',
  'argentina',
  'american samoa',
  'austria',
  'australia',
  'aruba',
  'azerbaijan',
  'bosnia and herzegovina',
  'barbados',
  'bangladesh',
  'belgium',
  'burkina faso',
  'bulgaria',
  'bahrain',
  'burundi',
  'benin',
  'bermuda',
  'brunei',
  'bolivia',
  'brazil',
  'bahamas',
  'bhutan',
  'bouvet island',
  'botswana',
  'belarus',
  'belize',
  'canada',
  'cocos [keeling] islands',
  'congo [drc]',
  'central african republic',
  'congo [republic]',
  'switzerland',
  "côte d'ivoire",
  'cook islands',
  'chile',
  'cameroon',
  'china',
  'colombia',
  'costa rica',
  'cuba',
  'cape verde',
  'christmas island',
  'cyprus',
  'czech republic',
  'germany',
  'djibouti',
  'denmark',
  'dominica',
  'dominican republic',
  'algeria',
  'ecuador',
  'estonia',
  'egypt',
  'western sahara',
  'eritrea',
  'spain',
  'ethiopia',
  'finland',
  'fiji',
  'falkland islands [islas malvinas]',
  'micronesia',
  'faroe islands',
  'france',
  'gabon',
  'united kingdom',
  'grenada',
  'georgia',
  'french guiana',
  'guernsey',
  'ghana',
  'gibraltar',
  'greenland',
  'gambia',
  'guinea',
  'guadeloupe',
  'equatorial guinea',
  'greece',
  'south georgia and the south sandwich islands',
  'guatemala',
  'guam',
  'guinea-bissau',
  'guyana',
  'gaza strip',
  'hong kong',
  'heard island and mcdonald islands',
  'honduras',
  'croatia',
  'haiti',
  'hungary',
  'indonesia',
  'ireland',
  'israel',
  'isle of man',
  'india',
  'british indian ocean territory',
  'iraq',
  'iran',
  'iceland',
  'italy',
  'jersey',
  'jamaica',
  'jordan',
  'japan',
  'kenya',
  'kyrgyzstan',
  'cambodia',
  'kiribati',
  'comoros',
  'saint kitts and nevis',
  'north korea',
  'south korea',
  'kuwait',
  'cayman islands',
  'kazakhstan',
  'laos',
  'lebanon',
  'saint lucia',
  'liechtenstein',
  'sri lanka',
  'liberia',
  'lesotho',
  'lithuania',
  'luxembourg',
  'latvia',
  'libya',
  'morocco',
  'monaco',
  'moldova',
  'montenegro',
  'madagascar',
  'marshall islands',
  'macedonia',
  'mali',
  'myanmar [burma]',
  'mongolia',
  'macau',
  'northern mariana islands',
  'martinique',
  'mauritania',
  'montserrat',
  'malta',
  'mauritius',
  'maldives',
  'malawi',
  'mexico',
  'malaysia',
  'mozambique',
  'namibia',
  'new caledonia',
  'niger',
  'norfolk island',
  'nigeria',
  'nicaragua',
  'netherlands',
  'norway',
  'nepal',
  'nauru',
  'niue',
  'new zealand',
  'oman',
  'panama',
  'peru',
  'french polynesia',
  'papua new guinea',
  'philippines',
  'pakistan',
  'poland',
  'saint pierre and miquelon',
  'pitcairn islands',
  'puerto rico',
  'palestinian territories',
  'portugal',
  'palau',
  'paraguay',
  'qatar',
  'réunion',
  'romania',
  'serbia',
  'russia',
  'rwanda',
  'saudi arabia',
  'solomon islands',
  'seychelles',
  'sudan',
  'sweden',
  'singapore',
  'saint helena',
  'slovenia',
  'svalbard and jan mayen',
  'slovakia',
  'sierra leone',
  'san marino',
  'senegal',
  'somalia',
  'suriname',
  'são tomé and príncipe',
  'el salvador',
  'syria',
  'swaziland',
  'turks and caicos islands',
  'chad',
  'french southern territories',
  'togo',
  'thailand',
  'tajikistan',
  'tokelau',
  'timor-leste',
  'turkmenistan',
  'tunisia',
  'tonga',
  'turkey',
  'trinidad and tobago',
  'tuvalu',
  'taiwan',
  'tanzania',
  'ukraine',
  'uganda',
  'u.s. minor outlying islands',
  'united states',
  'uruguay',
  'uzbekistan',
  'vatican city',
  'saint vincent and the grenadines',
  'venezuela',
  'british virgin islands',
  'u.s. virgin islands',
  'vietnam',
  'vanuatu',
  'wallis and futuna',
  'samoa',
  'kosovo',
  'yemen',
  'mayotte',
  'south africa',
  'zambia',
  'zimbabwe',
  'other',
];

export const impactLabelKeys = [
  'chart-risk-impact.insignificant',
  'chart-risk-impact.minor',
  'chart-risk-impact.moderate',
  'chart-risk-impact.major',
  'chart-risk-impact.extreme',
];

export const probabilityLabelKeys = [
  'chart-risk-probability.rare',
  'chart-risk-probability.unlikely',
  'chart-risk-probability.possible',
  'chart-risk-probability.probable',
  'chart-risk-probability.almost-certian',
];

export const riskValueToLabelKey = (value: number): string => {
  const riskLevels = [
    { max: 20, label: 'chart-risk-impact.insignificant' },
    { max: 40, label: 'chart-risk-impact.minor' },
    { max: 60, label: 'chart-risk-impact.moderate' },
    { max: 80, label: 'chart-risk-impact.major' },
    { max: 100, label: 'chart-risk-impact.extreme' },
  ];

  for (const { max, label: riskLabel } of riskLevels) {
    if (value <= max) {
      return riskLabel;
    }
  }

  return '';
};
