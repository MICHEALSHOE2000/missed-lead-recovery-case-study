import assert from "node:assert/strict";
import test from "node:test";
import { buildEvent, funnelEvents, pushToDataLayer } from "../implementation/tracking.js";

test("creates an attribution-ready lead event", () => {
  const event = buildEvent("generate_lead", {
    event_id: "evt-001",
    lead_id: "lead-001",
    session_id: "session-001",
    gclid: "demo-gclid",
    value: 850
  });

  assert.equal(event.event, "generate_lead");
  assert.equal(event.currency, "USD");
  assert.equal(event.value, 850);
  assert.equal(event.gclid, "demo-gclid");
});

test("pushes the payload to a GTM-compatible dataLayer", () => {
  const target = { dataLayer: [] };
  pushToDataLayer("booked_call", { event_id: "evt-002", lead_id: "lead-001" }, target);
  assert.equal(target.dataLayer.length, 1);
  assert.equal(target.dataLayer[0].event, "booked_call");
});

test("documents all nine funnel events", () => {
  assert.equal(funnelEvents.length, 9);
  assert.throws(() => buildEvent("unknown_event"), /Unsupported funnel event/);
});
