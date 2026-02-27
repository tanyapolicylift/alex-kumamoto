# Risk Assessment and Treatment Policy — Commitment Analysis

**Source:** `source/# Risk Assessment and Treatment Policy.md`
**Date Analyzed:** 2026-02-24

---

## How to Use This File

Review each commitment below. For each one:
- Check the **Implementing** box if we will adopt this commitment
- Leave it unchecked if we are removing it from our policy
- Use the **Comment** field to add nuance (e.g., "yes but quarterly instead of monthly", "defer to Q3", "already doing this via <tool>")

When you are done reviewing, tell the agent: **"Finalize Risk Assessment and Treatment Policy"**

---

## Commitment 1: Annual Formal Risk Assessment

> "Management and the Chief Information Security Officer (CISO) perform a formal risk assessment on an annual basis or in the event of significant changes."

> "Formal risk assessment is conducted annually"

> "PolicyLift reviews and updates its security policies and plans to maintain organizational security objectives and meet regulatory requirements at least annually."

**What this requires:** Once a year (and whenever there is a major change to infrastructure, products, or business model), the CISO and management must conduct a structured risk assessment. This means sitting down, identifying assets and threats, scoring risks by likelihood and impact, documenting everything in a risk register, and producing a written report. The policy also requires an annual review of the risk assessment policy itself.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep |

**Why:** An annual risk assessment is one of the most explicitly checked items in a SOC 2 audit. Auditors will ask to see the risk register, the assessment methodology, and evidence that it was completed within the audit period. For a startup, this does not need to be a massive exercise — a half-day session with a spreadsheet-based risk register is perfectly sufficient — but it must be documented and it must happen.

- [x] **Implementing**
- **Comment:**

---

## Commitment 2: Risk Register with Documented Risk Ownership

> "For each risk, a risk owner has to be identified – the person or organizational unit responsible for each risk."

> "Identified risks along with mitigation strategies are documented and implemented by PolicyLift's executive management within the risk register which includes an inventory of 'high' and 'critical' risks that relate to PolicyLift, operating model, employees, and customers."

> "The status of all deficiencies along with residual risks that have been rated as high or critical for the organization are tracked until satisfactorily resolved."

**What this requires:** Maintain a risk register (spreadsheet or tool) that lists each identified risk with: a named risk owner, a likelihood/impact score, the chosen treatment (mitigate, transfer, accept), and the current status. High and critical risks must be tracked to resolution. This register must be kept up to date, not just produced once and forgotten.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep |

**Why:** The risk register is the tangible artifact auditors will pull during a SOC 2 exam. They want to see that risks are identified, scored, assigned to owners, and have treatment plans. A simple spreadsheet (risk description, owner, likelihood, impact, score, treatment, status) is all you need. The key is that it exists, is populated with real risks, and shows evidence of being updated.

- [x] **Implementing**
- **Comment:**

---

## Commitment 3: Designated Compliance Officer / CISO Coordinating Risk Activities

> "The risk assessment process is coordinated by PolicyLift compliance officer, which includes the identification and evaluation of assets, threats, and vulnerabilities."

> "Management and the Chief Information Security Officer (CISO) perform a formal risk assessment on an annual basis..."

> "PolicyLift or a designee is responsible for overseeing the successful completion of the risk assessment."

**What this requires:** Someone must be formally designated as the person who owns and coordinates the risk assessment process. The policy references both a "compliance officer" and a "CISO" in different places, implying these could be separate roles or the same person. At minimum, one named individual must be responsible for ensuring the risk assessment happens, the register is maintained, and the report is delivered.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep (simplify role language) |

**Why:** SOC 2 requires that someone is accountable for risk management. At a 10-person startup, this does not need to be a dedicated hire — it can be the CTO, a co-founder, or an engineering lead with "CISO" as an additional hat. The important thing is that one person is named and documented as responsible. Simplify the policy to reference a single role (e.g., "CISO or designee") rather than bouncing between "compliance officer" and "CISO."

