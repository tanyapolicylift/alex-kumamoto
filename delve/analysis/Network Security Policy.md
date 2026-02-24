# Network Security Policy — Commitment Analysis

**Source:** `source/# Network Security Policy.md`
**Date Analyzed:** 2026-02-24

---

## How to Use This File

Review each commitment below. For each one:
- Check the **Implementing** box if we will adopt this commitment
- Leave it unchecked if we are removing it from our policy
- Use the **Comment** field to add nuance (e.g., "yes but quarterly instead of monthly", "defer to Q3", "already doing this via <tool>")

When you are done reviewing, tell the agent: **"Finalize Network Security Policy"**

---

## Commitment 1: Firewall Configuration and Annual Rule Review

> "System firewalls are configured on the application gateway and production network to limit unnecessary ports, protocols, and services. Firewall rules are reviewed on an annual basis by IT management."

> "All traffic and protocols shall be explicitly blocked, except for those required for business operations."

> "PolicyLift should test firewall policies and ACLs to ensure that any unauthorized activity is blocked."

**What this requires:**
- Configure firewalls with a default-deny posture (block everything, explicitly allow what's needed)
- Conduct a formal annual review of all firewall rules, documented with sign-off by IT management
- Periodically test firewall rules to confirm they actually block unauthorized traffic

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep |

**Why:** Firewalls and default-deny configurations are fundamental to SOC 2. Auditors will ask to see your firewall rules and evidence that they've been reviewed. If you're running on AWS/GCP, security groups and network ACLs serve this role — just make sure you document an annual review. The testing piece can be lightweight (a checklist confirming rules match intended state) rather than a formal penetration test of every rule.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 2: VPN for All Remote Access

> "All remote access to PolicyLift systems must occur through a sanctioned medium, like a VPN, based on thorough risk assessment and proper authorizations."

> "Devices may only connect to the corporate network and data over the internet via a Secure Socket Layer (SSL) Virtual Private Network (VPN)."

> "Smart mobile devices like smartphones, tablets, and laptops will connect to the corporate network and data using mobile VPN software installed on the device by IT."

**What this requires:**
- Deploy and maintain a VPN solution for all remote access to internal systems
- Restrict VPN admin access to authorized personnel
- Require all devices (including mobile) to use VPN for corporate network access

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Important | Simplify |

**Why:** SOC 2 requires encrypted remote access, but mandating VPN for everything is an enterprise-era approach. Most modern startups use cloud-hosted SaaS tools (accessible over HTTPS) and zero-trust architectures instead of traditional VPNs. If your production systems are in AWS/GCP and you access them via SSH with key-based auth or through a cloud console with MFA, that already satisfies the auditor. Rewrite this to say "all remote access must be encrypted and authenticated" and list your actual access methods (e.g., SSO + MFA for SaaS, SSH keys for infrastructure, VPN only if you actually use one). Don't commit to blanket VPN if you don't need it.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 3: Centralized Logging and Monitoring of Network Activity

> "Logging shall be activated, especially for log configuration changes, and stored in a centralized log management tool."

> "Every access to the network and network security products by administrators should be permitted, tracked, and overseen."

> "All traffic passing through the firewall should be observed for potential misuses and intrusions."

**What this requires:**
- Enable logging on all network devices and security tools
- Aggregate logs into a centralized log management system (e.g., CloudWatch, Datadog, a SIEM)
- Monitor firewall and network traffic for signs of intrusion or misuse
- Track and log all administrator access to network and security systems

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep |

**Why:** Centralized logging is non-negotiable for SOC 2. Auditors will ask where your logs go, how long they're retained, and whether anyone reviews them. If you're on AWS/GCP, you likely already have CloudTrail/Cloud Audit Logs and VPC flow logs available — just make sure they're turned on, shipped somewhere central, and that you have basic alerting for anomalies. You don't need a $100k/year SIEM; a lightweight setup (CloudWatch + alerts, or Datadog) is fine at this stage. The "observe all firewall traffic" language is aspirational — simplify to "alert on suspicious patterns."

- [ ] **Implementing**
- **Comment:**

---

## Commitment 4: Intrusion Detection System (IDS)

> "To prevent unauthorized access, detect external security threats and to keep Company's network separate from unsecured networks, the Internet, and third-party networks, PolicyLift uses firewalls and intrusion detection systems."

**What this requires:**
- Deploy and operate an intrusion detection system (IDS) on the network

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| High | Important | Simplify |

**Why:** A dedicated IDS (like Snort or Suricata) is heavy for a 10-person startup. However, SOC 2 auditors do expect some form of intrusion/anomaly detection. In a cloud environment, you can satisfy this with managed services like AWS GuardDuty or GCP Security Command Center, which are trivial to enable and cost very little. Rewrite the policy to say "intrusion detection capabilities" rather than committing to a specific on-prem IDS. If you turn on GuardDuty, you can check this box with minimal effort.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 5: Network Segmentation and Environment Separation

> "Keep development/testing, production, and corporate resources on separate network segments as appropriate."

> "System components must be configured such that the company and its customers' access is appropriately segmented from other customer accounts."

> "Networks belonging to customers or partners that connect with the PolicyLift network will be kept separate from one another."

> "Ensure that IP phones and IoT devices, if used, are logically separated within the network."

**What this requires:**
- Separate production, dev/test, and corporate environments at the network level
- Ensure multi-tenant customer data is segmented appropriately
- Logically isolate IoT/IP phone devices if used

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep (simplify IoT/phone language) |

**Why:** Network segmentation between production and non-production is a core SOC 2 expectation. Auditors will check that dev cannot freely access prod. In cloud environments, this is typically done via separate VPCs, accounts, or projects — which you may already have. Customer data segmentation is also essential for trust services criteria. The IoT/IP phone language is irrelevant for a modern cloud-native startup — remove it to avoid creating an obligation nobody will track. Keep the substance (env separation + tenant segmentation), drop the legacy hardware references.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 6: Network Diagram Maintained and Reviewed Annually

> "A network diagram should provide a visual representation of deployed network devices and traffic flows, and should also highlight both physical and logical security controls designed to guide legitimate traffic and detect and discard irrelevant or unwanted traffic. This network diagram should be reviewed annually by IT/Engineering Management."

**What this requires:**
- Create and maintain a network architecture diagram showing devices, traffic flows, and security controls
- Review and update it annually with sign-off from IT/Engineering leadership

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Critical | Keep |

**Why:** SOC 2 auditors will almost certainly ask for a network or architecture diagram. This is one of the most common audit requests and is very easy to satisfy. Draw your cloud architecture (VPCs, subnets, security groups, load balancers, databases) in something like Lucidchart, draw.io, or even a whiteboard photo. Review it once a year to make sure it still matches reality. This is low effort with high audit payoff.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 7: Formal Risk Assessment Before External Network Connections

> "Network connections between PolicyLift and external parties such as vendors, customers, and subsidiaries, should only be established after a formal risk assessment has been conducted and appropriate authorization granted."

> "A formal agreement must be in place with vendors, customers, or partners prior to connecting to the PolicyLift network."

**What this requires:**
- Conduct a documented risk assessment before granting any external party a direct network connection
- Have a formal agreement (contract/NDA/security addendum) in place before connecting third parties

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Keep (simplify) |

**Why:** If you ever have a vendor or partner with direct network-level access (e.g., a VPN tunnel to a partner, a peered VPC), SOC 2 expects you to have assessed the risk and documented an agreement. For most small startups, third-party access happens via APIs over the internet, not via direct network connections — so this may rarely apply. Keep the commitment but simplify: "Before granting any third party direct network-level access, we conduct a risk assessment and require a signed agreement." If all third-party integration is via SaaS APIs, note that this applies to direct network connections only.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 8: Mobile Device Management (MDM) for Endpoints

> "The company has a mobile device management (MDM) system in place to centrally manage endpoint devices supporting the service to the customer."

> "The IT department will enforce these policies using Mobile Device Management (MDM) software whenever possible."

> "Only IT-managed or IT-approved devices can directly connect to the internal corporate network."

**What this requires:**
- Deploy and maintain an MDM solution to manage all endpoint devices (laptops, phones, tablets)
- Enforce security policies (encryption, password, auto-lock) via MDM
- Restrict corporate network access to IT-managed or IT-approved devices only
- Inspect personal devices attempting to connect

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| High | Important | Simplify |

**Why:** Full MDM (like Jamf, Intune, or Kandji) is genuinely useful for device security and auditors appreciate it, but it is a meaningful operational commitment — you need to configure profiles, manage enrollment, handle exceptions, and maintain it over time. For a 10-person startup, a lighter approach may suffice: require company-managed laptops with disk encryption and screen lock enabled, and use an MDM-lite tool or manual verification. SOC 2 does not strictly require MDM — it requires that endpoints are managed and secured. You can satisfy this with documented device requirements + periodic checks rather than a full MDM rollout. If you do have MDM already, keep this. If not, simplify the language to "endpoints must meet security baselines (encryption, auto-lock, patching)" and mention MDM as an optional enforcement mechanism.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 9: Vulnerability Scanning and Penetration Testing

> "Perform audits of the network, carrying out vulnerability scans and penetration tests as appropriate on key areas of the network and addressing any identified high-risk issues."

**What this requires:**
- Conduct periodic vulnerability scans of the network
- Perform penetration tests on key network areas
- Remediate high-risk findings from these assessments

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep |

**Why:** Vulnerability scanning and penetration testing are strongly expected by SOC 2 auditors. Most auditors want to see at least annual penetration testing and more frequent vulnerability scans (quarterly or continuous). The good news: you can use third-party services for pen tests (a few thousand dollars for a startup-scale engagement) and automated scanners (many free or low-cost options). The policy language ("as appropriate") already gives you flexibility on cadence. Keep this commitment and define a realistic cadence: annual pen test, quarterly or continuous vulnerability scans.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 10: NTP Time Synchronization Across Network Devices

> "Align the clocks of network devices with the Network Time Protocol (NTP). Make sure all equipment is set to the correct time zone."

**What this requires:**
- Ensure all network devices and servers synchronize time via NTP
- Verify correct time zone configuration

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Important | Keep |

**Why:** Accurate timestamps are essential for log correlation and incident investigation — auditors expect this. The good news is that if you're running in AWS/GCP, time sync is handled automatically by the cloud provider. This is essentially a free commitment. Just confirm your instances use the cloud provider's NTP service and that your logging timestamps are in UTC. No real operational burden here.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 11: Network Device Configuration Backup

> "The setup of network devices should be saved regularly or anytime changes are made, and this should be done to a central location. This central backup location needs to be kept secure."

**What this requires:**
- Regularly back up configurations of all network devices to a secure, centralized location
- Back up on every change

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Nice-to-Have | Simplify |

**Why:** In a cloud-native environment, infrastructure-as-code (Terraform, CloudFormation, Pulumi) replaces traditional "backup the router config" thinking. If your infrastructure is defined in code and stored in version control (Git), you already satisfy the spirit of this commitment. For physical network devices (if any), this matters more. Simplify the policy language to: "Infrastructure configurations are defined in code and stored in version control, or backed up to a secure central location." This avoids creating an obligation to manually back up cloud security group rules that are already in your Terraform repo.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 12: Patching Schedule for Network Devices

> "Network devices are updated and patched regularly following a clearly defined schedule."

> "Necessary critical security patches provided by vendors should be installed within a set period of time after they are released. All other relevant security patches provided by vendors should be installed according to the patching schedule."

> "Devices must be updated consistently and run the latest OS available."

**What this requires:**
- Establish a defined patching schedule for network devices and endpoints
- Apply critical security patches within a specified timeframe (you need to define what "set period" means)
- Keep all devices running current OS versions

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Medium | Critical | Keep |

**Why:** Patch management is a core SOC 2 control. Auditors will ask about your patching cadence and may sample devices to check. You need to define concrete timelines (e.g., "critical patches within 14 days, all others within 30 days") and have a way to verify compliance. For cloud infrastructure, much of this is handled by managed services (RDS, Lambda, etc.), but you still need to patch OS-level components on EC2 instances, container base images, and employee laptops. Keep this, and define the specific SLAs for patch timelines.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 13: Separation of Duties for Network vs. Computer Operations

> "As much as possible, duties will be separated for personnel working on network operations and computer operations."

**What this requires:**
- Maintain distinct roles/personnel for network operations versus computer/system operations

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| High | Nice-to-Have | Remove |

**Why:** This is a large-enterprise control that makes no sense for a 10-person startup. You likely have 1-3 engineers who handle everything from infrastructure to application code to deployments. Auditors understand this for small companies and do not expect dedicated "network operations" vs. "computer operations" teams. Remove this entirely. If you want a nod to separation of duties, address it at the access control level (e.g., not everyone has prod admin access) in your Access Control Policy instead.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 14: Wireless Network Approval and Physical Security of Network Hardware

> "Permission from the IT Department must be obtained before using wireless connections."

> "Ensure that routers and switches are housed in a secured room, out of reach from unauthorized individuals. These devices should have effective cooling, a dependable power supply, and ideally, connected to an adequately sized uninterruptible power supply (UPS)."

> "For wireless access points, either lock them in a secure room or mount them high on ceilings to make any physical access noticeable."

**What this requires:**
- Require IT approval before any wireless network use
- Physically secure all routers, switches, and wireless access points (locked rooms, UPS, cooling)
- Control physical access to networking hardware

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Nice-to-Have | Remove or heavily simplify |

**Why:** If PolicyLift is a cloud-native startup working from co-working spaces or a small office with standard WiFi, most of this is irrelevant. You don't own routers in a data center — AWS/GCP does. The "get IT permission for wireless" line is impractical when everyone works on laptops over WiFi by default. If you have a physical office with a managed WiFi network, a one-line statement ("Office WiFi is secured with WPA3/WPA2-Enterprise and managed by IT") suffices. Remove the physical security theater about UPS and ceiling-mounted access points unless you actually run your own data center.

- [ ] **Implementing**
- **Comment:**

---

## Commitment 15: Network Security Training for Support Team

> "Guarantee that PolicyLift's network support team has the necessary training and internal communication to establish and maintain a secure network infrastructure."

**What this requires:**
- Provide network security training to the team responsible for infrastructure
- Maintain internal communication channels for security knowledge sharing

| Difficulty | SOC 2 Necessity | Recommendation |
|------------|-----------------|----------------|
| Low | Nice-to-Have | Simplify |

**Why:** SOC 2 expects general security awareness training (covered in other policies), but a dedicated "network security training program" for your infrastructure team is overkill at startup scale. Your engineers likely stay current through their own professional development. Simplify this to a general statement that engineering staff maintain relevant technical skills, or fold it into your broader security awareness training commitment in another policy. Don't create a standalone training obligation here.

- [ ] **Implementing**
- **Comment:**
