[English](model-planning-benchmark-2026-11.md) | [简体中文](model-planning-benchmark-2026-11.zh-CN.md)

# Frontier Model Planning & Refactoring Benchmark (November 2026)

This benchmark evaluates the autonomous system planning and codebase refactoring capabilities of six frontier and high-throughput LLMs on a complex, unreleased full-stack codebase (~690,000 lines of Go, TypeScript, and Dart across monorepo services).

To mimic realistic human interaction, models were given an unassisted prompt with zero pre-digested architectural summaries or hand-holding dossiers, relying entirely on the repository's `AGENTS.md` and installed skills (`agent-team`, `system-design`, `test-evidence`, `safe-refactor`).

> **Confidentiality Notice:** In accordance with open-source privacy standards, all proprietary entity names, specific business domain jargon, and server paths have been sanitized. The target system is referred to as **Project-Alpha** (a three-phase interactive relationship SaaS).

---

## 1. Testbed Project Baseline & Architectural Quantum

The target evaluation codebase (**Project-Alpha**) is an unreleased, greenfield full-stack monorepo with extensive domain modeling and heavy test scaffolding:

- **Backend Core (`/services/core-api`):** Go 1.27+ with Chi router, pgx, and sqlc. Comprises 191,877 lines of production code across 72 domain packages and 35,050 lines of HTTP handlers. Its unit, integration, and race test suites total 196,178 lines.
- **Database Schema:** PostgreSQL 18 with 319 tables, 1,330 `CHECK` constraints, 200 triggers, and 26 operational receipt/audit tables collapsed into a single 25,847-line initial migration (`00176_initial.sql`).
- **Shared API Contracts (`/contracts`):** Authoritative contract-first directory with 147 schema definitions (135 versioned), 60+ JSON Schemas, and golden test fixtures validated via automated verification tooling.
- **Decoupled AI Runtime (`/services/agent-runtime`):** 29 TypeScript files (4,625 lines) across 7 stateless discrete runners, enforcing token-namespace isolation, fail-closed boundaries, and zero direct database write permissions.
- **Frontend Clients:**
  - *React Web (`/client/web`):* ~20,000 lines of TypeScript across 90+ feature components and deep router paths.
  - *Mobile (`/client/mobile`):* 96,763 lines of Dart across 252 files with Android security surface hardening and iOS background voice channel integrations.
- **Product Lifecycle & State Machines:**
  - *Phase 1 (Intake & Profiling):* Interactive profiling questionnaires, psychometric scoring, and multi-tier algorithmic candidate pairing.
  - *Phase 2 (Coached Cohabitation):* 14-day exclusive interactive pod, stepped anti-intermediation IM gating, ephemeral self-destructing media streams, and daily dual-blind prompts.
  - *Phase 3 (Partnership OS):* Living relationship covenants, dynamic version diffing, recurring alignment prompts, and structured NVC cooling mediation.
- **Governance & Process Debt:** 547 Git tags (including 240 `recovery/*` tags), 23 disconnected end-to-end bash runners, 13 test fixture binaries, 123 versioned interface files, and 1,598 legacy/deprecated code annotations.

---

## 2. Candidate Models, Reasoning Effort & Execution Telemetry

Each candidate executed non-interactively within the target workspace. Command dispatch timestamps, completion timestamps, reasoning effort tiers, and wall-clock execution durations were recorded.

| Rank | Model Identifier | Provider Channel | Reasoning Effort | Wall Time | Output Size | Execution Status | Overall Score (100) |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **1** | `pi/deepseek-official/deepseek-flash` | Pi Official Native API | `high` | 216.96s | 23 KB | Exit 0 (Clean) | **94** |
| **2** | `pi/antigravity/gemini-3.8-flash` | Pi Antigravity Extension | `high` | 318.60s | 44 KB | Exit 0 (Multi-Turn) | **93** |
| **3** | `codebuddy/deepseek-v4.1-flash` | CodeBuddy Gateway | `medium` | 270.63s | 28 KB | Exit 0 (Clean) | **91** |
| **4** | `codebuddy/kimi-k3.1-pro` | CodeBuddy Gateway | `high` | 945.00s | 24 KB | Exit 0 (Resumed) | **86** |
| **5** | `codebuddy/mimo-v2.6-pro` | CodeBuddy Gateway | `high` | 509.17s | 20 KB | Exit 0 (Clean) | **85** |
| **6** | `codebuddy/glm-5.3` | CodeBuddy Gateway | `medium` | 264.31s | 17 KB | Exit 0 (Clean) | **82** |

