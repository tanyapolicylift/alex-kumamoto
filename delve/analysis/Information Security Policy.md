# Information Security Policy — Commitment Analysis

**Source:** `source/# Information Security Policy.md`
**Date Analyzed:** 2026-02-24

---

## How to Use This File

Review each commitment below. For each one:
- Check the **Implementing** box if we will adopt this commitment
- Leave it unchecked if we are removing it from our policy
- Use the **Comment** field to add nuance (e.g., "yes but quarterly instead of monthly", "defer to Q3", "already doing this via <tool>")

When you are done reviewing, tell the agent: **"Finalize Information Security Policy"**

---

## Commitment 1: Annual Policy Review, Approval, and Employee Acknowledgment

> "The policies and procedure documents are reviewed and approved by management annually or during significant changes."

> "All personnel are required to read, accept and follow all PolicyLift policies and plans upon starting and at least annually."

> "PolicyLift reviews and updates its security policies and plans to maintain organizational security objectives and meet regulatory requirements at least annually. The results are shared with appropriate parties internally and findings are tracked to resolution. Any changes are communicated across the organization."

**What this requires:** Every year (and upon significant changes), management must formally review and approve all security policies. Every employee must acknowledge/accept them upon hire and annually thereafter. Changes must be tracked and communicated company-wide. You need a system to record these reviews and acknowledgments (e.g., a compliance platform like Vanta, Drata, or even a simple sign-off spreadsheet).

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep |

**Why:** Auditors will explicitly ask for evidence of annual policy review and employee acknowledgment. This is a baseline SOC 2 requirement. If you already use a compliance platform (Vanta, Drata, etc.), this is largely automated. Even without one, a calendar reminder + a shared doc sign-off is sufficient at your size.

- [x] **Implementing**
- **Comment:**

---

## Commitment 2: Policy Modification Authority and Change Records

> "The Chief Technology Officer (CTO), Chief Operating Officer (COO), or Board of Directors have the authority to modify, remove, or approve modifications to these policies and procedures."

> "Records of all such changes must be kept and reviewed by the Board."

**What this requires:** Only the CTO, COO, or Board can approve policy changes. Every change must be logged, and the Board must review these records. This means maintaining a change log for policies and presenting it to the Board periodically.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Simplify |

**Why:** SOC 2 requires that policy changes are approved by appropriate management -- that part is non-negotiable. However, requiring Board review of every policy change record is heavyweight for a startup. Simplify to: CTO or COO approve changes; maintain a change log; Board reviews the overall security program annually (not individual policy edits). This keeps you compliant without creating unnecessary Board overhead.

- [x] **Implementing**
- **Comment:**
Make it the CTO
---

## Commitment 3: Background Checks for All New Hires and Contractors

> "All PolicyLift new employees and contractors are required to complete a background check/reference check prior to joining. An authorized member of PolicyLift must review each background check in accordance with local laws."

**What this requires:** Every new employee and contractor must undergo a background check before their start date, and an authorized person must review the results. This means setting up a background check provider (e.g., Checkr) and building it into your onboarding process.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep |

**Why:** Background checks are a standard SOC 2 expectation and auditors routinely sample employee files to confirm this. Services like Checkr make this cheap and easy. The only nuance is "contractors" -- make sure your scope is realistic. If you use freelancers for short engagements, decide whether this applies to all of them or only those with system access.

- [x] **Implementing**
- **Comment:**

---

## Commitment 4: Confidentiality Agreements Before Accessing Sensitive Information

> "Prior to accessing sensitive information, personnel are required to sign an industry-standard confidentiality agreement protecting PolicyLift confidential information."

**What this requires:** Every employee and contractor must sign a confidentiality/NDA agreement before getting access to sensitive systems or data. This needs to be part of the onboarding workflow.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep |

**Why:** Auditors check for signed confidentiality agreements in employee files. Most startups already do this via their employment agreements or a standalone NDA. Just make sure it is a distinct, trackable artifact in each person's file -- not buried in a 40-page employment contract where you cannot prove it was signed.

- [x] **Implementing**
- **Comment:**

---

## Commitment 5: Secure Coding Training and Security Awareness Program

