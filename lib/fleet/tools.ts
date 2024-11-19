// Please dont change logics here if not fully understoold 
// Author: Abdulsamad A | agastronics@gmail.com

interface OsqueryFlagsProps{
    [key: string]: boolean | string | number | undefined;
}

export const OSQUERY_ENTRY = ({
  secret,
  teamName,
  apiUrl,
  safe,
  isCopy = false,
  platform,
  flags
}: {
  secret: string;
  teamName: string;
  apiUrl: string;
  safe: boolean;
  isCopy?: boolean;
  platform: string;
  flags?: OsqueryFlagsProps;
  }) => {
  const filePrefix = teamName.trim().replace(' ', '-').toLowerCase();
  const secretPath = `${filePrefix}_enroll_secret.txt`;

  const createSecretFile = `echo ${safe && !isCopy ? '*'.repeat(secret.length) : `'${secret}'`} > ${secretPath}`;
  const agent = platform === 'windows' ? `osqueryd.exe` : `sudo osqueryd`

  let osqueryCommand = `${createSecretFile} && ${agent} \
    --pidfile=/tmp/${filePrefix}-osquery.pid \
    --host_identifier=uuid \
    --database_path=/tmp/${filePrefix}-osquery.db \
    --config_plugin=tls \
    --config_tls_endpoint=/api/config \
    --config_tls_refresh=10 \
    --config_tls_max_attempts=3 \
    --enroll_tls_endpoint=/api/enrollment \
    --enroll_secret_path=./${secretPath} \
    --disable_distributed=false \
    --distributed_plugin=tls \
    --distributed_interval=10 \
    --distributed_tls_max_attempts=3 \
    --distributed_tls_read_endpoint=/api/distributed/read \
    --distributed_tls_write_endpoint=/api/distributed/write \
    --logger_plugin=tls \
    --logger_tls_endpoint=/api/logger \
    --logger_tls_period=5 \
    --tls_hostname=${apiUrl} \
    --pack_delimiter=/ \
    --utc \
    --verbose \
    --enroll_always &
  `;

  if (flags) {
    const flagEntries = Object.entries(flags);

    const addedFlags = new Set<string>();

    flagEntries.forEach(([key, value]) => {
      if (value && !addedFlags.has(key)) {
        osqueryCommand += ` --${key}=${value}`;
        addedFlags.add(key);
      }
      else if (!value && !addedFlags.has(key)) {
        osqueryCommand += ` --${key}`;
        addedFlags.add(key);
      }
    });
  }

  return osqueryCommand;
};


export const platformIcons = {
  linux: "uim:linux",
  windows: "uim:windows",
  apple: "uim:apple",
};