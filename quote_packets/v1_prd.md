# Goals

1. Minimize time to validation
    
2. Deliver demo-worthy experience that sells vision
    
3. Deliver use-able baseline value to Production Customers
    

---

# Build

### 1. Voice Data → Quote Packet: Basic Fields UX → Export

#### _Basic Fields Data Model_

- Personal lines - can be reduced down to three concepts: Applicant, People, Assets
    
- Commercial lines - can be reduced to four concepts: Applicant, Business, People, Assets
    
- Quote Templates (in the future could be custom per customer, but for now keep to some basic types)
    
    - Type
        
        - GL 125 Basic
            
        - Personal Auto Basic
            
    - Entity pre-fill information
        
- ApplicantTemplate, BusinessTemplate, PeopleTemplate, AssetsTemplate
    
    - (1:many) FieldTemplate - specifies structure, connection to Shared Schemas, etc
        

**todo -** insert specifics! Reference atomic flows charts + screenshots of Rater + ACORD for exact detail

#### _Voice Data → Quote Packet_

Replace “Generate ACORD” button in current call log.

Once activated, immediately try to identify Quote line and use to load in appropriate template. Use template entities to attempt to pre-populate information.

#### _Quote Packet: Basic Fields UX_
![[Screenshot 2026-02-08 at 1.09.12 PM.png]]


 Note that this left side bar is missing Loss Runs and this must be included (could be seen as coverage and compliance)

#### _Export_

Completed packets should have an end-of-journey Export function, determined by template (for now, commercial or personal).

- Commercial - simply generate the pre-tagged ACORD form
    
- Personal - **todo** - scope the easiest pass at chrome extension for Super Paste
    

### 2. Quote Packet Management Screen

In this MVP, we will be lucky if customers generate 1-2 quote packets. We will **not** need to plan for customers managing hundreds of quote packets. Therefore, the packet management experience can just be a basic table and tab, with basic creation option to build a packet and associate it with a call.

---

# Customer Cohorts

**todo -** identify all customers and tag with relevant information and social capital/disposition. Raghav to fill in info on best commercial targets, and supplement any remaining personal targets.

Alex to pull customer success info to determine best targets by quote call volume.

Commercial

- Contractor - ACORD
    
- Ironclad
    
- Coverlink
    

Personal

- Dale Wagner - mostly direct to carrier, not high value for V1
    
- LSM - low activation, EZLynx Rater
    
- All Texas - low volume/high quality- use rater
    
- GOTS - EZlynx Rater
    
- CalWest - PLRater Vertafore - super poor adoption
    
- FOCO - TurboRater
    
- NIA - probably also on a rater
    
- MartinoWest - won’t touch because of PEO
    
- Concise - personal rater users
    
- JAMCO - High volume, Personal Rater
    
- Seguros - QQ, very ideal
    
- Moore -
    

---

# Immediate Follow-ons

If MVP gets traction, there is a huge amount of opportunity for immediate followup. Listing out these and trying to maintain rough priority order:

- Expand ToF potential
    
    - Load in Quote Packets from Forms, Chats
        
- Introduce Workflow-specifics
    
    - Fields, field groups, field dependencies, “rules”, and templates - these represent the right fields and right groups to be shown in certain situations (rules/dependencies) for specific workflows (templates)
        
        - Intelligence layer - use semantic understanding of these concepts for model analysis and provide model with options to tag, suggest, prefill, etc
            
- Introduce Action potential
    
    - Smart forms
        
    - Document parsing
        
- Connect to CXP for pipeline management
    
    - Quote Packets should be associated with Contacts/Accounts
        
    - Quote Packets are the Insurance-specific container of Deals, the best way to manage them at scale will be via CXP Pipeline Stages