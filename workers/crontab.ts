export const crontab = `
# Graphile Worker crontab (UTC)
*/15 * * * * task-recurrence-generate
0 0 * * * task-due-check
`;
