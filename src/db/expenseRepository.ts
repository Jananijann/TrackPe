import { open, type DB } from '@op-engineering/op-sqlite';

import type { ParsedNotificationExpense } from '@/types/expense';

const DB_NAME = 'trackpe.sqlite';
const EXPENSE_TABLE = 'expenses';

let db: DB | null = null;
let isInitialized = false;

const getDatabase = (): DB => {
  if (db) {
    return db;
  }

  db = open({ name: DB_NAME });
  return db;
};

const toStringField = (value: unknown): string => (typeof value === 'string' ? value : '');
const toNumberField = (value: unknown): number => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const mapExpenseRow = (row: Record<string, unknown>): ParsedNotificationExpense => ({
  amount: toNumberField(row.amount),
  createdAt: toNumberField(row.createdAt),
  id: toStringField(row.id),
  merchant: toStringField(row.merchant),
  packageName: toStringField(row.packageName),
  sourceLabel: toStringField(row.sourceLabel),
  title: toStringField(row.title),
});

export const initializeExpenseRepository = async (): Promise<void> => {
  if (isInitialized) {
    return;
  }

  const database = getDatabase();
  await database.execute(
    `CREATE TABLE IF NOT EXISTS ${EXPENSE_TABLE} (
      id TEXT PRIMARY KEY NOT NULL,
      amount REAL NOT NULL,
      createdAt INTEGER NOT NULL,
      merchant TEXT NOT NULL,
      packageName TEXT NOT NULL,
      sourceLabel TEXT NOT NULL,
      title TEXT NOT NULL
    )`,
  );

  isInitialized = true;
};

export const upsertExpense = async (expense: ParsedNotificationExpense): Promise<void> => {
  await initializeExpenseRepository();
  const database = getDatabase();

  await database.execute(
    `INSERT OR REPLACE INTO ${EXPENSE_TABLE}
      (id, amount, createdAt, merchant, packageName, sourceLabel, title)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      expense.id,
      expense.amount,
      expense.createdAt,
      expense.merchant,
      expense.packageName,
      expense.sourceLabel,
      expense.title,
    ],
  );
};

export const listExpenses = async (): Promise<ParsedNotificationExpense[]> => {
  await initializeExpenseRepository();
  const database = getDatabase();

  const result = await database.execute(
    `SELECT id, amount, createdAt, merchant, packageName, sourceLabel, title
      FROM ${EXPENSE_TABLE}
      ORDER BY createdAt DESC, id DESC`,
  );

  return result.rows.map(row => mapExpenseRow(row as Record<string, unknown>));
};
