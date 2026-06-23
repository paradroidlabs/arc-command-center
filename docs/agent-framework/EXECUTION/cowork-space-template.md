Shared Coworking Ledger & State Serialization
Engine
This document is the absolute source of truth for all session handoffs and state
management. The AI Agent reads this file immediately upon Clock-in and rewrites it
completely upon Clock-out. Never append. Always rewrite.
Current Session Integrity
Last Formal Clock-Out Timestamp: [ISO 8601 timestamp] System State Diagnosis:
[STABLE / DEGRADED / BROKEN — with one-line explanation]
Tactical Handoff Summary
Highly concentrated context notes directed exclusively at the subsequent AI instance.
Recent Accomplishments: [Concise, exact summary of the previous session’s verified
completions. Verified claims only — no speculation about what might have worked.]
Active Anomalies: [Explicit, exhaustive list of known bugs, failing test suites, incomplete
async logic, or unresolved architectural decisions. If none: “None confirmed.”]
Immediate Initialization Directive: [The single first action the next agent instance must
take upon Clock-in. One sentence. Actionable. No ambiguity.]
Architectural Warnings & Context Drift Alerts
[List any decisions made this session that deviate from dna.md constraints, with
justification. Navigator-approved deviations must be noted here explicitly so future
instances do not flag them as violations.]
[Warning or drift alert, if any]
[Add as needed]

Environment State
Active Branch: [branch name] Last Verified Build Status: [passing / failing / untested]
Pending Navigator Decisions: [list any decisions awaiting human authorization] Known
Asserted Claims in Codebase: [any Asserted-tier assumptions baked into current
implementation that have not yet been Verified]

