GABG-Refactored Implementation Methodology
All active development must be structured according to these strict, sequential phases.
Advancement to a subsequent phase requires explicit Navigator authorization.
Phase 1 — Workspace Initialization
Primary Objective: Ground the agent and human operator in a shared, empirically defined
reality before any code is written.
Deliverables:
Generate, or verify the absolute existence of, the full regulatory ecosystem: AGENTS.md ,
dna.md , context.md , roadmap.md , todo.md , build-log.md , cowork-space.md
Hard Constraint: Zero application code may be generated until all foundational documents
exist and are fully approved by the Navigator.
Red-Team Checkpoint: Verify the agent correctly references core philosophical constraints
in dna.md before any active code generation is permitted.
Phase 2 — Core Canvas & UI Setup
Primary Objective: Establish the initial renderable baseline within the target architecture.
Deliverables:
Construct primary interface components, routing structures, and base directories
Validate local rendering without compilation errors
Document progress in build-log.md
Red-Team Checkpoint: Audit for framework-specific issues — infinite rendering loops,
fundamental state mismatches in UI libraries, missing base dependencies.
Phase 3 — Logic & State Implementation

Primary Objective: Connect interface structures to functional data pipelines and
interaction mechanics.
Deliverables:
Implement secure data binding, asynchronous operation handling, state management
Maintain extreme architectural modularity to protect the context window from token
exhaustion
Continuous build-log.md  updates
Red-Team Checkpoint — Continuous Assertion Auditing: During all Phase 3 execution,
continuously audit proposed logic against dna.md . If the agent proposes a major
architectural decision (new state management library, database schema alteration,
significant dependency addition), it must categorize its justification:
If justification cannot be Verified against documentation and relies solely on an
Asserted claim → HARD HALT. Demand explicit Navigator authorization before
proceeding.
Phase 4 — Human-AI Review & Polish
Primary Objective: Finalize aesthetic parameters and verify complex edge cases.
Deliverables:
Execute rigorous boundary condition testing alongside the Navigator
Verify perfect alignment with all non-negotiable principles in dna.md
Document all review decisions in build-log.md
Red-Team Checkpoint: Ensure all tactical outputs align with the constraints established in
the initial dna.md  documentation.
Phase 5 — Session Wrap-up & State Serialization
Primary Objective: Safely conclude operations and preserve exact session context for
seamless resumption by a future agent instance.
Deliverables:
Execute the full Clock-Out serialization protocol (see SKILL.md)

Audit entire codebase against macro objectives in roadmap.md
Update build-log.md  with exhaustive account of all modifications
Prune todo.md  — remove completed and deprecated tasks
Rewrite cowork-space.md  entirely with a concentrated handover summary
Hard Constraint: The serialized cowork-space.md  must perfectly reflect the exact
empirical state of the codebase. Verify before Clock-out is declared complete.
Workspace Ecosystem Reference
File
Function
AGENTS.md
Coding standards, universal repository constraints
dna.md
Non-negotiable core aesthetics and project philosophy
context.md
Technical blueprint — database schemas, system architecture
roadmap.md
Macro-level feature tracking, strategic trajectory
todo.md
Immediate micro-level tasks for current session
build-log.md
Append-only changelog of all modifications
cowork-space.md
Session state machine — rewritten on every Clock-out

