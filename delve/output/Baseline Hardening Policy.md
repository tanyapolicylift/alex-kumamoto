<!--
  CHANGES FROM ORIGINAL:
  - Modified: Section 4 "Know What's Happening" — replaced blanket anti-virus requirement with architecture-aware endpoint protection language
  - Modified: Section 8 "Safeguard against Data Loss" — specified annual cadence for backup restoration testing
  - Kept as-is: Section 1 (Harden the Network), Section 2 (Patch and Vulnerabilities), Section 3 (Review Admin Access), Section 4 (logging/monitoring/risk assessment lines), Section 5 (Minimize User Access), Section 6 (Establish Communications), Section 7 (Use MFA), Section 9 (Further Hardening / Account Policies)
-->

## **1. Harden the Network**

Manage and audit firewall and firewall rules:

- The organization must harden the network by applying different inbound rules to restrict IP addresses to meet the organization's security objectives.
- The organization should have a secure web application for the use of the clients to securely process transactions.

## **2. Patch and Vulnerabilities**

Update the OS and other applications:

- Local machines must have the updated operating system and should be configured to receive an automatic update.
- Vulnerability scanning tool must be implemented to perform vulnerability assessment on the web applications.
- CTO/management must review the vulnerabilities and take necessary actions depending upon the criticality of the vulnerability.

## **3. Review Admin Access**

Check Unauthorized Access:

- The management should perform annual review of access, including privileged access to the production environment to identify unauthorized or terminated users. Any discrepancies must be tracked to resolution.

## **4. Know What's Happening**

- Logging should be enabled to monitor activities such as administrative activities, logon attempts, provisioning and deprovisioning at the application and infrastructure level. The IT team should continuously monitor system capacity and performance using monitoring tools. Additionally, the monitoring tool should generate alerts when specific predefined thresholds are met.
- A log management tool should be utilized to identify events that may have a potential impact on the company's ability to achieve its security objectives.
- Endpoint protection must be deployed where applicable based on the organization's infrastructure architecture. For traditional server environments, anti-virus and malware protection software must be installed and configured. For cloud-native workloads (e.g., containers, serverless functions, managed services), equivalent protections provided by the cloud platform or runtime environment are acceptable.
- An annual risk assessment must be conducted to identify risks arising from external and internal sources.

## **5. Minimize User Access Permissions**

Limit user account access to the least privilege needed:

- Privileged access to the production environment must be limited to authorized engineers.

## **6. Establish Communications**

Establish data encryption protocols and cipher suites for communications:

- The organization shall have a secure web application for the use of clients to securely process transactions. HTTPS must be utilized over public networks for encrypting authentication flows. All sensitive customer data should be encrypted at rest.

## **7. Use MFA (Multi-Factor Authentication)**

Require MFA for sensitive user accounts, systems, or items:

- MFA must be enabled on the systems. MFA should be required before an administrator or engineer can connect to the production environment.

## **8. Safeguard against Data Loss**

Use disaster recovery (DR) and high-availability (HA) safeguards:

- Cloud environments must be distributed across different zones to support service redundancy and availability.
- Data backup restoration testing must be performed at least annually. Results must be documented to confirm successful restoration.

## **9. Further Hardening / Account Policies**

Have users implement strong passwords:

- Password for in-scope system infrastructures and applications must be configured to have at least 8 characters and be complex in nature.
- Production systems and servers should be hardened to ensure an appropriate level of security.
- Baseline configurations and policies must be reviewed and updated annually or when required due to system changes.
