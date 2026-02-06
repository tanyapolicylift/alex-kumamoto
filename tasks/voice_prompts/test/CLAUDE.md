# Voice Prompt A/B Test Suite

## Purpose

Side-by-side comparison of conversation outputs using control (old prompts) vs test (new prompts).

## Structure

- `XX_control.md` - Conversation output from live call using original prompts
- `XX_test.md` - Same call scenario replayed using new prompts

10 test pairs (01-10), 20 files total.

## Workflow

1. Pull a live call transcript
2. Paste the control output into `XX_control.md`
3. Replay the same caller inputs with new prompts
4. Paste the test output into `XX_test.md`
5. Run semantic analysis comparing each pair

## Analysis

### Semantic Comparison
- Intent preservation
- Information accuracy
- Routing correctness

### Conversational Quality
- Clarity
- Efficiency (turns to resolution)
- Naturalness
- Error handling

### Scoring (1-5)
- 1: Significantly worse
- 2: Noticeable degradation
- 3: Equivalent
- 4: Noticeable improvement
- 5: Significant improvement
