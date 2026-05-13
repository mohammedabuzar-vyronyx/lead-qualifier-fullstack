/**
 * Manually trigger a lead qualification run against trigger.dev.
 * Usage: TRIGGER_SECRET_KEY=tr_dev_... npx ts-node tools/scripts/test-lead.ts
 *
 * Requires the trigger.dev dev server to be running: cd backend && npm run dev
 */
import { tasks } from "@trigger.dev/sdk/v3";
import type { Lead, QualificationResult } from "../../backend/src/trigger/qualify-lead.js";

const testLead: Lead = {
  name: "Jane Smith",
  email: "jane.smith@acmecorp.com",
  company: "Acme Corp",
  role: "VP of Marketing",
  budget: "$10k–$20k/mo",
};

async function main() {
  console.log("Triggering qualification for:", testLead.name);

  const result = await tasks.triggerAndWait<QualificationResult>("qualify-lead", testLead);

  if (result.ok) {
    console.log("\nResult:");
    console.log(JSON.stringify(result.output, null, 2));
  } else {
    console.error("Task failed:", result.error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
