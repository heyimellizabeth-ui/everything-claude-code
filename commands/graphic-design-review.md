---
description: Analyse design images from multiple professional graphic designer perspectives via the LLM Council's 3-stage deliberation
---

# /graphic-design-review

Sends design images to the LLM Council (multi-model deliberation system) for parallel critique from 4 frontier AI models, anonymised peer ranking, and a synthesised chairman verdict — all through a professional graphic designer lens.

## Usage

```
/graphic-design-review [image_path1] [image_path2] ...
```

If no paths are provided, analyse any images already visible in the conversation.

## Workflow

1. **Read & encode images** — For each provided image path, read the file and base64-encode it:
   ```bash
   base64 -w0 <image_path>
   ```

2. **Construct the graphic design prompt** — Wrap the query in a professional design critique framing:

   ```
   You are a senior professional graphic designer with 15+ years of experience in brand identity,
   editorial design, and digital media. Analyse the provided design asset(s) across these dimensions:

   1. Typography — font choices, hierarchy, legibility, pairing
   2. Color palette — harmony, contrast ratios, emotional tone, brand coherence
   3. Composition & layout — balance, alignment, flow, use of white space
   4. Brand identity — clarity of message, memorability, professionalism
   5. Information hierarchy — visual priority, readability at a glance
   6. Target audience fit — does the aesthetic match the intended audience?
   7. Specific improvements — 3–5 actionable, prioritised recommendations

   Be direct and professional. Cite design principles by name where relevant (e.g. Gestalt, CRAP, Swiss/International Style).
   ```

3. **Create a conversation** — POST to the LLM Council to get a conversation ID:
   ```bash
   curl -s -X POST http://localhost:8001/api/conversations \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

4. **Send to the council** — POST the prompt + base64 images to the conversation:
   ```bash
   curl -s -X POST http://localhost:8001/api/conversations/{conversation_id}/message \
     -H "Content-Type: application/json" \
     -d '{
       "content": "<graphic design prompt>",
       "images": ["<base64_image_1>", "<base64_image_2>"]
     }'
   ```

5. **Display results** — Format the 3-stage response for the user:

   **Stage 1 — Individual Model Critiques**
   Show each model's analysis in a labelled section. These are the 4 independent perspectives.

   **Stage 2 — Peer Rankings**
   Show how models ranked each other's critiques. Note patterns of agreement and strongest consensus picks.

   **Stage 3 — Chairman's Synthesis**
   The synthesised verdict: consolidated findings, prioritised recommendations, and overall design assessment.

## Notes

- The LLM Council backend must be running at `http://localhost:8001`
- All 4 council models (GPT, Gemini, Claude, Grok) support vision via OpenRouter
- Stage 2 rankings are anonymised — models evaluate design quality of peer responses without knowing which model wrote them
- Images are sent to Stage 1 and Stage 3; Stage 2 works on text (the written critiques themselves)
- If the backend is not running, start it with: `cd /home/user/llm-council && python -m backend.main`
