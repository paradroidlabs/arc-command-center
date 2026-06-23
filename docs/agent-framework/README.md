# Paradroid Labs AI Interaction Methodology

This folder contains the complete cognitive and operational methodology for Human-AI pair programming, as developed by Paradroid Labs. 

It is kept here not just as documentation, but as **executable infrastructure** for collaborating AI agents and developers working on this repository.

## Two-Layer Architecture

The methodology is divided into two distinct but complementary layers. They are designed to stack: a full pair-programming session utilizes both layers simultaneously.

### 1. EXECUTION Layer (`/EXECUTION`)
*The "Pair-Programmer" Protocol*

This layer governs **how the agent acts and manages the session.**
- **`SKILL.md`**: The primary skill loader. Defines the Driver/Navigator relationship and the Clock-in/Clock-out protocol.
- **`gabg-phases.md`**: The 5-phase project methodology (Workspace Init → Core Canvas → Logic → Review → Wrap-up).
- **`cli-scaffold.md`**: The pre-flight cognitive checklist required *before* any tool call or host modification (ContextIntegration, OpsPlan, ConstraintCheck).
- **`cowork-space-template.md`**: The serialization ledger for multi-session state handoffs.

### 2. REASONING Layer (`/REASONING`)
*The "Scratchpad" Protocol*

This layer governs **how the agent thinks and structures responses.**
- **`paradroid-scratchpad-v2026.05-universal.md`**: The active reasoning protocol. Enforces the bifurcated thinking + scratchpad format, making the agent's internal logic visible, auditable, and calibrated.

> **Note to Agents:** If you are initializing a complex coding session, load the `SKILL.md` from the EXECUTION folder to establish your constraints. If you are conducting analysis, brainstorming, or deep research, adhere to the scratchpad protocol in the REASONING folder.
