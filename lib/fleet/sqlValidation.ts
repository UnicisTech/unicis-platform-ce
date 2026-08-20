import { Parser } from 'node-sql-parser';

const parser = new Parser();

type FleetSqlValidationErrorKey =
  | 'fleet:sql-query-required'
  | 'fleet:sql-query-invalid-syntax'
  | 'fleet:sql-query-single-statement-only'
  | 'fleet:sql-query-select-only';

type FleetSqlValidationResult =
  | { valid: true }
  | { valid: false; messageKey: FleetSqlValidationErrorKey };

type SqlStatement = {
  type?: string;
};

const toStatements = (ast: unknown): SqlStatement[] => {
  if (Array.isArray(ast)) {
    return ast as SqlStatement[];
  }

  return [ast as SqlStatement];
};

export const validateFleetSqlQuery = (
  sql: string
): FleetSqlValidationResult => {
  if (!sql.trim()) {
    return { valid: false, messageKey: 'fleet:sql-query-required' };
  }

  try {
    const ast = parser.astify(sql, { database: 'SQLite' });
    const statements = toStatements(ast);

    if (statements.length !== 1) {
      return {
        valid: false,
        messageKey: 'fleet:sql-query-single-statement-only',
      };
    }

    if (statements[0]?.type !== 'select') {
      return { valid: false, messageKey: 'fleet:sql-query-select-only' };
    }

    return { valid: true };
  } catch {
    return { valid: false, messageKey: 'fleet:sql-query-invalid-syntax' };
  }
};