> "Security awareness and training must encompass general security awareness, role-specific security requirements, and ongoing education about emerging threats. The effectiveness of these programs must be regularly assessed and documented."

> "PolicyLift promotes the understanding of secure coding to its engineers in order to improve the security and robustness of PolicyLift products."

**What this requires:** Two things: (1) a general security awareness training program for all staff (with role-specific modules, ongoing updates, and effectiveness assessments), and (2) secure coding training specifically for engineers. Effectiveness must be assessed and documented -- meaning you need records of completion and possibly quiz scores.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical (general awareness) / Nice-to-Have (effectiveness assessment) | Simplify |

**Why:** Annual security awareness training is non-negotiable for SOC 2 -- auditors will ask for completion records. A platform like KnowBe4 or even a simple annual training session with a sign-off sheet works. However, the requirement to "regularly assess and document effectiveness" goes beyond what most startups do. Simplify to: annual security training for all employees, with completion tracked. Secure coding can be covered as part of engineering onboarding or periodic team sessions -- no need for a formal "program" with effectiveness metrics at your size.

- [x] **Implementing**
- **Comment:**

---

## Commitment 6: Endpoint Security and Asset Management

> "PolicyLift maintains an Asset Register or Asset Monitoring Tool designed to track and set configuration in line with the following baseline hardening standards..."

> "Disk encryption and system passwords should be enabled across all organization workstations."

> "Anti-virus and Malware protection software should be installed and configured for Windows-based workstations and laptops."

> "Workstations should be configured to receive automatic patch updates. In addition, workstation must be scanned to test patch compliance on a daily basis."

> "The company maintains an inventory of its assets including details on asset ownership and location. The asset inventory listing is reviewed and updated by management on an as-needed basis or at least annually."

**What this requires:** This bundles several related sub-commitments: (a) maintain an asset inventory of all devices with ownership/location, reviewed annually; (b) enforce disk encryption and passwords on all workstations; (c) install antivirus/anti-malware on Windows machines; (d) configure automatic patching and scan daily for compliance. This means deploying an MDM/endpoint management tool (e.g., Jamf, Kandji, Fleet) that can enforce and report on these controls.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep (with scope adjustments) |

**Why:** Asset management and endpoint hardening are core SOC 2 controls. Auditors will want to see that company devices are encrypted, patched, and tracked. An MDM tool handles most of this automatically. The "daily scan for patch compliance" language is aggressive -- most startups do continuous monitoring via their MDM rather than a separate daily scan. If you are a Mac-only shop, the Windows antivirus requirement is moot. Adjust the policy to reflect your actual fleet. The asset inventory can be your MDM dashboard -- no need for a separate spreadsheet.

- [x] **Implementing**
- **Comment:**

---

## Commitment 7: Subservice Organization (Cloud Provider) Annual SOC 2 Review

> "The SOC 2 report of subservice organization should be reviewed on an annual basis to evaluate the effectiveness of the controls at the subservice organization."

**What this requires:** Once a year, obtain and review the SOC 2 report from your cloud infrastructure provider (AWS, GCP, etc.) to confirm their controls are adequate. Document the review.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep |

**Why:** This is a standard SOC 2 requirement for companies relying on cloud infrastructure. AWS and GCP publish their SOC 2 reports; you just need to download them annually and document that someone reviewed them. Takes 30 minutes once a year. Auditors specifically check for this.

- [x] **Implementing**
- **Comment:**

---

## Commitment 8: Vulnerability Scanning, Patch Management, and Remediation

> "Vulnerability scans are performed monthly with the scan frequency adjusted, as required, to meet ongoing and changing commitments and requirements."

> "The IT and Engineering department review the vulnerabilities and takes necessary actions on vulnerabilities identified as high and critical."

> "A remediation plan is developed, and changes are implemented to remediate critical and high vulnerabilities at a minimum."

> "IT leadership team on a monthly basis makes assessments on the patches and approves for implementation to ensure critical patches must be updated on a timely basis."

> "A patch management process exists to confirm that operating system level vulnerabilities must be remediated in a timely manner. In addition, production servers must be scanned to test patch compliance on an ongoing basis."

