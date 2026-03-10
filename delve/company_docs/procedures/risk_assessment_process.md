# Risk Assessment Process

| Field   | Value                      |
|---------|----------------------------|
| Date    | 2026-03-09                 |
| Version | 1.0                        |
| Owner   | Alex Kumamoto (CTO/CISO)  |

## Purpose

Define the process for conducting the annual risk assessment, identifying threats to information assets, scoring risks, and developing treatment plans.

## Procedure

### 1. Initiate the Assessment

CISO kicks off the annual risk assessment and notifies the engineering team and executive leadership of the timeline.

### 2. Define Scope

Identify all information assets (reference the asset inventory), data flows, and system boundaries. Include:
- Production infrastructure and databases
- Customer data stores and processing systems
- Third-party integrations and vendor dependencies
- Internal tools and communication platforms

### 3. Identify Threats and Vulnerabilities

Brainstorm with the engineering team to identify threats and vulnerabilities for each asset. Consider:
- External threats (attackers, malware, supply chain)
- Internal threats (misconfiguration, insider risk, human error)
- Environmental threats (cloud provider outage, natural disaster)

### 4. Score Each Risk

Use a simple likelihood-times-impact matrix:

- **Likelihood** (1-5): 1 = Rare, 2 = Unlikely, 3 = Possible, 4 = Likely, 5 = Almost Certain
- **Impact** (1-5): 1 = Negligible, 2 = Minor, 3 = Moderate, 4 = Major, 5 = Severe
- **Risk Score** = Likelihood x Impact

### 5. Categorize

| Score Range | Category |
|-------------|----------|
| 20-25       | Critical |
| 12-19       | High     |
| 6-11        | Medium   |
| 1-5         | Low      |

### 6. Develop Treatment Plans

For **Critical** and **High** risks, create a formal treatment plan selecting one of:
- **Mitigate** -- implement controls to reduce likelihood or impact
- **Transfer** -- shift risk via insurance or contractual terms
- **Accept** -- acknowledge the risk with documented justification
- **Avoid** -- eliminate the activity that creates the risk

### 7. Document Accepted Risks

Any risk that is formally accepted requires written approval from the CEO (Raghav Bansal). Record the rationale.

### 8. Update the Risk Register

Enter all identified risks, scores, treatment decisions, and responsible owners into the Risk Register.

### 9. Calculate Residual Risk

After treatments are applied (or planned), re-score to determine residual risk levels.

### 10. Prepare Summary Report

Create a summary for executive management and the RGEC covering: total risks identified, distribution by category, treatment plans, and residual risk posture.

### 11. Present Results

Present findings at the next RGEC and/or Board meeting. Obtain acknowledgment of the risk posture and any accepted risks.

---

## Open Questions

- Do we want to follow a specific risk framework (NIST SP 800-30, ISO 27005) or keep it lightweight with the matrix above?
- Should we engage an external party for the first assessment to establish a baseline?