---

## 3. Evaluation Dimensions & Sub-Score Deduction Matrix

Evaluations were performed across five core dimensions:

1. **Green-Field Schema Collapse & Anti-Slop (25%):** Ruthlessly deletes phantom v1–v6 compatibility shims, snapshot columns, and legacy adaptors on a zero-production-user system; halts governance sprawl.
2. **Happy-Path Primacy & Scope Restraint (25%):** Prioritizes the unmocked primary user journey; defers 0.01% catastrophe scenarios, complex edge cases, and speculative features to `BACKLOG.md`.
3. **Executability & Single-Command E2E (20%):** Decomposes work into atomic task contracts (< 300 line diffs, 15–45 min duration) with reproducible, unmocked single-command end-to-end verification.
4. **Stub-Decoupled Delivery (15%):** Isolates uncalibrated upstream models or third-party gateways behind deterministic rule stubs rather than allowing external blocks to stall milestone integration.
5. **Protocol & Taskboard Discipline (15%):** Strictly enforces the canonical 4 states (`TODO`, `IN_PROGRESS`, `DONE`, `BLOCKED`) without inventing ceremonial governance artifacts or multi-stage closeout bureaucracy.

### Detailed Score Breakdown by Model

| Model Identifier | D1: Schema Collapse (25) | D2: Happy-Path Primacy (25) | D3: Executability & E2E (20) | D4: Stub Decoupling (15) | D5: Taskboard Protocol (15) | Total (100) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `pi/deepseek-official/deepseek-flash` | **24** (-1 over-cut quota) | **24** (-1 aggressive cut) | **19** (-1 test suite consolidation) | **14** (-1 stub boundary) | **13** (-2 doc refactor tasks) | **94** |
| `pi/antigravity/gemini-3.8-flash` | **23** (-2 M5 runtime scope) | **24** (-1 M6 storage creep) | **19** (-1 large contract scope) | **14** (-1 provider failover) | **13** (-2 multi-turn recovery) | **93** |
| `codebuddy/deepseek-v4.1-flash` | **22** (-3 softer on legacy) | **24** (-1 deferred alpha scope) | **18** (-2 runner prerequisites) | **14** (-1 staging stubs) | **13** (-2 missing line caps) | **91** |
| `codebuddy/kimi-k3.1-pro` | **21** (-4 legacy preservation) | **22** (-3 multi-tier gates) | **17** (-3 analysis latency) | **13** (-2 delayed stubbing) | **13** (-2 investigation turns) | **86** |
| `codebuddy/mimo-v2.6-pro` | **21** (-4 coarse task splits) | **22** (-3 serial dependencies) | **16** (-4 broad E2E bounds) | **13** (-2 stub criteria) | **13** (-2 tag cleanup bloat) | **85** |
| `codebuddy/glm-5.3` | **20** (-5 copied lettered phases) | **21** (-4 conservative roadmap) | **15** (-5 no atomic line diffs) | **13** (-2 implicit stubs) | **13** (-2 checklist format) | **82** |

---

## 4. In-Depth Model Analysis & Scorecards

### 1st Place: `pi/deepseek-official/deepseek-flash` (Score: 94 / 100)

- **Execution Telemetry:** Thinking `high`, 216.96s wall time, 12,803 tokens generated, exit code 0.
- **Sub-Score Breakdown:** D1: 24/25 | D2: 24/25 | D3: 19/20 | D4: 14/15 | D5: 13/15.
- **Key Strengths:**
  - **Empirical Grounding:** Executed native inspection commands in the workspace, extracting exact repository facts: 191,877 lines of Go production code, 319 database tables, 1,330 check constraints, 200 triggers, 123 versioned files, and 1,598 deprecated annotations.
  - **Identified Critical Blindspots:** Uncovered three fatal blockers that all other models and historical plans missed:
    1. *Internationalization Failure:* 89 out of 92 frontend components hardcoded non-English strings for a target US-first deployment, with zero i18n infrastructure.
    2. *Operator Portal Absence:* Identified that moderation, refund, and verification APIs existed without an administrative UI, preventing actual business launch.
    3. *Fulfillment Gate Deficiency:* Pointed out that while rule stubs are valid for early integration, no concrete exit criteria existed to graduate from stubs to real model evaluation prior to billing.
  - **Anti-Governance Ratchet:** Ruthlessly called out that "process assets have surpassed product assets" (547 Git tags including 240 recovery tags, 23 disconnected test scripts, and 72 documentation files).