- [x] **Implementing**
- **Comment:**

---

## Commitment 4: Annual Vulnerability Scans (Internal/External, Application and Network Layer)

> "Internal/external application and network layer vulnerability scans are performed annually"

> "Vulnerabilities may be identified by the following: Vulnerability scanning and penetration tests..."

**What this requires:** At least once a year, run vulnerability scans covering both internal and external surfaces, at both the application and network layers. This could mean using tools like AWS Inspector, Qualys, Nessus, or similar for infrastructure, plus something like OWASP ZAP or Burp Suite for application-layer scanning. Results must feed into the risk assessment.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep |

**Why:** Vulnerability scanning is a standard SOC 2 expectation. Auditors will ask for scan reports and evidence of remediation. For a cloud-native startup, the network-layer piece is largely handled by cloud provider tools (AWS Inspector, GuardDuty, etc.), and application scanning can be done with open-source tools. The annual cadence is the minimum — many startups run scans more frequently as part of CI/CD. The key is having at least one documented annual scan with evidence of follow-up on findings.

- [x] **Implementing**
- **Comment:**

---

## Commitment 5: Risk Assessment Report Delivered to Executive Management

> "PolicyLift or a designee is responsible for creating the risk assessment and treatment report and delivering results to Executive Management and other applicable personnel."

> "All risk assessment reports must be documented."

> "The results are shared with appropriate parties internally and findings are tracked to resolution."

**What this requires:** After each risk assessment, a written report must be produced and formally shared with executive management. The report should cover identified risks, chosen risk treatments, accepted risks, and residual risk levels. Findings must be tracked to resolution.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Keep (simplify) |

**Why:** Auditors want evidence that risk assessment results reach decision-makers. At a startup, this does not need to be a formal 30-page report delivered in a boardroom. A summary document or even a recorded Slack/email thread where the CISO shares the updated risk register with the founders and notes key changes is sufficient. The point is to have a paper trail showing leadership is informed and involved.

- [x] **Implementing**
- **Comment:**

---

## Commitment 6: Formal Risk Treatment Plans for High/Critical Risks

> "For any critical or high risks identified during the risk assessment process, PolicyLift will immediately develop action plans to mitigate those risks which could include patching of vulnerable systems and/or applying other control activities."

> "Appropriate remediations are suggested and follow ups are performed to ensure that internal controls have been established to mitigate such risks."

> "Unacceptable risks should be appropriately remediated or mitigated in accordance with the Change Management Policy."

**What this requires:** When the risk assessment identifies a high or critical risk, PolicyLift must create and document an action plan to address it — not just note it. The word "immediately" implies urgency. Remediation must be tracked, and changes made through the Change Management Policy process.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep (soften "immediately" to "promptly") |

**Why:** Auditors will look at the risk register and ask: "For the high-risk items, what did you do about them?" Having documented treatment plans and evidence of follow-through is essential. However, the word "immediately" is unrealistic for a small team — replacing it with "promptly" or "in a timely manner" gives you appropriate flexibility without weakening the commitment. The treatment plans can be simple (a Jira ticket, a line item in the risk register with a target date and owner).

- [x] **Implementing**
- **Comment:**

---

## Commitment 7: Executive Acceptance of Residual Risk

> "On behalf of the risk owners, Executive Management will accept all residual risks."

> "This report shall include risk responses and documentation of risks that will be accepted by the organization such as threats or vulnerabilities that will likely impact the organization and with a low impact cost."

**What this requires:** After risk treatment decisions are made, any remaining (residual) risk must be formally accepted by executive management. This means leadership explicitly signs off on risks they are choosing to live with, rather than leaving them in an ambiguous state.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Keep |

**Why:** This is a lightweight but meaningful practice. Auditors like to see that risk acceptance is a deliberate decision, not an oversight. For a startup, this can be as simple as the CEO or CTO adding a sign-off column in the risk register spreadsheet for accepted risks, or sending a brief email acknowledging the accepted residual risks after the annual assessment. Minimal effort, good audit optics.

