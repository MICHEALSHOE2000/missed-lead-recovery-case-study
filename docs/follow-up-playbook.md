# Follow-up and booking playbook

The workflow starts only after valid contact details and channel-appropriate consent are stored. Messages use the business's approved templates, local time zone, quiet hours, and opt-out rules.

| Timing | Automation | Human task | Exit condition |
| --- | --- | --- | --- |
| 0–2 minutes | Confirm receipt and offer the booking link | Priority alert for Hot leads | Reply, booking, opt-out |
| 15 minutes | Remind the owner if untouched | Call and log the outcome | Contact attempt saved |
| 2 hours | Send one service-specific helpful prompt | Answer questions | Reply, booking, opt-out |
| Next business day | Send availability or proof point | Review Warm leads | Stage changes |
| Day 3 | Close the active sequence politely | Move to nurture if appropriate | Closed, nurture, opt-out |

## Example confirmation

> Thanks for requesting an estimate from NorthStar Exterior Services. We received your request and will contact you shortly. If you prefer, choose a time here: [booking link]. Reply STOP to opt out.

## Booking webhook

When a booking provider confirms an appointment, the protected workflow:

1. verifies the webhook signature;
2. finds the CRM record by `lead_id` or verified email/phone hash;
3. writes `booked_at`, booking ID, owner, and next action;
4. stops all active follow-up messages;
5. pushes `booked_call` with the original attribution; and
6. alerts the assigned salesperson with the lead summary.

## Revenue close-out

Only a CRM stage change to `Won`, made by an authorized user or verified billing/job system, creates `closed_won`. The event carries final value and currency, never a forecast. This is how the system connects the original ad click to actual revenue.