- **Weaknesses:** Highly dense prose; slightly over-aggressive in proposing numeric quotas for table reductions.
- **Verdict:** Uncontested leader in engineering pragmatism, empirical ground truth, and execution velocity.

---

### 2nd Place: `pi/antigravity/gemini-3.8-flash` (Score: 93 / 100)

- **Execution Telemetry:** Thinking `high`, 318.60s total wall time across 2 turns, 23,775 tokens generated, exit code 0.
- **Sub-Score Breakdown:** D1: 23/25 | D2: 24/25 | D3: 19/20 | D4: 14/15 | D5: 13/15.
- **Key Strengths:**
  - **Architectural & Systemic Completeness:** Delivered the most comprehensive, polished 44 KB blueprint across all milestones (Milestone 0 Schema collapse through Milestone 6 production hardening).
  - **Concrete Verification Rigor:** Every single task contract from M0 to M6 is bound to an explicit single-command test script (e.g. `dev/tests/run_pod_coaching_lifecycle_e2e.sh --suite=reveal-isolation`).
  - **Formal State Machine & Topology Modeling:** Included complete `StateDiagram-v2` definitions for the 14-day exclusive pod lifecycle and ASCII interaction diagrams for long-term partnership covenants.
  - **Advanced Agent Runtime Specification:** Mapped the transition from stateless scripts to a distributed `StateGraph` runtime with transactional outbox and scoped memory hard-purges.
- **Weaknesses:** Required two turns due to initial sensitivity filter boundary; introduced slight architectural expansion in later milestones (M5 distributed worker).
- **Verdict:** The gold standard for holistic system architecture, formal state-machine modeling, and multi-agent governance design.

---

### 3rd Place: `codebuddy/deepseek-v4.1-flash` (Score: 91 / 100)

- **Execution Telemetry:** Thinking `medium`, 270.63s wall time, 15,469 tokens generated, exit code 0.
- **Sub-Score Breakdown:** D1: 22/25 | D2: 24/25 | D3: 18/20 | D4: 14/15 | D5: 13/15.
- **Key Strengths:**
  - **Three-Ring Release Model:** Replaced an unachievable big-bang launch with pragmatic tiers: Ring 0 (internal preview with rule stubs) $\rightarrow$ Ring 1 (unpaid public alpha with real state machines) $\rightarrow$ Ring 2 (paid production release).
  - **Architecture Bottleneck Identification:** Pinpointed that `/services/core-api/cmd/main.go` (1,261 lines, 2 functions) was the primary merge-conflict hotspot across concurrent feature branches, mandating modular capability assemblies before parallel work.
  - **Evidence Tiering (T0–T3):** Separated static proofs from true PostgreSQL transaction invariants and external browser settlements.
- **Weaknesses:** Slightly softer on legacy code deletion compared to its Pi native counterpart; slightly higher latency via gateway proxy.

---

### 4th Place: `codebuddy/kimi-k3.1-pro` (Score: 86 / 100)

- **Execution Telemetry:** Thinking `high`, 945.00s total wall time across 2 turns (resumed after exploratory phase), 11,694 tokens generated, exit code 0.
- **Sub-Score Breakdown:** D1: 21/25 | D2: 22/25 | D3: 17/20 | D4: 13/15 | D5: 13/15.
- **Key Strengths:**
  - **Exhaustive Domain Comprehension:** Produced a comprehensive 24 KB plan covering every user journey, contract schema, and refactoring seam (R1–R6).
  - **Representative Lifecycle Trace:** Provided a complete walk-through of field lifecycle ownership from PRD through database serialization to mobile projection.
  - **Contract & Schema Collapse:** Explicitly scheduled the retirement of legacy v1–v5 paths and defined a clean first batch of six task contracts.
- **Weaknesses:**
  - **Over-Investigation Latency:** Exhausted 15 minutes iterating through inspection tool calls before initiating plan synthesis, requiring session resumption to output.

---

### 5th Place: `codebuddy/mimo-v2.6-pro` (Score: 85 / 100)

