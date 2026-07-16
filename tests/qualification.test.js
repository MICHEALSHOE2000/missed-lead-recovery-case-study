import assert from "node:assert/strict";
import test from "node:test";
import { qualificationPolicy, qualifyLead } from "../implementation/qualification.js";

test("routes a high-value urgent in-area lead to the priority queue", () => {
  const result = qualifyLead({
    service: "roof-replacement",
    urgency: "within-7-days",
    estimatedValue: 14000,
    inServiceArea: true,
    email: "demo@example.com",
    phone: "+1 555 010 1000"
  });

  assert.equal(result.score, 100);
  assert.equal(result.band, "Hot");
  assert.equal(result.route, "Priority sales queue");
});

test("routes a low-fit out-of-area inquiry to review", () => {
  const result = qualifyLead({
    service: "other",
    urgency: "researching",
    estimatedValue: 100,
    inServiceArea: false,
    email: "demo@example.com",
    phone: ""
  });

  assert.equal(result.score, 12);
  assert.equal(result.band, "Cold");
  assert.equal(result.route, "Nurture or manual review");
});

test("qualification policy excludes sensitive personal traits", () => {
  assert.deepEqual(qualificationPolicy.prohibitedInputs, ["race", "religion", "gender", "health", "disability"]);
});
