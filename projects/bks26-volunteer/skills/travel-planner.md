---
name: bks26-travel-planner
description: Helps BKS26 volunteers plan travel to the festival site on a specific day. Covers shuttle bus (Friday only), car navigation, and the Thursday car-access window. All transport data is baked in — no external API needed for standard queries.
---

# BKS26 Travel Planner

<!-- C1: Transport knowledge baked in as a skill. No transport API, no Google Maps MCP, no real-time lookup needed for the standard travel questions that arise during the festival week. -->
<!-- C4 (Instance 2 — Logistics): This skill is the primary tool for the Logistics instance. Pre-festival, Instance 2 uses this to confirm route and schedule details before they're needed at the gate. -->

## When to Use This Skill

Activate when a volunteer asks:
- "How do I get to the festival?"
- "Is there a bus from Tilburg?"
- "Can I drive on Saturday?"
- "Where do I park?"
- "What time does the shuttle leave?"

**Model guidance (C3):** Use **Haiku** for standard day-specific lookups. Use **Sonnet** if the volunteer has a multi-leg journey, a late-night return query, or is combining travel days.

---

## Festival Site Address

**Speelland Beekse Bergen**
5081 NJ Hilvarenbeek, Netherlands

When navigating by car or mapping app, use: **Speelland Beekse Bergen, 5081 NJ** as the destination.

---

## Day-by-Day Transport Guide

### Thursday 12 June — Arrival Day

| Option | Available | Details |
|--------|-----------|--------|
| Car | Yes, with restriction | Drive to the crew campsite. **Car access closes at 20:00 on Thursday.** Arrive before 20:00 or you will not be able to drive in. |
| Public bus | Check local schedules | Normal regional bus service may be available Thu. Verify via 9292.nl for current schedules. |
| Shuttle bus | No | Shuttle bus only operates Friday. |

**Thursday key action:** If arriving by car, plan to reach the crew campsite by 19:45 at the latest to allow for any traffic or parking delays before the 20:00 gate close.

---

### Friday 13 June

| Option | Available | Details |
|--------|-----------|--------|
| Shuttle bus | **Yes — Friday only** | Departs Tilburg Centraal station. Operating window: **09:00–20:00**. Fare: **€14 per person**. |
| Car | Yes | Navigate to Speelland Beekse Bergen, 5081 NJ. |
| Public bus | **No** | No public bus service from Tilburg on Friday. |

**Friday note:** The shuttle bus is the only public transport option on Friday. Anyone without a car who did not arrive Thursday must use the Friday shuttle. Ticket purchase details are provided in the volunteer welcome pack — confirm with Sara if unclear.

---

### Saturday 14 June

| Option | Available | Details |
|--------|-----------|--------|
| Shuttle bus | No | Shuttle does not run Saturday. |
| Car | Yes | Navigate to Speelland Beekse Bergen, 5081 NJ. Arrive early — festival car parks fill quickly on Saturday. |
| Public bus | **No** | No public bus service from Tilburg on Saturday. |

**Saturday note:** Car is the only option for Saturday arrivals. Volunteers who do not have a car and did not arrive Thursday or Friday should plan to carpool or arrange a lift. Flag this to Sara in advance.

---

### Sunday 15 June

| Option | Available | Details |
|--------|-----------|--------|
| Shuttle bus | No | Shuttle does not run Sunday. |
| Car | Yes | Navigate to Speelland Beekse Bergen, 5081 NJ. |
| Public bus | **No** | No public bus service from Tilburg on Sunday. |

**Sunday note:** Same situation as Saturday — car or pre-arranged lift only.

---

### Monday 16 June — Departure Day

| Option | Available | Details |
|--------|-----------|--------|
| Shuttle bus | No | Shuttle does not run Monday. |
| Car | Yes | Site access is open for departure. |
| Public bus | Check local schedules | Normal regional service may have resumed Monday. Verify via 9292.nl. |

---

## Quick Reference — Transport Availability

| Day | Shuttle bus | Car | Public bus |
|-----|------------|-----|------------|
| Thu 12 Jun | No | Yes (until 20:00) | Check locally |
| Fri 13 Jun | **Yes, 09:00–20:00, €14** | Yes | **No** |
| Sat 14 Jun | No | Yes | **No** |
| Sun 15 Jun | No | Yes | **No** |
| Mon 15 Jun | No | Yes | Check locally |

---

## Parking & Navigation Notes

- **GPS destination:** Speelland Beekse Bergen, 5081 NJ Hilvarenbeek
- Festival signage will direct you from the main road once you are in the Hilvarenbeek area
- Crew/volunteer car parking is separate from public guest parking — follow **crew access** signs and present your volunteer accreditation at the gate
- Thursday car access closes at **20:00** — this is a hard cutoff, not a guideline

---

## What the Logistics Instance Should Do Pre-Festival (C4)

Before Thursday 12 June, Instance 2 (Logistics) should:

1. Confirm the Friday shuttle bus booking/ticketing process (check volunteer welcome pack or contact Sara)
2. Note any road closure or event-day traffic advisories near Hilvarenbeek
3. Check weather forecast for the festival weekend — flag to Coordinator if rain is forecast (impacts outdoor tasks: Parking Management, Ecoteam, Campsite tasks)
4. Confirm crew campsite gate location matches navigation instructions
5. Save a brief pre-festival logistics note to `.claude/sessions/pre-festival-logistics.tmp`

---

## Example Prompts

```
"I'm arriving Saturday — how do I get there?"
→ On Saturday, the only option is by car. Navigate to Speelland Beekse Bergen, 5081 NJ. Follow crew access signs and show your volunteer accreditation at the gate. There is no shuttle bus or public bus on Saturday.

"What time does the Friday shuttle leave Tilburg?"
→ The shuttle bus runs from Tilburg Centraal station, operating window 09:00–20:00 on Friday only. Fare is €14. Check your volunteer welcome pack or contact Sara for ticket details.

"Can I drive to the campsite on Thursday evening?"
→ Yes, but car access to the crew campsite closes at 20:00 on Thursday. Plan to arrive by 19:45 at the latest.

"Is there a bus on Sunday?"
→ No public bus and no shuttle bus on Sunday. Car or pre-arranged lift only.
```
