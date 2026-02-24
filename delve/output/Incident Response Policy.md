<!--
  CHANGES FROM ORIGINAL:
  - Modified: Escalation contacts — simplified reporting method from "email + call" to "primary communication channel (e.g., Slack) and create a ticket"
  - Modified: 48-hour investigation — changed from "CTO and Chief Architect" to "CTO or designated incident lead" (single person)
  - Modified: Severity classification — removed GDPR-specific classification criteria (PolicyLift does not handle EU personal data)
  - Modified: Incident response procedures — simplified from CTO+CSO+COO joint response to incident lead handling containment, CEO involved only for customer-affecting incidents or data breaches
  - Modified: Post-mortem and lessons learned — scoped audience: broad communication for Critical/High incidents affecting customers; engineering-team-level write-up for Medium/Low incidents. Removed blanket "notify all users" requirement.
  - Modified: External contact list — narrowed from 8 categories (including power, telecom, utilities) to FBI Cyber Division and cyber insurance carrier only
  - Removed: Template artifacts ("Mark as Complete", "Template Provided", "An example has been provided")
  - Kept as-is: Purpose, Scope, Overview, incident tracking/documentation requirements, structured incident report fields, vulnerability remediation SLA table, annual review and testing requirements, user training requirement, low-risk incident handling, forensic preservation language, disciplinary action language
-->

## Purpose

This security incident response policy is intended to establish controls to ensure that a formal incident management process has been established and implemented which requires incidents to be tracked, documented and resolved in a complete, accurate and timely manner to detect security vulnerabilities and incidents, as well as quick reaction and response to security breaches.

This document also provides implementing instructions for security incident response, including definitions, procedures, responsibilities, and performance measures (metrics and reporting mechanisms). The process document must be reviewed by management on an annual basis and updated as required.

## Scope

This policy applies to all users of information systems within the organization. This typically includes employees and contractors, as well as any external parties that come into contact with systems and information controlled by the organization (hereinafter referred to as "users"). This policy must be made readily available to all users.

## Overview

A key objective of the organization's Information Security Management Team is to focus on detecting information security weaknesses and vulnerabilities so that incidents and breaches can be prevented wherever possible. The organization is committed to protecting its employees, customers, and partners from illegal or damaging actions taken by others, either knowingly or unknowingly. Despite this, incidents and data breaches are likely to happen; when they do, the organization is committed to rapidly responding to them, which may include identifying, containing, investigating, resolving, and communicating information related to the breach.

This policy requires that all users report any perceived or actual information security vulnerability or incident as soon as possible using the contact mechanisms prescribed in this document. Also, the organization must employ automated scanning and reporting mechanisms that can be used to identify possible information security vulnerabilities and incidents. If a vulnerability is identified, it must be resolved within a set period based on its severity. If an incident is identified, it must be investigated within a set period based on its severity. If an incident is confirmed as a breach, a set procedure must be followed to contain, investigate, resolve, and communicate information to employees, customers, partners, and other stakeholders.

Within this document, the following definitions apply:

Information Security Vulnerability: a vulnerability in an information system, information system security procedures, or administrative controls that could be exploited to gain unauthorized access to information or to disrupt critical processing.

Information Security Incident: a suspected, attempted, successful, or imminent threat of unauthorized access, use, disclosure, breach, modification, or destruction of information; interference with information technology operations; or significant violation of information security policy.

## Policy

Incident Escalation Contacts

All users must report any system vulnerability, incident, or event pointing to a possible incident to the CTO at the moment that the security problem was discovered. If the CTO is unavailable, the person that discovered the problem should reach out to the following managers in the company until they get answered, in the following order:

- Chief Architect
- COO
- CEO

Incidents must be reported via the company's primary communication channel (e.g., Slack #security-incidents) and a ticket must be created in the incident tracking system.

Disciplinary Action

Users must be trained on the procedures for reporting information security incidents or discovered vulnerabilities, and their responsibilities to report such incidents. Failure to report information security incidents shall be a security violation and will be reported to the CEO for disciplinary action.

Information and artifacts associated with security incidents (including but not limited to files, logs, and screen captures) must be preserved if they need to be used as evidence of a crime.

All information security incidents must be responded to through the incident management procedures defined below which requires incidents to be tracked, documented and resolved in a complete, accurate and timely manner.

To appropriately plan and prepare for incidents, the organization must review incident response procedures at least once per year for currency and update as required.

The incident response procedure must be tested at least once per year.

