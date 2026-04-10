type QueryResult<T = any> = {
  rows: T[];
  rowCount?: number;
};

type QueryHandler = (
  sql: string,
  params: unknown[],
) => QueryResult | Promise<QueryResult>;

export function normalizeSql(sql: string): string {
  return sql.replace(/\s+/g, ' ').trim().toLowerCase();
}

export function createMockPgPool(handler: QueryHandler) {
  const run = async (sql: string, params: unknown[] = []) => {
    const result = await handler(sql, params);
    return {
      rows: result.rows,
      rowCount: result.rowCount ?? result.rows.length,
    };
  };

  const client = {
    query: jest.fn(run),
    release: jest.fn(),
  };

  return {
    query: jest.fn(run),
    connect: jest.fn(async () => client),
    end: jest.fn(),
    on: jest.fn(),
    __client: client,
  };
}