- [x] **Implementing**
- **Comment:**

---

## Commitment 8: Annual Review of Insurance Coverage (Including Cyber Insurance)

> "Management should review and assess the insurance needs (including cyber security insurance) on at least an annual basis"

**What this requires:** Once a year, management must review whether PolicyLift's insurance coverage — specifically including cybersecurity insurance — is adequate given current risks and business operations.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Nice-to-Have | Simplify or Remove |

**Why:** While having cyber insurance is a good business practice, it is not a core SOC 2 audit requirement. Auditors will not fail you for lacking an annual insurance review process. This is a risk transfer mechanism that is more relevant to enterprise governance. If PolicyLift already has cyber insurance, a brief annual check-in with the broker is sensible but does not need to be enshrined in policy. Consider removing this from the policy or softening it to "management may periodically review insurance coverage."

- [x] **Implementing**
- **Comment:**
Soften as prescribed
---

## Commitment 9: Fraud Risk Reporting Obligation to CEO and COO

> "Any suspected fraud risk, waste, and abuse should be notified to the CEO and COO."

**What this requires:** Anyone who suspects fraud, waste, or abuse must report it to the CEO and COO. This implies a reporting channel or expectation must be communicated to all personnel.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Nice-to-Have | Simplify |

**Why:** Fraud risk reporting is more of a SOX / financial audit concern than a SOC 2 requirement. SOC 2 auditors are focused on security, availability, processing integrity, confidentiality, and privacy — not financial fraud. That said, having a general "report concerns to management" clause is harmless and reasonable. Simplify this to fold into a general "report suspected security or compliance concerns to management" statement rather than calling out fraud, waste, and abuse as a separate process.

- [x] **Implementing**
- **Comment:**

---

## Commitment 10: Asset Scoping and Data Flow Mapping

> "Review inventory of critical system assets (hardware, software, facilities, etc.)"
>
> "Identification of data owners (electronic and non-electronic data)"
>
> "Mapping data flow through PolicyLift and vendor systems"
>
> "Conducting an inventory of data storage (including non-electronic data)"

**What this requires:** As part of the risk assessment, PolicyLift must scope which assets are in play. This includes maintaining an inventory of critical systems, identifying data owners, mapping how data flows through internal and vendor systems, and inventorying data storage locations. The policy frames these as scoping activities for the risk assessment, not standalone ongoing processes.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Important | Keep (as part of risk assessment, not standalone) |

**Why:** Asset inventories and data flow diagrams are commonly requested by SOC 2 auditors. You do not need a fancy CMDB or data mapping tool — a spreadsheet listing your key systems (AWS services, databases, SaaS tools), who owns each, and a simple diagram showing how customer data flows through your stack is sufficient. Doing this as part of the annual risk assessment (not as a separate ongoing process) is the right level of effort for a startup. The references to "non-electronic data" and "facilities" are enterprise boilerplate and can be scoped down to what is relevant.

- [x] **Implementing**
- **Comment:**

---

## Commitment 11: Residual Risk Recalculation After Treatment

> "Based on risk treatment decisions, plans, and net new compensating controls to be implemented, residual risks must be calculated, reassessing the respective initial risks' likelihoods and impacts."

**What this requires:** After deciding on risk treatments, PolicyLift must go back and recalculate risk scores to reflect the reduced (residual) risk levels. This means the risk register should show both the initial/inherent risk score and the post-treatment residual risk score.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Keep |

**Why:** This is a standard part of any risk assessment methodology and auditors expect to see it. In practice, it just means adding two columns to your risk register spreadsheet: "inherent risk score" and "residual risk score." When you apply a control or mitigation, you re-score the risk. It takes minimal extra effort during the assessment and makes the register look complete and professional.

- [x] **Implementing**
- **Comment:**

---
