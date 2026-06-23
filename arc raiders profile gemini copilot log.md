<holistically review>

Your choice will help Gemini give you more helpful responses. Loading the response may take a moment.  
Choice A  
Skill: ArcRaidersContextLoader (ARCL)  

1. Description  
   A structured context-injection framework designed to maintain persistent state for the user's ARC Raiders profile. It tracks historical performance, map mastery, and dynamic active objectives to provide highly personalized, statistically backed tactical advice.  

2. Trigger / Invocation  
   Command: @skill: ARCLInput: [optional_delta_updates] (e.g., "Add 1 failed raid to Dam, found 1 respirator")  

3. Core Directives  
   Load State: Ingest the YAML block below as the absolute source of truth for the user's capabilities and risk tolerance.  

Apply Bias: Default to PVE, high-container-density, stealth-oriented strategies. Override general community meta if it conflicts with the user's specific map survivability stats.  

Update State: When the user reports new raid results, amend the YAML variables and provide a newly formatted copy/paste block for the user to export and save.  

4. Current State Payload (Copy/Paste Export)  
   YAML  
   arc_raiders_profile_state:  
   metadata:  
   last_updated: "2026-06-18"  
   schema_version: "1.0"  

player_identity:  
username: "paradroid"  
playstyle_bias: "PVE-Focused / Stealth / Container Looter"  

global_statistics:  
hours_topside: 121  
total_raids: 456  
successful_extractions: 345  
survival_rate_overall: "75.6%"  
player_kills: 2  
arc_kills: 1832  
avg_containers_per_raid: 10.4  
net_profit_seeds: 2500000  

map_mastery:  
buried_city:  
raids_completed: 109  
survival_rate: "85%"  
net_income: 1300000  
designation: "Primary Home Turf / Highest Efficiency"  
spaceport:  
survival_rate: "79%"  
designation: "Reliable Secondary"  
the_dam:  
status: "Hostile / Bad RNG / Closed Hatches"  
designation: "Avoid for rare farming"  
riven_tides:  
designation: "Avoid (Low drop rates / Heavy Turbine density)"  

active_objectives:  
expeditions:  
status: "Completed"  
projects:  

- name: "Trophy Display (Stage 2: Soaring Menaces)"  
  target_item: "Expired Respirator"  
  amount_needed: 3  
  current_strategy: "Buried City Hospital container/surface scanning"  
  weekly_trials:  
  week: "June 15 - 21, 2026"  
  goal: "Maximize division rank (3000 pt / 3-Star thresholds)"  
  active_strats:  
- "Old Town ARC damage (Buried City)"  
- "Comet sniping from roofs (Buried City / Storm conditions)"  
- "6-Scanner Wolfpack Exploit for multi-kills"  
- "Blue Gate collapsed highway loop (Search 15 Cars)"  

inventory_state:  
safe_pocket_slots: 3  
critical_warnings: "Backpack full (20/20). Safe pocket management prioritized for rare extracts."  
Choice B  
Markdown  

# Skill: ARC_ProfileContext (APC)

## 1. Description

A structured framework designed to maintain persistent player state, statistical history, map affinities, and current progression goals for ARC Raiders. This enables the AI assistant to provide highly personalized, data-backed tactical advice and session tracking without needing to re-explain player history.  

## 2. Trigger / Invocation

**Command:** `@skill: APC`  
**Input:** `[optional_session_updates]`  

## 3. Core Directives

When invoked, process current gameplay updates through the following pipeline:  

1. **Stat Tracking:** Update raid counts, survival rates, container averages, and seed economy.  
2. **Objective Management:** Shift active quests, Trophy Display needs, and Weekly Trial targets.  
3. **Session Logging:** Record significant raid outcomes (e.g., missed extractions, successful safe-pocket swaps).  
4. **Context Output:** Regenerate the YAML state block below for the user to copy/paste and inject into future sessions.  

## 4. Current Player State (YAML Reference Block)

