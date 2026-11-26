import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import Database from "better-sqlite3";

import { env } from "../../config/env.js";

export type FeedbackCategory = "incorrect" | "offensive" | "other";

export interface ResponseReport {
  category: FeedbackCategory;
  response: string;
  details?: string | undefined;
}

export function createFeedbackStore(database: Database.Database) {
  database.pragma("journal_mode = WAL");
  database.exec(`
    CREATE TABLE IF NOT EXISTS ai_response_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL CHECK (category IN ('incorrect', 'offensive', 'other')),
      response TEXT NOT NULL,
      details TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
  `);
  const purgeExpiredReports = () =>
    database
      .prepare(
        "DELETE FROM ai_response_reports WHERE julianday(created_at) < julianday('now', '-90 days')"
      )
      .run();
  purgeExpiredReports();

  const insertReport = database.prepare(
    `INSERT INTO ai_response_reports (category, response, details)
     VALUES (@category, @response, @details)`
  );

  return {
    purgeExpiredReports,
    saveResponseReport(report: ResponseReport): number {
      const result = insertReport.run({
        category: report.category,
        response: report.response,
        details: report.details ?? null,
      });

      return Number(result.lastInsertRowid);
    },
  };
}

let feedbackStore: ReturnType<typeof createFeedbackStore> | undefined;
let cleanupInterval: ReturnType<typeof setInterval> | undefined;

function getFeedbackStore() {
  if (!feedbackStore) {
    const databasePath = env.FEEDBACK_DATABASE_PATH;
    if (databasePath !== ":memory:") {
      mkdirSync(dirname(resolve(databasePath)), { recursive: true });
    }

    feedbackStore = createFeedbackStore(new Database(databasePath));
  }

  return feedbackStore;
}

export function saveResponseReport(report: ResponseReport): number {
  return getFeedbackStore().saveResponseReport(report);
}

export function initializeFeedbackStore(): void {
  const store = getFeedbackStore();
  if (!cleanupInterval) {
    cleanupInterval = setInterval(
      () => store.purgeExpiredReports(),
      24 * 60 * 60 * 1000
    );
    cleanupInterval.unref();
  }
}
