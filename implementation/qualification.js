const SERVICE_SCORES = Object.freeze({
  "roof-replacement": 30,
  "gutter-installation": 24,
  "roof-repair": 20,
  inspection: 12,
  other: 5
});

const URGENCY_SCORES = Object.freeze({
  "within-7-days": 25,
  "within-30-days": 18,
  "this-quarter": 10,
  researching: 3
});

function moneyScore(value) {
  const amount = Number(value || 0);
  if (amount >= 10000) return 25;
  if (amount >= 5000) return 20;
  if (amount >= 2000) return 14;
  if (amount >= 500) return 8;
  return 2;
}

export function qualifyLead(lead) {
  const factors = {
    serviceFit: SERVICE_SCORES[lead.service] ?? 5,
    urgency: URGENCY_SCORES[lead.urgency] ?? 3,
    estimatedValue: moneyScore(lead.estimatedValue),
    serviceArea: lead.inServiceArea ? 15 : 0,
    contactability: lead.email && lead.phone ? 5 : 2
  };

  const score = Object.values(factors).reduce((total, value) => total + value, 0);
  const band = score >= 75 ? "Hot" : score >= 50 ? "Warm" : "Cold";
  const route = band === "Hot" ? "Priority sales queue" : band === "Warm" ? "Standard sales queue" : "Nurture or manual review";

  return {
    score,
    band,
    route,
    factors,
    summary: `${band} lead: ${lead.service.replaceAll("-", " ")}, ${lead.urgency.replaceAll("-", " ")}, estimated at $${Number(lead.estimatedValue || 0).toLocaleString("en-US")}.`
  };
}

export const qualificationPolicy = {
  version: "2.0",
  maxScore: 100,
  requiresHumanReview: ["Cold"],
  prohibitedInputs: ["race", "religion", "gender", "health", "disability"],
  rule: "AI may summarize and prioritize business fit; a human owns final disposition."
};
