# GA4 + GTM tracking plan

The browser pushes one normalized object into `dataLayer`. GTM reads the object, adds consent and environment rules, and sends approved events to GA4. Server-side CRM events use the same `event_id` so browser and server records can be reconciled without double-counting.

## Funnel events

| Event | Trigger | GA4 destination | CRM effect | Required identifiers |
| --- | --- | --- | --- | --- |
| `ad_click` | Demo session begins with campaign parameters | Optional diagnostic | None | `session_id`, campaign, `gclid` |
| `landing_page_view` | Landing page loads | Page/event | None | `session_id`, page, campaign |
| `form_start` | First form interaction | Event | None | `session_id` |
| `generate_lead` | Valid consented form submission | Key event | Create pending record | `event_id`, `lead_id`, `session_id` |
| `crm_lead_created` | CRM accepts an idempotent record | Server event | Assign owner and SLA | `event_id`, `lead_id` |
| `qualification_complete` | Scoring output saved | Server event | Set score, band, reason, route | `lead_id`, policy version |
| `follow_up_started` | Approved sequence begins | Server event | Set next action and status | `lead_id`, sequence version |
| `booked_call` | Booking webhook is verified | Key event | Move to Booked Call | `lead_id`, booking ID |
| `closed_won` | Opportunity is marked won | Recommended ecommerce-style event | Save final revenue | `lead_id`, value, currency |

## Example `dataLayer` object

```js
window.dataLayer.push({
  event: "generate_lead",
  event_id: "evt_01J2EXAMPLE",
  event_time: "2026-07-16T08:00:00.000Z",
  lead_id: "lead_01J2EXAMPLE",
  session_id: "session_01J2EXAMPLE",
  source: "google",
  medium: "cpc",
  campaign: "roofing_search_atlanta",
  gclid: "demo-gclid",
  service: "roof-replacement",
  value: 14000,
  currency: "USD",
  consent_status: "granted"
});
```

## GTM configuration

1. Create data-layer variables for identifiers, attribution, service, value, currency, and consent status.
2. Create a custom-event trigger for each approved funnel event.
3. Map browser events to a GA4 event tag and send `event_id` as an event parameter.
4. Gate marketing tags behind the configured consent state.
5. Keep PII such as email and phone out of GA4 and the browser event log.
6. Send CRM-only events through a protected server workflow and reconcile by `lead_id` and `event_id`.

## QA checklist

- GTM Preview shows one tag per event.
- GA4 DebugView receives the correct event names and parameters.
- UTM and `gclid` values survive the landing-page-to-CRM handoff.
- Duplicate webhooks do not create duplicate CRM records or conversions.
- Booking and closed-revenue timestamps match the CRM audit trail.
- No email, phone number, or free-text message is sent to analytics.
