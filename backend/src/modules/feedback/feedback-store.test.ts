import assert from "node:assert/strict";
import test from "node:test";

import Database from "better-sqlite3";

import { createFeedbackStore } from "./feedback-store.js";

test("stores a user-reported response without saving unrelated conversation data", () => {
  const database = new Database(":memory:");
  const store = createFeedbackStore(database);

  const reportId = store.saveResponseReport({
    category: "incorrect",
    response: "Resposta sinalizada",
    details: "A norma citada parece desatualizada.",
  });
  const saved = database
    .prepare(
      "SELECT category, response, details FROM ai_response_reports WHERE id = ?"
    )
    .get(reportId);

  assert.deepEqual(saved, {
    category: "incorrect",
    response: "Resposta sinalizada",
    details: "A norma citada parece desatualizada.",
  });
  database.close();
});

test("purges reports older than the retention window", () => {
  const database = new Database(":memory:");
  const store = createFeedbackStore(database);
  database
    .prepare(
      `INSERT INTO ai_response_reports (category, response, created_at)
       VALUES ('other', 'Expirada', '2000-01-01T00:00:00.000Z')`
    )
    .run();

  store.purgeExpiredReports();

  const remaining = database
    .prepare("SELECT COUNT(*) AS count FROM ai_response_reports")
    .get();
  assert.deepEqual(remaining, { count: 0 });
  database.close();
});