- **Execution Telemetry:** Thinking `high`, 509.17s wall time, 10,265 tokens generated, exit code 0.
- **Sub-Score Breakdown:** D1: 21/25 | D2: 22/25 | D3: 16/20 | D4: 13/15 | D5: 13/15.
- **Key Strengths:**
  - **Critique of Serial Recovery:** Correctly analyzed that historical linear planning (A $\rightarrow$ B $\rightarrow$ C) created artificial dependencies where workstreams were orthogonal.
  - **Version Debt Cataloging:** Identified multi-version drift across schema contracts and mobile endpoints.
  - **Invariant Boundary Enforcement:** Explicitly reinforced that models must act as untrusted candidate generators without direct database write permissions.
- **Weaknesses:** Slower generation throughput (over 8 minutes); task breakdowns were broader with less granular line budgets.

---

### 6th Place: `codebuddy/glm-5.3` (Score: 82 / 100)

- **Execution Telemetry:** Thinking `medium`, 264.31s wall time, 8,203 tokens generated, exit code 0.
- **Sub-Score Breakdown:** D1: 20/25 | D2: 21/25 | D3: 15/20 | D4: 13/15 | D5: 13/15.
- **Key Strengths:**
  - **Swimlane Parallelization:** Successfully mapped independent tracks for security fixes, model calibration, and public onboarding infrastructure.
  - **Failure Attribution Decision Tree:** Formulated a structured triaging flow for verification test failures.
- **Weaknesses:** Retained excessive adherence to the original flawed ChatGPT document outline (copying alphabetical phase labels A/B/C/D) rather than re-architecting the roadmap from first principles.

---

## 5. Cross-Evaluator Perspectives: Dialectic Comparison

To eliminate evaluator bias, two independent senior evaluators reviewed the candidate plans under identical scoring standards without access to prior ratings:

### Independent Evaluator: `openai-codex/gpt-6-astra` (Formalist Invariant Gatekeeper)
- **Top Ranked:** Candidate D (Kimi: 84) and Candidate E (MiMo: 82).
- **Core Critique:** Evaluated strictly from a formal type safety, transaction consistency, and database invariant lens. Astra heavily penalized Candidate A (Pi DeepSeek: 61) for proposing arbitrary "quotas for table and trigger deletions" without proving semantic equivalence, and clarified that using `text + CHECK` constraints validly enforces invariant boundaries without requiring Postgres enums. Astra also criticized Candidate B (Gemini: 44) for milestone renumbering drift and speculative StateGraph runtime additions, while rewarding Kimi and MiMo for maintaining strict data preservation, field lifecycle tracing, and relational invariants.

### Independent Evaluator: `deepseek-official/deepseek-flash` (Pragmatic Execution Operator)
- **Top Ranked:** Candidate A (Pi DeepSeek: 88) and Candidate C (CodeBuddy DeepSeek: 86).
- **Core Critique:** Evaluated strictly from an empirical git-history, execution velocity, and delivery pragmatism lens. DeepSeek independently verified facts against the git tree, confirming that Candidate A was the only plan to identify the 89 hardcoded Chinese components and the total absence of an admin operator UI. DeepSeek penalized Kimi for 15-minute investigation latency and penalized Gemini for over-engineering later milestones.

---

## 6. Key Comparative Findings & Recommendations

1. **Native Pi vs. Gateway Proxy (`deepseek-flash`):**
   - The native Pi execution channel outperformed the CodeBuddy gateway proxy by **54 seconds** (25% faster) and demonstrated significantly higher prompt cache hit efficiency and autonomy.
2. **The "xhigh" Planning Anti-Pattern Validated:**
   - Kimi K3.1 Pro's 15-minute investigation loop confirmed that unconstrained reasoning in planning tasks leads to analysis paralysis rather than superior delivery plans.
3. **Recommended Production Allocation:**
   - **Tactical Sprint Slicing & Codebase Audit:** Native `pi/deepseek-official/deepseek-flash` is the undisputed benchmark leader for autonomous planning, deadweight amputation, and E2E task contract construction.
   - **Top-Level System Architecture & State Machine Design:** `pi/antigravity/gemini-3.8-flash` provides unmatched depth, formal verification structure, and holistic milestone modeling.
   - **General Domain Modeling:** `codebuddy/deepseek-v4.1-flash` and `codebuddy/mimo-v2.6-pro` provide viable secondary alternatives when operating within IDE proxy environments.
