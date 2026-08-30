import { getOsqueryEnrollCommand } from '@/lib/fleet/tools';

const commandOptions = {
  secret: 'FLEET_TEST_SECRET',
  teamName: 'Fleet Test Team',
  apiUrl: 'fleet.example.test',
  platform: 'linux-deb' as const,
};

describe('Fleet enrollment command', () => {
  it('masks the secret in previews but includes it in copy output', () => {
    const preview = getOsqueryEnrollCommand({
      ...commandOptions,
      safe: true,
    });
    const copyOutput = getOsqueryEnrollCommand({
      ...commandOptions,
      safe: true,
      isCopy: true,
    });

    expect(preview).not.toContain(commandOptions.secret);
    expect(preview).toContain('*'.repeat(commandOptions.secret.length));
    expect(copyOutput).toContain(commandOptions.secret);
  });
});
