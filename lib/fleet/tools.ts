export const OSQUERY_ENTRY = ({ secret, teamName, apiUrl, safe, isCopy=false }: {secret: string, teamName: string, apiUrl: string, safe: boolean, isCopy?: boolean}) => `
    sudo osqueryd 
        --pidfile=/tmp/${teamName}-osquery.pid
        --host_identifier=uuid
        --database_path=/tmp/${teamName}-osquery.db
        --config_plugin=tls
        --config_tls_endpoint=/api/config
        --config_tls_refresh=10
        --config_tls_max_attempts=3
        --enroll_tls_endpoint=/api/enrollment
        --enroll_secret=${safe && !isCopy ? '**************************************' : secret}
        --disable_distributed=false
        --distributed_plugin=tls
        --distributed_interval=10
        --distributed_tls_max_attempts=3
        --distributed_tls_read_endpoint=/api/distributed/read
        --distributed_tls_write_endpoint=/api/distributed/write
        --logger_plugin=tls
        --logger_tls_endpoint=/api/logger
        --logger_tls_period=5
        --tls_hostname=${apiUrl}
        --tls_server_certs=~/ca-cert.pem
        --log_result_events=false
        --pack_delimiter=/
        --utc
        --verbose
        --enroll_always
    `;


export const FLEET_ASSET_MAKER = ({ secret, teamName, apiUrl, safe, isCopy = false, platform }: { secret: string, teamName: string, apiUrl: string, safe: boolean, isCopy?: boolean, platform: string }) => `
fleetcli --enroll-secret=${safe && !isCopy ? '**************************************' : secret}
`;