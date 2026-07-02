// Please dont change logics here if not fully understoold
// Author: Abdulsamad A | agastronics@gmail.com

interface OsqueryFlagsProps {
  [key: string]: boolean | string | number | undefined;
}

export type OsqueryPlatform =
  | 'windows'
  | 'macos'
  | 'linux-deb'
  | 'linux-rpm'
  | 'advanced';

const shellEscape = (value: string) => `'${value.replace(/'/g, `'\"'\"'`)}'`;

const powershellEscape = (value: string) => value.replace(/'/g, `''`);

const appendFlags = (command: string, flags?: OsqueryFlagsProps) => {
  if (!flags) {
    return command;
  }

  const addedFlags = new Set<string>();
  let nextCommand = command;

  Object.entries(flags).forEach(([key, value]) => {
    if (addedFlags.has(key)) {
      return;
    }

    if (typeof value === 'boolean') {
      if (value) {
        nextCommand += ` --${key}`;
      }
    } else if (value !== undefined) {
      nextCommand += ` --${key}=${value}`;
    }

    addedFlags.add(key);
  });

  return nextCommand;
};

const createCommonFlags = ({
  apiUrl,
  pidfile,
  databasePath,
  secretPath,
  tlsServerCerts,
}: {
  apiUrl: string;
  pidfile: string;
  databasePath: string;
  secretPath: string;
  tlsServerCerts?: string;
}) => {
  const flags = [
    `--pidfile=${pidfile}`,
    '--host_identifier=uuid',
    `--database_path=${databasePath}`,
    '--config_plugin=tls',
    '--config_tls_endpoint=/api/config',
    '--config_tls_refresh=10',
    '--config_tls_max_attempts=3',
    '--enroll_tls_endpoint=/api/enrollment',
    `--enroll_secret_path=${secretPath}`,
    '--disable_distributed=false',
    '--distributed_plugin=tls',
    '--distributed_interval=10',
    '--distributed_tls_max_attempts=3',
    '--distributed_tls_read_endpoint=/api/distributed/read',
    '--distributed_tls_write_endpoint=/api/distributed/write',
    '--logger_plugin=tls',
    '--logger_tls_endpoint=/api/logger',
    '--logger_tls_period=5',
    `--tls_hostname=${apiUrl}`,
    '--pack_delimiter=/',
    '--utc',
    '--verbose',
    '--enroll_always',
  ];

  if (tlsServerCerts) {
    flags.push(`--tls_server_certs=${tlsServerCerts}`);
  }

  return flags;
};

export const getOsqueryReleaseUrl = (
  platform: OsqueryPlatform,
  version: string
) => {
  switch (platform) {
    case 'windows':
      return `https://github.com/osquery/osquery/releases/download/${version}/osquery-${version}.msi`;
    case 'linux-deb':
      return `https://github.com/osquery/osquery/releases/download/${version}/osquery_${version}-1.linux_amd64.deb`;
    case 'linux-rpm':
      return `https://github.com/osquery/osquery/releases/download/${version}/osquery-${version}-1.linux.x86_64.rpm`;
    case 'advanced':
      return `https://github.com/osquery/osquery/releases/tag/${version}`;
    case 'macos':
    default:
      return `https://github.com/osquery/osquery/releases/tag/${version}`;
  }
};

export const getOsqueryInstallCommand = (
  platform: OsqueryPlatform,
  version: string
) => {
  const downloadUrl = getOsqueryReleaseUrl(platform, version);

  switch (platform) {
    case 'windows':
      return [
        `$installer = Join-Path $env:TEMP "osquery-${version}.msi"`,
        `Invoke-WebRequest -Uri "${downloadUrl}" -OutFile $installer`,
        `Start-Process msiexec.exe -Wait -ArgumentList '/i', $installer, '/qn'`,
      ].join('\n');
    case 'linux-deb':
      return [
        `curl -fsSL "${downloadUrl}" -o /tmp/osquery-${version}.deb`,
        `sudo dpkg -i /tmp/osquery-${version}.deb`,
      ].join('\n');
    case 'linux-rpm':
      return [
        `curl -fsSL "${downloadUrl}" -o /tmp/osquery-${version}.rpm`,
        `sudo rpm -i /tmp/osquery-${version}.rpm`,
      ].join('\n');
    case 'advanced':
      return `Download the correct osquery package for your OS from ${downloadUrl}`;
    case 'macos':
    default:
      return 'brew install --cask osquery';
  }
};

export const getOsqueryEnrollCommand = ({
  secret,
  teamName,
  apiUrl,
  safe,
  isCopy = false,
  platform,
  tlsServerCerts,
  flags,
}: {
  secret: string;
  teamName: string;
  apiUrl: string;
  safe: boolean;
  isCopy?: boolean;
  platform: OsqueryPlatform;
  tlsServerCerts?: string;
  flags?: OsqueryFlagsProps;
}) => {
  const filePrefix = teamName.trim().replace(/\s+/g, '-').toLowerCase();

  if (platform === 'windows') {
    const secretPath = `.${'\\'}${filePrefix}_enroll_secret.txt`;
    const escapedSecret =
      safe && !isCopy ? '*'.repeat(secret.length) : powershellEscape(secret);
    const flagsList = createCommonFlags({
      apiUrl,
      pidfile: `$env:TEMP\\${filePrefix}-osquery.pid`,
      databasePath: `$env:TEMP\\${filePrefix}-osquery.db`,
      secretPath,
      tlsServerCerts,
    });

    let osqueryCommand = [
      `$secretPath = "${secretPath}"`,
      `Set-Content -Path $secretPath -Value '${escapedSecret}'`,
      `$osqueryd = "$env:ProgramFiles\\osquery\\osqueryd\\osqueryd.exe"`,
      `& $osqueryd ${flagsList.join(' `\n  ')}`,
    ].join('\n');

    return appendFlags(osqueryCommand, flags);
  }

  const secretPath = `./${filePrefix}_enroll_secret.txt`;
  const escapedSecret =
    safe && !isCopy ? '*'.repeat(secret.length) : shellEscape(secret);
  const flagsList = createCommonFlags({
    apiUrl,
    pidfile: `/tmp/${filePrefix}-osquery.pid`,
    databasePath: `/tmp/${filePrefix}-osquery.db`,
    secretPath,
    tlsServerCerts,
  });

  let osqueryCommand = [
    `printf %s ${escapedSecret} > ${secretPath}`,
    `sudo osqueryd \\`,
    ...flagsList.map((flag, index) => {
      const suffix = index === flagsList.length - 1 ? '' : ' \\';

      return `  ${flag}${suffix}`;
    }),
  ].join('\n');

  return appendFlags(osqueryCommand, flags);
};

export const OSQUERY_ENTRY = getOsqueryEnrollCommand;

export const platformIcons = {
  linux: 'uim:linux',
  windows: 'uim:windows',
  apple: 'uim:apple',
};