**What this requires:** This creates several recurring obligations: (a) monthly vulnerability scans of infrastructure and applications; (b) review and triage of scan results, with focus on high/critical findings; (c) documented remediation plans for high/critical vulnerabilities; (d) monthly patch assessments by IT leadership with formal approval; (e) ongoing patch compliance scanning for production servers. This is a substantial recurring operational process.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Simplify |

**Why:** Vulnerability scanning and patch management are absolutely required for SOC 2 -- this is non-negotiable. However, the policy as written creates a bureaucratic process (monthly IT leadership patch approval meetings, formal remediation plans for each finding) that is overkill for a small team. Simplify to: automated vulnerability scanning (tools like Dependabot, Snyk, AWS Inspector), automated patching where possible, and a lightweight monthly review of open high/critical findings. At 10 people, "IT leadership patch approval" is just the CTO or engineering lead glancing at a dashboard -- do not create a formal meeting or sign-off process for this.

- [x] **Implementing**
- **Comment:**

---

## Commitment 9: DLP Software for Email

> "the organization uses DLP (Data Loss Prevention) software to prevent sensitive information from being transmitted over email."

**What this requires:** Deploy and maintain a Data Loss Prevention tool that monitors outbound email for sensitive information (PII, PHI, credentials, etc.) and blocks or flags transmissions.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Nice-to-Have | Remove (or defer) |

**Why:** DLP is not a standard SOC 2 requirement for startups. Most early-stage companies passing SOC 2 do not have dedicated DLP tooling. If you are using Google Workspace or Microsoft 365, there are built-in DLP features you could enable, but even that is more than most auditors expect. The bigger risk is committing to DLP in your policy and then not actually having it -- that creates a finding. Either implement it for real or remove this language. For a startup, removing it and relying on access controls and encryption is the pragmatic choice. You can add DLP later as you scale.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 10: Logging, Monitoring, and 1-Year Log Retention

> "PolicyLift collects & monitors audit logs and alerts on key events stemming from production systems, applications, databases, servers, message queues, load balancers, and critical services, as well as IAM user and admin activities."

> "Logs must be securely stored and archived for a minimum of 1 year to assist with potential forensic efforts."

> "the monitoring tool generates alerts when specific predefined thresholds are met."

> "Logging should be enabled to monitor activities such as administrative activities, logon attempts, data deletions at the application and infrastructure level, changes to functions, security configurations, permissions, and roles."

**What this requires:** Comprehensive logging across your entire production stack (applications, databases, servers, queues, load balancers, IAM), with: (a) centralized log collection; (b) alerting on predefined thresholds; (c) monitoring of admin activities, logon attempts, data deletions, config changes; (d) secure storage with 1-year retention; (e) access controls to prevent log tampering.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep (with pragmatic scope) |

**Why:** Logging and monitoring are core SOC 2 controls. Auditors will want to see that you capture audit trails and can detect anomalies. If you are on AWS/GCP, CloudTrail/Cloud Audit Logs handle most IAM and infrastructure logging automatically. Application-level logging via a tool like Datadog, CloudWatch, or similar is standard. The 1-year retention is a common SOC 2 expectation. The key is to not over-promise: commit to logging what you actually log, set up a handful of meaningful alerts (e.g., root account usage, failed login spikes, deployment failures), and ensure retention is configured. Do not try to log "everything" on day one -- start with IAM, infrastructure changes, and application errors.

- [x] **Implementing**
- **Comment:**

---

## Commitment 11: Incident Response Plan -- Annual Testing and Review

> "PolicyLift maintains a plan that defines responsibilities, detection, and corrective actions during a security incident."

> "The plan is tested, reviewed and updated at least annually."

> "Incident response procedures must ensure timely detection, effective response, and proper handling of security incidents while maintaining communication with affected parties and documenting lessons learned."

**What this requires:** Maintain a written incident response plan covering roles, detection, response, communication, and lessons learned. Test the plan at least annually (e.g., tabletop exercise). Review and update the plan annually.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep |

**Why:** An incident response plan is one of the most commonly audited SOC 2 controls. Auditors will ask to see the plan and evidence that it was tested. The good news: "testing" for a startup usually means a simple tabletop exercise (a 1-hour meeting where you walk through a hypothetical incident). You do not need to run a full red-team simulation. Write a clear, short plan, run a tabletop once a year, and document the outcome. This is very achievable.

