
![[Screenshot 2026-01-27 at 4.51.22 PM 1.png]]# Output Requirements

### 1. ACORD

[Acord 125/126 Primer](https://drive.google.com/file/d/1NqTJb9HvcnHlQMPjHHCLi9H2J6KIBF9V/view?ts=697923ae "https://drive.google.com/file/d/1NqTJb9HvcnHlQMPjHHCLi9H2J6KIBF9V/view?ts=697923ae")

Example ACORD form: [https://www.canngenins.com/cdn/files/images/acord-125-126-140.pdf/](https://www.canngenins.com/cdn/files/images/acord-125-126-140.pdf/ "https://www.canngenins.com/cdn/files/images/acord-125-126-140.pdf/")

Ironclad Explains ACORD: [https://fathom.video/calls/541371212](https://fathom.video/calls/541371212 "https://fathom.video/calls/541371212"), 28:15

- ACORD 125
    
    - Applicant Info

    - Biz Contact Info
        
    - Biz Address
        
    - Nature of Business
        
        - Can always default to Other and dump in context
            
    - Tons of Yes/No Questions
        
        - Default to No, and flag for when we do need a Yes
            
    - Pranay didn’t mention Loss Runs, but assume we need that section filled out?
        
- ACORD 126
    
    - More detailed property info
        
    - Very situational (should just focus on only top 10 products and which sections they require - Ironclad does Contractors)
        
        - Ex: claims made only like 10% of time
            
        - Ex: Employee benefits section only if doing that
            
        - Ex: Contractors whole section, only if you’re doing construction
            
        - Ex: Products / Completed Operations Section - not necessary unless you’re doing physical product
            

### 2. Rater

[Rater Primer](https://docs.google.com/document/d/1i45fp4-tgAJrNLYACWhLjVEJ8oWrnW8c/edit "https://docs.google.com/document/d/1i45fp4-tgAJrNLYACWhLjVEJ8oWrnW8c/edit")

[QQCatalyst Rater Screenshots](https://docs.google.com/document/d/1ntZAp31JMYcX_eNOYMAaGPJMzNtUWmt9tseNybkJuRM/edit?usp=sharing "https://docs.google.com/document/d/1ntZAp31JMYcX_eNOYMAaGPJMzNtUWmt9tseNybkJuRM/edit?usp=sharing")

- Client Information
    
- Auto Vehicle Information
    
- Incident Information
    
- Choose Carriers
    

### (3. Carrier Portals - Skip for now)

Wholesalers Portal example from Pranay: [https://fathom.video/calls/541371212](https://fathom.video/calls/541371212 "https://fathom.video/calls/541371212"), 33:00

### (4. Supplementals - Skip for now)

# Output Methods

### Super Copy Paste

Chrome extension to intelligently surface and prefill info

### Browser Automations

### Automation SaaS

Zapier has integrations with several raters

### API

# Packet Modeling Requirements

- For ACORDs
    
    - We need a **flexible** framework that can model the RIGHT fields for a packet or use case and intelligently mark only certain fields as required / having “intake priority”
        
        - Think of templates which are not just indicating which fields are “required” but also dependencies (if this field, you should now focus on that field) and guidance (if this field, that field should now be filled out in this way…)
            
            - **TBD**: What level of depth does Broker Buddha take this to?
                
                - [Broker Buddha loom walkthrough](https://www.loom.com/share/246876619e284d1ba57138f7b3b0d645 "https://www.loom.com/share/246876619e284d1ba57138f7b3b0d645")
                    
                    - [Screenshots of key screens](https://docs.google.com/document/d/1CBZr-L21igf9ia8LgjaBw-4TsJc--3BlO5Kw0qmpcMw/edit?tab=t.0 "https://docs.google.com/document/d/1CBZr-L21igf9ia8LgjaBw-4TsJc--3BlO5Kw0qmpcMw/edit?tab=t.0")
                        
                - GL-125
                    
                    - Applicant Information
                        
                    - Contact Information
                        
                    - Location Information
                        
                    - Description of Business
                        
            - Can we do this in a way that doesn’t exponentially increase complexity
                
        - We need to have “pre-baked” templates but then also allow the customer to introduce their personal “flavor” - domain context for their specific agency
            
- Abstract Modeling
    
    - Personal lines - can they be reduced to only two concepts?
        
        - People, Assets
            
    - Commercial lines - can they be reduced to four concepts?
        
        - Applicant, Business, People, Assets
            
    - Packet
        
        - Fields, field dependencies, and “rules”
            
    - 1/30 Pranay Insights
        
        - Validated commercial lines setup
            
        - Intelligence layer
            
            - Templates for use cases (ex: construction worker in CA, wants WC) - we can **PREFILL many fields or highlight fields that are essential to intake. We can provide Natural Language heuristics that unlock or stress other fields/situations based on certain field results or info.**
                
                - If LLM has knowledge of fields and their descriptions, it can intake natural language instructions and then perform actions like: prefill, flag, warn
                    
                    - We could group groups of field with semantic meaning (the Additional Automobile section, etc)
                        
            - Also ID’d Separate problem - especially for lower value clients I just want to know the 1-2 best markets/carriers to go shop and go do it. There is actually INCENTIVE for me to stop when I’m upper 10-20% (If I waste more energy going after better rate, I’m spending energy to just actively take away my commission and it’s likely not to move the needle on winning deal). So can we do current policy carrier analytics to RECOMMEND the right carrier/market for the deal? (Note this may be a Pranay-only/up market Commercial problem only)
                

### Packet Management

Opportunity for AI-powered intelligence and rule management

# Packet Intake: Structured Fields and Forms

Highlight key fields for custom forms, or synthesize structured data.

# Existing Info: Voice Analysis

# (Packet Intake: Document Upload and Analysis)

# V0 Spec Concepts

_Fed this Spec-in-progress into V0 via some prompt refinement and got some rough concepts and ideas for discussion:_


