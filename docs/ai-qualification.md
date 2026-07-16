# AI qualification design

The qualification layer prioritizes business fit; it does not make irreversible decisions. A structured rules score creates the auditable baseline, while an AI step may summarize the inquiry and explain the route using only approved business inputs.

## Approved inputs

- requested service;
- urgency and preferred timeline;
- service-area match;
- estimated job value or budget band;
- contact completeness; and
- relevant free-text project details after sensitive data is removed.

The workflow excludes sensitive traits such as race, religion, gender, health, and disability. Cold or ambiguous leads remain available for human review.

## Output contract

```json
{
  "policy_version": "2.0",
  "score": 82,
  "band": "Hot",
  "route": "Priority sales queue",
  "summary": "Urgent in-area roof replacement with strong value fit.",
  "factors": {
    "service_fit": 30,
    "urgency": 25,
    "estimated_value": 20,
    "service_area": 5,
    "contactability": 2
  },
  "requires_human_review": false
}
```

## Prompt contract

```text
You are a lead-routing assistant for a local-service business.
Use only the approved business-fit fields supplied in JSON.
Do not infer sensitive personal characteristics.
Return valid JSON matching the output contract.
Explain the route in one factual sentence.
Do not invent details. If data is missing or conflicting, set requires_human_review to true.
```

## Guardrails

- validate output against a JSON schema before writing to the CRM;
- keep the deterministic score available as a fallback;
- record the policy/prompt version and an audit timestamp;
- never auto-delete or permanently reject a lead based only on AI output;
- strip PII from logs and use least-privilege credentials; and
- monitor score distribution, errors, manual overrides, and booking rate by band.

The executable fallback is in [`implementation/qualification.js`](../implementation/qualification.js), with tests in [`tests/qualification.test.js`](../tests/qualification.test.js).
