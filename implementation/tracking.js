const EVENT_NAMES = new Set([
  "ad_click",
  "landing_page_view",
  "form_start",
  "generate_lead",
  "crm_lead_created",
  "qualification_complete",
  "follow_up_started",
  "booked_call",
  "closed_won"
]);

export function buildEvent(event, data = {}) {
  if (!EVENT_NAMES.has(event)) throw new Error(`Unsupported funnel event: ${event}`);

  return {
    event,
    event_id: data.event_id || crypto.randomUUID(),
    event_time: data.event_time || new Date().toISOString(),
    lead_id: data.lead_id || null,
    session_id: data.session_id || null,
    source: data.source || "google",
    medium: data.medium || "cpc",
    campaign: data.campaign || "roofing_search_atlanta",
    gclid: data.gclid || null,
    value: Number(data.value || 0),
    currency: data.currency || "USD",
    ...data
  };
}

export function pushToDataLayer(event, data = {}, target = globalThis.window) {
  const payload = buildEvent(event, data);
  if (target) {
    target.dataLayer = target.dataLayer || [];
    target.dataLayer.push(payload);
  }
  return payload;
}

export const funnelEvents = [...EVENT_NAMES];