- [x] **Implementing**
- **Comment:**

---

## Commitment 12: Annual Risk Assessment with Classification and Mitigation Plans

> "PolicyLift requires a risk assessment to be performed at least annually. For risks identified during the process, PolicyLift must classify the risks and develop action plans to mitigate discovered risks."

**What this requires:** Conduct a formal risk assessment at least once a year. Classify identified risks by severity/likelihood and create documented action plans for mitigation.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep |

**Why:** Annual risk assessments are a pillar of SOC 2. Auditors will ask for the risk register and evidence of the assessment process. At a startup, this does not need to be elaborate -- a spreadsheet listing 15-25 risks, each rated by likelihood and impact, with a brief mitigation plan or acceptance rationale, is sufficient. Compliance platforms like Vanta can help template this. Budget about a half-day annually to do it properly.

- [x] **Implementing**
- **Comment:**

---

## Commitment 13: Vendor Security Assessments Before Onboarding

> "PolicyLift requires a vendor security assessment before third party products or services are used confirming the provider can maintain appropriate security and privacy controls. The review may include gathering applicable compliance audits (SOC 1, SOC 2, PCI DSS, HITRUST, ISO27001, etc.) or other security compliance evidence."

**What this requires:** Before onboarding any new third-party vendor or tool, perform a security assessment -- which typically means collecting their SOC 2 report or other compliance evidence and documenting your review. Agreements must be updated when requirements change.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Important | Simplify |

**Why:** Vendor management is expected for SOC 2, but the scope matters. You do not need to assess every SaaS tool you use -- focus on vendors that handle sensitive data or have access to your production environment. For a startup, a simple vendor inventory spreadsheet with columns for "what data they access," "do they have a SOC 2," and "date reviewed" is sufficient. Do not create a heavyweight procurement process. The key is demonstrating that you thought about vendor risk for your critical vendors, not that you ran a formal assessment on every $10/month tool.

- [x] **Implementing**
- **Comment:**

---

## Commitment 14: HIPAA/BAA Compliance for PHI Handling

> "to ensure compliance with HIPAA, satisfactory assurances required by the vendor with respect to create, receive, maintain, or transmit electronic protected health information on behalf of the entity be documented through a written contract or other arrangement with the business associate that meets the applicable requirements."

> "Documentation is required to provide evidence of proper removal of electronic Protected Health Information (ePHI). This includes a signed form by the employees responsible for the removal, confirming that ePHI has been appropriately erased."

**What this requires:** If PolicyLift handles ePHI: (a) execute Business Associate Agreements with any vendors who touch ePHI; (b) maintain documented evidence of proper ePHI destruction when disposing of media, including signed forms from responsible employees.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Important (if you handle PHI) / Remove (if you do not) | Keep only if handling PHI |

**Why:** HIPAA requirements are separate from SOC 2 but are referenced throughout this policy. If PolicyLift actually handles ePHI, BAAs and ePHI destruction documentation are legally required -- not optional. If PolicyLift does NOT handle ePHI, this language should be removed from the policy entirely, because committing to HIPAA obligations you do not actually have creates unnecessary audit risk. Decide this based on your actual data flows and remove the language if it does not apply.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 15: Media Disposal via Third-Party Sanitization

> "The company should engage a third-party for sanitizing digital media to remove any data and software prior to its disposal/degaussing."

> "Any removal of devices or media from the inventory list during the in-scope period triggers a verification process."

> "the training provided to employees responsible for the disposal of electronic media includes best practices for secure removal"

**What this requires:** When disposing of any company device or digital media: (a) hire a third-party sanitization service; (b) run a formal verification process for every device removal; (c) train employees on secure disposal best practices.

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Nice-to-Have | Remove or Simplify heavily |

**Why:** For a 10-person startup using cloud-hosted infrastructure and company laptops, formal third-party media sanitization and degaussing is extreme overkill. You likely are not disposing of physical servers. When an employee leaves and returns a laptop, a factory reset or disk wipe is sufficient. Simplify to: "Devices are wiped before reuse or disposal" and skip the third-party sanitization service and formal verification process. If you do eventually decommission physical hardware at scale, add this back in.

- [ ] **Implementing**
- **Comment:**