All critical security (including data breaches) incidents are logged and tracked in the ticketing system and communicated to affected parties. Communication is also conducted with senior management for each security incident, to evaluate the root causes, remediation steps, and lessons learned to be able to prevent similar incidents in the future.

The engineering department shall evaluate the severity of vulnerabilities, and if it is determined to be a critical or high-risk vulnerability, a service ticket will be created. The PolicyLift's assessed severity level may differ from the level automatically generated by scanning software or determined by external researchers based on PolicyLift internal knowledge and understanding of technical architecture and real-world impact/exploitability. Tickets are assigned to the system, application, or platform owners for further investigation and/or remediation.

Vulnerabilities assessed by PolicyLift shall be remediated in the following timeframes:

|Determined Severity|Remediation Time|
|---|---|
|Critical|24–72 hours|
|High|7–14 days|
|Medium|30–60 days|
|Low|90 days|

## Procedure

When an information security incident is identified or detected, users must report to company management according to the escalation contacts above. The following information must be included as part of the notification:

- Description of the incident
- Date, time, and location of the incident
- The person who discovered the incident
- How the incident was discovered
- Known evidence of the incident
- The affected system(s)

Within 48 hours of the incident being reported, the CTO or designated incident lead shall conduct a preliminary investigation and risk assessment to review and confirm the details of the incident. If the incident is confirmed, the incident lead must assess the impact on the organization and assign a severity level, which will determine the level of remediation effort required:

- Critical: the incident is potentially catastrophic to the organization and/or disrupts the organization's day-to-day operations; a violation of legal, regulatory, or contractual requirements is likely.
- High: the incident will cause harm to one or more business units within the organization and/or will cause delays to a business unit's activities or the incident is a clear violation of organizational security policy, but will not substantively impact the business.
- Medium: Moderate risk with limited impact or additional exploit conditions required.
- Low: Minimal risk or best-practice issue with little security impact.

Incident Response Procedures

The CTO or designated incident lead shall determine appropriate incident response activities to contain and resolve incidents.

The incident lead must take all necessary steps to preserve forensic evidence (e.g. log information, files, images) for further investigation to determine if any malicious activity has taken place. All such information must be preserved and provided to law enforcement if the incident is determined to be malicious.

For Critical or High incidents that affect customers or involve a data breach, the incident lead must work with the CEO to create and execute a communications plan that communicates the incident to affected parties and, where appropriate, the public.

All critical security (including data breaches) incidents are logged and tracked in the ticketing system and communicated to affected parties. Communication is also conducted with senior management for each security incident, to evaluate the root causes, remediation steps, and lessons learned to be able to prevent similar incidents in the future.

The incident lead must take all necessary steps to resolve the incident in a timely manner and recover information systems, data, and connectivity. All technical steps taken during an incident must be documented in the organization's incident log, and must contain the following:

- Description of the incident
- Incident severity level
- The root cause (e.g. source address, website malware, vulnerability)
- Evidence
- Mitigations applied (e.g. patch, re-image)
- Status (open, closed, archived)
- Disclosures (parties to which the details of this incident were disclosed to, such as customers, vendors, law enforcement, etc.)

After an incident has been resolved, the incident lead must conduct a post mortem that includes root cause analysis and documentation of any lessons learned.

For Critical or High incidents affecting customers, the incident lead must communicate findings broadly within the organization and present lessons learned to prevent future occurrences. For Medium and Low incidents, a written post-mortem in the incident ticket and discussion within the engineering team is sufficient. Additional training should be conducted if warranted by the nature of the incident.

Depending on the severity of the incident, the Chief Executive Officer (CEO) may elect to contact external authorities, including but not limited to law enforcement and government organizations as part of the response to the incident. Where necessary, the CEO must take disciplinary action if a user's activity is deemed as malicious.

Low-risk severity incidents are handled through streamlined processes focused on documentation and routine review. These incidents generally do not require immediate escalation or extensive investigation, as they pose minimal impact to operations, security, or compliance. Upon identification, the responsible team member records the incident in the designated tracking system and creates a ticket when appropriate. In some cases, a brief review and notation are sufficient without the need for a formal ticket. All low-risk incidents are periodically reviewed to identify trends, ensure accuracy of documentation, and determine whether any follow-up actions or preventative improvements are needed.

External Contact Details

The following external contacts are maintained for incident escalation when needed:

- FBI Cyber Division (IC3 — Internet Crime Complaint Center)
- Cyber insurance carrier breach response hotline