```yaml  
player_state:  
username: "paradroid"  
playstyle_archetype: "PVE-Focused Stealth Looter"  

global_statistics:  
total_raids: 456  
successful_extractions: 345  
overall_survival_rate: "75.6%"  
player_kills: 2  
arc_kills: 1832  
net_profit_seeds: 2500000  
avg_containers_per_raid: 10.4  

map_affinities:  
buried_city:  
raids: 109  
survival_rate: "85%"  
net_profit: 1300000  
status: "Primary / Home Turf"  
spaceport:  
survival_rate: "79%"  
status: "Secondary / Reliable"  
dam_battlegrounds:  
status: "Avoid / Low RNG / Historically Bad Luck"  
riven_tides:  
status: "Avoid / Rarely Played"  

active_objectives:  
expedition: "Completed"  
trophy_cabinet:  
current_stage: "Stage 2: Soaring Menaces"  
target_item: "Expired Respirator"  
quantity_needed: 2  
weekly_trials:  
goal: "Maximize points (3,000 threshold for 3-stars)"  
current_focus: "Buried City stacking (Old Town ARC damage, Comets, etc.)"  

recent_session_events:  

- "Attempted Dam Battlegrounds Testing Annex for Expired Respirator."  
- "Missed Red Lakes Balcony extraction by 11 seconds due to Wasp engagement greed."  
- "Confirmed preference to stick to high-survival PVE loops in Buried City moving forward."  

<holistically review>  
both responses gemini is presenting me for "tuning"  
</holistically review>

<chat>
**Assessing Initial Options**

I've begun dissecting the user's choices, focusing on *ARC Raiders* profile structure options, and the user's tuning goals.

**Analyzing Profile Accuracy**

I've evaluated the two context options, assessing the accuracy and structure of YAML-based profiles, focusing on data freshness and detailed raid analysis.

**Synthesizing Feedback Elements**

I've integrated session event logging, active objective granularity and applied user bias into an improved prototype.

Both of these are masterclasses in prompt engineering for state management. You are essentially building a localized "memory drive" for the LLM to ingest before every session so it doesn't give you generic, mismatched advice.

Holistically, **Choice A is the stronger structural framework**, but **Choice B has a killer feature** that Choice A is missing.

Here is the breakdown of why, and how to combine them into the ultimate state-tracker, especially since we need to update your numbers based on that fresh ARCTracker screenshot you just shared.

### 🏆 Why Choice A is the Better Framework

- **The "Apply Bias" Directive:** This is the most powerful line in either prompt. Telling the AI to *"Override general community meta if it conflicts with the user's specific map survivability stats"* is brilliant. It hardcodes your PVE/Stealth preference so the AI stops suggesting naked PVP runs.

- **Granularity of Objectives:** Choice A tracks the *exact* strategies you are using for the Weekly Trials (Old Town ARC, Comet sniping, Wolfpack exploit). Choice B summarizes it too much, which means the AI might forget *how* you were planning to get those 3,000 points.

- **Inventory Warnings:** Tracking the Safe Pocket space is a great touch for an extraction shooter context.

### 💡 Why Choice B's "Killer Feature" is Worth Stealing

- **`recent_session_events`:** Choice B includes a narrative log of your last session. Tracking the *story* of your raids (e.g., "Missed Red Lakes Balcony extraction by 11 seconds") gives the AI massive conversational context. It allows the AI to act like a co-op partner who actually remembers your last match, rather than just a spreadsheet reader.

### 🔧 The Reality Check (Based on your Screenshot)

Both choices are using stale data! Your live ARCTracker screenshot shows you've been busy:

- Your total raids are now **458** (up from 456).

- Your successful extractions are **346** (up from 345).

- Your overall survival rate ticked up to **76%**.

- **The Dam confirmed its hostile status:** You just died there at 5:15 AM and lost 87K.

- **Buried City remains the GOAT:** You extracted there at 12:15 AM with a massive 42K profit and 18 ARC kills.

---

### The Synthesized "God-Tier" Profile Block

To get the absolute best results moving forward, you should use the directive structure of **Choice A**, inject the session logging from **Choice B**, and update the math using your **live screenshot**.

Here is the holistic, tuned version you should save to your clipboard:

YAML

```
arc_raiders_profile_state:
  metadata:
    last_updated: "2026-06-18"
    schema_version: "2.0"

  player_identity:
    username: "paradroid"
    playstyle_bias: "PVE-Focused / Stealth / Container Looter"
    ai_directive: "Always default to high-survival PVE loops. Override community PVP meta if it conflicts with player's map survival stats."

  global_statistics:
    total_raids: 458
    successful_extractions: 346
    survival_rate_overall: "76%"
    net_profit_seeds: 2500000
    avg_extraction_value: "+7K"
    total_time: "121h 41m"

  map_mastery:
    buried_city:
      status: "Primary Home Turf / Highest Efficiency"
      recent_performance: "Extracted +42K with 18 ARC kills (Solidified dominance)"
    the_dam:
      status: "Hostile / Bad RNG / Avoid for rare farming"
      recent_performance: "Died (-87K lost) confirming it as a high-risk zone."
    spaceport:
      status: "Reliable Secondary"
    the_blue_gate:
      status: "Consistent / High volume farming"

  active_objectives:
    projects:
      - name: "Trophy Display (Stage 2: Soaring Menaces)"
        target_item: "Expired Respirator"
        current_strategy: "Buried City Hospital container/surface scanning"
    weekly_trials:
      week: "June 15 - 21, 2026"
      goal: "Maximize division rank (3000 pt / 3-Star thresholds)"
      active_strats: 
        - "Old Town ARC damage (Buried City)"
        - "6-Scanner Wolfpack Exploit for multi-kills"
        - "Blue Gate collapsed highway loop (Search Cars)"

  recent_session_events:
    - "Attempted Dam Battlegrounds for a quick run, died and lost 87K. Confirmed preference to stick to Buried City moving forward."
    - "Followed up with a highly successful 24-minute Buried City clear (+42K)."
