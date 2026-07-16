import { qualifyLead } from "./implementation/qualification.js";
import { pushToDataLayer } from "./implementation/tracking.js";

const form = document.querySelector("#lead-form");
const journey = document.querySelector("#journey");
const journeyList = document.querySelector("#journey-list");
const emptyState = document.querySelector("#empty-state");
const qualificationCard = document.querySelector("#qualification-card");
const crmOutput = document.querySelector("#crm-output");
const eventOutput = document.querySelector("#event-output");
const runId = document.querySelector("#run-id");
const runStatus = document.querySelector("#run-status");
const bookButton = document.querySelector("#book-call");
const wonButton = document.querySelector("#mark-won");
const resetButton = document.querySelector("#reset-demo");

const state = {
  events: [],
  crm: null,
  qualification: null,
  sessionId: `session_${crypto.randomUUID().slice(0, 8)}`
};

function event(name, extra = {}) {
  const payload = pushToDataLayer(name, {
    session_id: state.sessionId,
    lead_id: state.crm?.lead_id,
    gclid: "demo-gclid-2026",
    campaign: "roofing_search_atlanta",
    ...extra
  });
  state.events.push(payload);
  eventOutput.textContent = JSON.stringify(state.events, null, 2);
  return payload;
}

event("ad_click");
event("landing_page_view", { page: "/atlanta-roof-replacement" });

form.addEventListener("focusin", () => {
  if (!state.events.some((item) => item.event === "form_start")) event("form_start");
}, { once: true });

form.addEventListener("submit", (submitEvent) => {
  submitEvent.preventDefault();
  const data = new FormData(form);
  const leadId = `lead_${crypto.randomUUID().slice(0, 8)}`;
  const lead = {
    firstName: String(data.get("firstName")),
    email: String(data.get("email")),
    phone: String(data.get("phone")),
    service: String(data.get("service")),
    urgency: String(data.get("urgency")),
    estimatedValue: Number(data.get("estimatedValue")),
    inServiceArea: data.get("inServiceArea") === "on"
  };

  state.crm = {
    lead_id: leadId,
    created_at: new Date().toISOString(),
    contact: { first_name: lead.firstName, email: lead.email, phone: lead.phone },
    request: { service: lead.service, urgency: lead.urgency, estimated_value: lead.estimatedValue, in_service_area: lead.inServiceArea },
    attribution: { source: "google", medium: "cpc", campaign: "roofing_search_atlanta", gclid: "demo-gclid-2026", landing_page: "/atlanta-roof-replacement" },
    consent_status: "granted",
    owner: "Unassigned",
    stage: "New",
    next_action: "Qualify and route",
    follow_up_status: "Pending",
    booked_at: null,
    closed_revenue: 0
  };

  event("generate_lead", { lead_id: leadId, service: lead.service, value: lead.estimatedValue });
  event("crm_lead_created", { lead_id: leadId });

  state.qualification = qualifyLead(lead);
  Object.assign(state.crm, {
    qualification_score: state.qualification.score,
    qualification_band: state.qualification.band,
    qualification_reason: state.qualification.summary,
    owner: state.qualification.band === "Hot" ? "Senior estimator" : "Inside sales",
    stage: "Qualified",
    next_action: state.qualification.band === "Hot" ? "Call within 5 minutes" : "Review and contact"
  });
  event("qualification_complete", { lead_id: leadId, score: state.qualification.score, band: state.qualification.band, policy_version: "2.0" });
  state.crm.follow_up_status = "Active · confirmation queued";
  event("follow_up_started", { lead_id: leadId, sequence_version: "estimate-v2" });

  renderJourney();
  syncOutputs();
});

bookButton.addEventListener("click", () => {
  if (!state.crm || state.crm.booked_at) return;
  state.crm.booked_at = new Date().toISOString();
  state.crm.stage = "Booked Call";
  state.crm.next_action = "Prepare estimate call";
  state.crm.follow_up_status = "Stopped · booked";
  event("booked_call", { booking_id: `booking_${crypto.randomUUID().slice(0, 8)}` });
  bookButton.disabled = true;
  wonButton.disabled = false;
  renderJourney();
  syncOutputs();
});

wonButton.addEventListener("click", () => {
  if (!state.crm || state.crm.stage === "Won") return;
  const revenue = Number(state.crm.request.estimated_value || 0);
  state.crm.stage = "Won";
  state.crm.closed_at = new Date().toISOString();
  state.crm.closed_revenue = revenue;
  state.crm.next_action = "Onboarding / job handoff";
  event("closed_won", { value: revenue, currency: "USD" });
  wonButton.disabled = true;
  renderJourney();
  syncOutputs();
});

resetButton.addEventListener("click", () => window.location.reload());

document.querySelectorAll("[data-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach((item) => item.classList.toggle("active", item === button));
    document.querySelectorAll("[data-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === button.dataset.tab));
  });
});

function renderJourney() {
  emptyState.hidden = true;
  journey.hidden = false;
  runId.textContent = state.crm.lead_id;
  runStatus.textContent = state.crm.stage;
  runStatus.classList.add("running");

  const steps = [
    ["Ad + landing page", "Google CPC attribution and click ID retained"],
    ["GA4 / GTM", "generate_lead captured with shared identifiers"],
    ["CRM", `${state.crm.owner} assigned · ${state.crm.stage}`],
    ["AI qualification", `${state.qualification.band} · ${state.qualification.score}/100 · ${state.qualification.route}`],
    ["Follow-up", state.crm.follow_up_status],
    ["Booked call", state.crm.booked_at ? "Verified booking saved; sequence stopped" : "Waiting for booking"],
    ["Revenue", state.crm.closed_revenue ? `$${state.crm.closed_revenue.toLocaleString("en-US")} closed and attributed` : "Waiting for closed-won outcome"]
  ];

  journeyList.innerHTML = steps.map(([title, detail], index) => {
    const pending = (index === 5 && !state.crm.booked_at) || (index === 6 && !state.crm.closed_revenue);
    return `<li class="${pending ? "pending" : "done"}"><span>${pending ? index + 1 : "✓"}</span><div><strong>${title}</strong><p>${detail}</p></div></li>`;
  }).join("");

  qualificationCard.innerHTML = `<div><small>Qualification decision</small><strong>${state.qualification.band} · ${state.qualification.score}/100</strong><p>${state.qualification.summary}</p></div><span class="score-ring" style="--score:${state.qualification.score * 3.6}deg">${state.qualification.score}</span>`;
  bookButton.disabled = Boolean(state.crm.booked_at);
}

function syncOutputs() {
  crmOutput.textContent = JSON.stringify(state.crm, null, 2);
  eventOutput.textContent = JSON.stringify(state.events, null, 2);
}
