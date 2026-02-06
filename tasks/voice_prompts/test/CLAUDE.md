# Voice Prompt A/B Test Suite

## Purpose

This directory contains side-by-side conversation output files for comparing control (old prompts) vs test (new prompts) in the voice_prompt system.

## Test Strategy

### Structure
- **Control files** (`*_control.md`): Conversations generated using the original/baseline prompts
- **Test files** (`*_test.md`): Conversations generated using the new/experimental prompts

### Test Cases

| # | File Prefix | Scenario |
|---|-------------|----------|
| 1 | `01_inbound_general` | General inbound inquiry |
| 2 | `02_appointment_booking` | Standard appointment scheduling |
| 3 | `03_reschedule_request` | Caller wants to change existing appointment |
| 4 | `04_cancel_request` | Caller wants to cancel |
| 5 | `05_specific_person` | Asks for a specific person by name |
| 6 | `06_complex_routing` | Ambiguous routing scenario |
| 7 | `07_returning_caller` | Caller with prior agency interaction |
| 8 | `08_urgent_matter` | High-priority/time-sensitive request |
| 9 | `09_information_only` | Caller just needs information, no booking |
| 10 | `10_edge_case` | Edge case / error handling scenario |

## Analysis Method

### 1. Semantic Analysis
Compare the semantic similarity and intent preservation between control and test outputs:
- Does the test version maintain the same intent?
- Are key information elements preserved?
- Is the tone appropriate?

### 2. Conversational Quality Comparison
Evaluate each pair on:
- **Clarity**: How clear is the communication?
- **Efficiency**: Number of turns to resolution
- **Accuracy**: Correct routing/information provided
- **Naturalness**: Does it sound human-like?
- **Error Handling**: How gracefully are issues handled?

### 3. Scoring Rubric
Rate each dimension 1-5:
- 1: Poor - significantly worse than baseline
- 2: Below average - noticeable degradation
- 3: Equivalent - no meaningful difference
- 4: Better - noticeable improvement
- 5: Excellent - significant improvement

## How to Use

1. Generate conversations for each scenario using both prompt versions
2. Paste control output into `*_control.md` files
3. Paste test output into `*_test.md` files
4. Run semantic analysis comparing each pair
5. Document findings in a summary report

## File Naming Convention

```
{number}_{scenario_name}_control.md
{number}_{scenario_name}_test.md
```