```

Since the Dam just burned you for 87K, are you officially crossing it off the list for your Expired Respirator hunt, or are you willing to give the Testing Annex one more naked run to get the last masks?

oh, i managed to go back and get things done. lol. see the update. i did get knocked out at the end but decided to use a survivor augment, so i was able to crawl to the hatch. with like....90ish seconds left.

Code snippet

```
[AntiCompressionHeuristic: ACTIVE. Processing delta update to ARCL/APC context profile based on user's verbal report of a clutched Dam Battlegrounds extraction.]
[ContextSanityCheck: User returned to The Dam after the previously logged 87K loss, secured the Expired Respirators ("got things done"), was knocked out, but used a Survivor Augment to crawl to the extraction hatch with ~90 seconds remaining. Total raids increment to 459, extractions to 347.]
[ClarityAccuracyGoal: Validate the high-tension clutch play. Output the updated YAML state block reflecting the completed objective and the new raid stats. Maintain peer-level tactical tone.]
[ConstraintCheck: Serialize exploration question to Q18 to satisfy the strict anti-drift ledger constraints established in the C2MD block.]
[FinalCheck name="Delta.Update.Execution"]: Profile updated. Generating artifacts.
```

That is exactly why you keep a Survivor Augment in the loadout. Crawling to the hatch with the timer bleeding down to 90 seconds after getting knocked is peak extraction-shooter tension. There is absolutely no feeling in gaming quite like watching that extraction bar fill while you are bleeding out on the floor.

Since you "got things done," I am officially marking Stage 2 of the Trophy Display as complete and updating your Dam Battleground status from a total write-off to a clutched victory. You beat the map, beat the RNG, and secured the masks.

Here is your updated God-Tier Profile Block. Notice the global stat bumps (459 raids, 347 extractions) and the new session log capturing the clutch:

YAML

```
arc_raiders_profile_state:
  metadata:
    last_updated: "2026-06-18"
    schema_version: "2.1"

  player_identity:
    username: "paradroid"
    playstyle_bias: "PVE-Focused / Stealth / Container Looter"
    ai_directive: "Always default to high-survival PVE loops. Override community PVP meta if it conflicts with player's map survival stats."

  global_statistics:
    total_raids: 459
    successful_extractions: 347
    survival_rate_overall: "75.6%"
    net_profit_seeds: "2500000+"
    avg_extraction_value: "+7K"
    total_time: "122h"

  map_mastery:
    buried_city:
      status: "Primary Home Turf / Highest Efficiency"
      recent_performance: "Extracted +42K with 18 ARC kills (Solidified dominance)"
    the_dam:
      status: "Hostile but Conquered / Objective Complete"
      recent_performance: "Knocked at the end, clutched the extraction via Survivor Augment crawl with ~90s left."
    spaceport:
      status: "Reliable Secondary"
    the_blue_gate:
      status: "Consistent / High volume farming"

  active_objectives:
    projects:
      - name: "Trophy Display (Stage 2: Soaring Menaces)"
        status: "COMPLETED (Expired Respirators secured)"
    weekly_trials:
      week: "June 15 - 21, 2026"
      goal: "Maximize division rank (3000 pt / 3-Star thresholds)"
      active_strats: 
        - "Old Town ARC damage (Buried City)"
        - "6-Scanner Wolfpack Exploit for multi-kills"
        - "Blue Gate collapsed highway loop (Search Cars)"

  recent_session_events:
    - "Attempted Dam Battlegrounds for a quick run, died and lost 87K. Confirmed preference to stick to Buried City moving forward."
    - "Followed up with a highly successful 24-minute Buried City clear (+42K)."
    - "DELTA UPDATE: Returned to the Dam to finish the Trophy project. Got knocked, but popped a Survivor Augment and crawled to the hatch with 90 seconds left. Objective secured."
```

### Exploration

**Q18:** The Survivor Augment acts as a localized, single-use "save state" that buys you a second chance, directly subverting the immediate consequence of death in the Gray Zones. In a game economy currently plagued by zero-risk gray-market duping, does the legitimate use of high-cost consumable safety nets (like the Augment) enhance the "Magic Circle" by rewarding preparation, or does it slightly numb the necessary friction of survival?
</chat>

---

arc_raiders_profile_state:
  metadata:
    last_updated: "2026-06-18"
    schema_version: "1.0"

  player_identity:
    username: "paradroid"
    playstyle_bias: "PVE-Focused / Stealth / Container Looter"

  global_statistics:
    hours_topside: 121
    total_raids: 456
    successful_extractions: 345
    survival_rate_overall: "75.6%"
    player_kills: 2
    arc_kills: 1832
    avg_containers_per_raid: 10.4
    net_profit_seeds: 2500000

  map_mastery:
    buried_city:
      raids_completed: 109
      survival_rate: "85%"
      net_income: 1300000
      designation: "Primary Home Turf / Highest Efficiency"
    spaceport:
      survival_rate: "79%"
      designation: "Reliable Secondary"
    the_dam:
      status: "Hostile / Bad RNG / Closed Hatches"
      designation: "Avoid for rare farming"
    riven_tides:
      designation: "Avoid (Low drop rates / Heavy Turbine density)"

  active_objectives:
    expeditions:
      status: "Completed"
    projects:
      - name: "Trophy Display (Stage 2: Soaring Menaces)"
        target_item: "Expired Respirator"
        amount_needed: 3
        current_strategy: "Buried City Hospital container/surface scanning"
    weekly_trials:
      week: "June 15 - 21, 2026"
      goal: "Maximize division rank (3000 pt / 3-Star thresholds)"
      active_strats: 
        - "Old Town ARC damage (Buried City)"
        - "Comet sniping from roofs (Buried City / Storm conditions)"
        - "6-Scanner Wolfpack Exploit for multi-kills"
        - "Blue Gate collapsed highway loop (Search 15 Cars)"

  inventory_state:
    safe_pocket_slots: 3
    critical_warnings: "Backpack full (20/20). Safe pocket management prioritized for rare extracts."


