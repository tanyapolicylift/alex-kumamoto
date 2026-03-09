### **Purpose**

The purpose of this policy is to establish management direction and high-level objectives for the change management process. This policy guides the implementation of changes to reduce the impact on other tasks/projects as well as to mitigate associated risks such as:

- Information being corrupted and/or destroyed

- Adverse impact on other organizational processes

- Computer performance being disrupted and/or degraded

- Productivity losses being incurred

### **Scope**

This policy applies to all IT systems and applications managed by PolicyLift that store, process or transmit information, including network and computer hardware, software and applications, mobile devices, and telecommunication systems. In addition, it applies to personnel and business functions that utilize PolicyLift’s information resources.

### **Policy**

Changes to information resources shall be managed and executed according to a formal change control process. The change control process will ensure that proposed changes are reviewed, authorized, tested, implemented, and released in a controlled manner, and that the status of each proposed change is monitored.

In order to fulfill this policy, the following statements shall be adhered to:

- A current baseline configuration of the information systems and its components shall be developed, documented and maintained.

- The baseline configuration of the information systems shall be updated as appropriate as part of system component installation and updates.

- Changes to the information system shall be authorized, documented, and controlled by the use of formal change control procedures.

- Changes in the configuration of the information systems shall be monitored where feasible.

- Automatic tools may be employed where appropriate to support change requests, approvals, and recordkeeping.

- Changes to application and system infrastructure are developed and tested in a separate development or test environment or validated through other reasonable methods before implementation.

- Changes that can’t follow the regular process because of their urgency (such as service outage or security events) shall be considered emergency changes and require immediate priority.

- Changes that are a normal administrative function or process within a system can be classified as standard changes.

- Changes affecting customers in a significant manner shall be communicated to them when appropriate prior to change implementation.

## **Change Approval and Implementation**

Developers do not make changes to application code in the production environment without appropriate authorization or controls. Code repository branch rules or equivalent safeguards are implemented to ensure that merges to the production environment require review or approval.

- Changes shall be approved as appropriate prior to implementing the change into the live environment.

- Source code changes are logged, time-stamped, and attributed to their author in a source code management tool. Access to the source code tool is restricted to authorized users using multi-factor authentication.

- Changes shall be assigned to an appropriate individual or role responsible for authorization based on the nature and impact of the change.

### **Communication of Change**

A communication procedure is maintained that describes how employees and customers are notified of:

- Potential application outages

- Planned or unplanned downtime

- Material changes to application functionality

- Security events and major releases

Internal and external system users are notified through appropriate communication channels when system changes are expected to materially affect usage, responsibilities, or customer commitments.

### **Post-Implementation Review**

Once a change has been implemented, it is important that the situation is reviewed to identify any problems that could be prevented in the future or improvements that could be made.

Post-implementation reviews shall be performed when warranted based on risk, impact, or observed issues to evaluate whether the desired result has been achieved.

In the event a change does not perform as expected or causes issues within the production environment, appropriate personnel will determine corrective actions, including rollback where necessary.

###  **Denials**

The business owner, change advisory function, or their designee may deny a scheduled or unscheduled change based on considerations such as:

- Inadequate planning or testing

- Security risks

- Operational impact

- Timing concerns

### **Emergency Changes**

Changes that cannot follow the regular process because of their urgency (such as service outage or security incidents) shall be considered emergency changes and require immediate attention.

Approvals for emergency changes may be obtained through expedited communication with an appropriate authority. Such changes shall be documented and reviewed retrospectively.

Emergency changes may be reviewed to assess lessons learned, root cause, and impact where appropriate.

### **Standard Changes and Patching**

Standard changes (also called “routine changes”) tend to be pre-authorized changes that are considered to have little to no risk associated with them. These changes may be executed through documented operational procedures without requiring full change approval workflows.

All systems shall be patched and updated using a risk-based approach. Common Vulnerability Scoring System (CVSS) or other severity frameworks may be used to aid in prioritization.

Applicable critical vendor-supplied security patches shall be applied within a timeframe appropriate to the severity and risk posed.

Vulnerabilities deemed critical by PolicyLift shall be remediated as soon as reasonably practicable, considering exploitability and operational impact.
