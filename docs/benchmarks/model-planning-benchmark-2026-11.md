[English](model-planning-benchmark-2026-11.md) | [简体中文](model-planning-benchmark-2026-11.zh-CN.md)

# Frontier Model Planning & Refactoring Benchmark (November 2026)

This benchmark evaluates the autonomous system planning and codebase refactoring capabilities of six frontier and high-throughput LLMs on a complex, unreleased full-stack codebase (~690,000 lines of Go, TypeScript, and Dart across monorepo services).

To mimic realistic human interaction, models were given an unassisted prompt with zero pre-digested architectural summaries or hand-holding dossiers, relying entirely on the repository's `AGENTS.md` and installed skills (`agent-team`, `system-design`, `test-evidence`, `safe-refactor`).

> **Confidentiality Notice:** In accordance with open-source privacy standards, all proprietary entity names, specific business domain jargon, and server paths have been sanitized. The target system is referred to as **Project-Alpha** (a three-phase interactive relationship SaaS).

---

## 1. Candidate Models & Execution Telemetry

Each model executed non-interactively within the target workspace. Command dispatch timestamps, completion timestamps, and wall-clock execution durations were recorded.

| Rank | Model Identifier | Provider Channel | Wall Time | Output Size | Execution Status | Overall Score (100) |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| **1** | `pi/deepseek-official/deepseek-flash` | Pi Official Native API | 216.96s | 23 KB | Exit 0 (Clean) | **94** |
| **2** | `codebuddy/deepseek-v4.1-flash` | CodeBuddy Gateway | 270.63s | 28 KB | Exit 0 (Clean) | **90** |
| **3** | `codebuddy/mimo-v2.6-pro` | CodeBuddy Gateway | 509.17s | 20 KB | Exit 0 (Clean) | **85** |
| **4** | `codebuddy/glm-5.3` | CodeBuddy Gateway | 264.31s | 17 KB | Exit 0 (Clean) | **82** |
| **5** | `codebuddy/kimi-k3.1-pro` | CodeBuddy Gateway | 945.00s | 24 KB | Timeout Recovery | **76** |
| **6** | `pi/antigravity/gemini-3.8-flash` | Pi Antigravity Extension | 253.60s | 11 KB | Exit 1 (API Filter) | **55** |

---

## 2. Evaluation Rubric (100-Point Scale)

Evaluations were performed across five core dimensions:

1. **Green-Field Schema Collapse & Anti-Slop (25%):** Ruthlessly deletes phantom v1–v6 compatibility shims, snapshot columns, and legacy adaptors on a zero-production-user system; halts governance sprawl.
2. **Happy-Path Primacy & Scope Restraint (25%):** Prioritizes the unmocked primary user journey; defers 0.01% catastrophe scenarios, complex edge cases, and speculative features to `BACKLOG.md`.
3. **Executability & Single-Command E2E (20%):** Decomposes work into atomic task contracts (< 300 line diffs, 15–45 min duration) with reproducible, unmocked single-command end-to-end verification.
4. **Stub-Decoupled Delivery (15%):** Isolates uncalibrated upstream models or third-party gateways behind deterministic rule stubs rather than allowing external blocks to stall milestone integration.
5. **Protocol & Taskboard Discipline (15%):** Strictly enforces the canonical 4 states (`TODO`, `IN_PROGRESS`, `DONE`, `BLOCKED`) without inventing ceremonial governance artifacts or multi-stage closeout bureaucracy.

---

## 3. In-Depth Model Analysis & Scorecards

### 1st Place: `pi/deepseek-official/deepseek-flash` (Score: 94 / 100)

- **Execution Telemetry:** 216.96s wall time, 12,803 tokens generated, exit code 0.
- **Key Strengths:**
  - **Empirical Grounding:** Executed native inspection commands in the workspace, extracting exact repository facts: 191,877 lines of Go production code, 319 database tables, 1,330 check constraints, 200 triggers, 123 versioned files, and 1,598 deprecated annotations.
  - **Identified Critical Blindspots:** Uncovered three fatal blockers that all other models and historical plans missed:
    1. *Internationalization Failure:* 89 out of 92 frontend components hardcoded non-English strings for a target US-first deployment, with zero i18n infrastructure.
    2. *Operator Portal Absence:* Identified that moderation, refund, and verification APIs existed without an administrative UI, preventing actual business launch.
    3. *Fulfillment Gate Deficiency:* Pointed out that while rule stubs are valid for early integration, no concrete exit criteria existed to graduate from stubs to real model evaluation prior to billing.
  - **Anti-Governance Ratchet:** Ruthlessly called out that "process assets have surpassed product assets" (547 Git tags including 240 recovery tags, 23 disconnected test scripts, and 72 documentation files).
- **Weaknesses:** Highly dense and aggressive prose; minimal formatting embellishments.
- **Verdict:** Uncontested winner. Exceptional engineering acumen, zero slop, and unmatched speed.

---

### 2nd Place: `codebuddy/deepseek-v4.1-flash` (Score: 90 / 100)

- **Execution Telemetry:** 270.63s wall time, 15,469 tokens generated, exit code 0.
- **Key Strengths:**
  - **Three-Ring Release Model:** Replaced an unachievable big-bang launch with pragmatic tiers: Ring 0 (internal preview with rule stubs) $\rightarrow$ Ring 1 (unpaid public alpha with real state machines) $\rightarrow$ Ring 2 (paid production release).
  - **Architecture Bottleneck Identification:** Pinpointed that `/services/core-api/cmd/main.go` (1,261 lines, 2 functions) was the primary merge-conflict hotspot across concurrent feature branches, mandating modular capability assemblies before parallel work.
  - **Evidence Tiering (T0–T3):** Separated static proofs from true PostgreSQL transaction invariants and external browser settlements.
- **Weaknesses:** Slightly softer on legacy code deletion compared to its Pi native counterpart; slightly higher latency via gateway proxy.

---

### 3rd Place: `codebuddy/mimo-v2.6-pro` (Score: 85 / 100)

- **Execution Telemetry:** 509.17s wall time, 10,265 tokens generated, exit code 0.
- **Key Strengths:**
  - **Critique of Serial Recovery:** Correctly analyzed that historical linear planning (A $\rightarrow$ B $\rightarrow$ C) created artificial dependencies where workstreams were orthogonal.
  - **Version Debt Cataloging:** Identified multi-version drift across schema contracts and mobile endpoints.
  - **Invariant Boundary Enforcement:** Explicitly reinforced that models must act as untrusted candidate generators without direct database write permissions.
- **Weaknesses:** Noticeably slower generation throughput (over 8 minutes); task breakdowns were broader with less granular line budgets.

---

### 4th Place: `codebuddy/glm-5.3` (Score: 82 / 100)

- **Execution Telemetry:** 264.31s wall time, 8,203 tokens generated, exit code 0.
- **Key Strengths:**
  - **Swimlane Parallelization:** Successfully mapped independent tracks for security fixes, model calibration, and public onboarding infrastructure.
  - **Failure Attribution Decision Tree:** Formulated a structured triaging flow for verification test failures.
- **Weaknesses:** Retained excessive adherence to the original flawed ChatGPT document outline (copying alphabetical phase labels A/B/C/D) rather than re-architecting the roadmap from first principles.

---

### 5th Place: `codebuddy/kimi-k3.1-pro` (Score: 76 / 100)

- **Execution Telemetry:** 945.00s total wall time (timed out at 900s limit, required session resumption), 11,694 tokens generated.
- **Key Strengths:**
  - **Exhaustive Domain Comprehension:** Produced an exceptionally comprehensive 24 KB plan covering every user journey, contract schema, and refactoring seam (R1–R6).
  - **Representative Lifecycle Trace:** Provided a complete walk-through of field lifecycle ownership from PRD through database serialization to mobile projection.
- **Weaknesses:**
  - **Over-Investigation Paralysis:** Exhausted over 15 minutes iterating through inspection tool calls before initiating plan synthesis.
  - Severe risk of timing out in real CI/CD or automated orchestration environments.

---

### 6th Place: `pi/antigravity/gemini-3.8-flash` (Score: 55 / 100 - Incomplete)

- **Execution Telemetry:** 253.60s wall time, 5,314 tokens generated, stream terminated by provider error.
- **Critical Failure Mode:**
  - **Server-Side Safety Censorship (`PROHIBITED_CONTENT`):** The model demonstrated extraordinary macro product insight and strategic clarity through Milestone 1. However, upon encountering sensitive relationship and adult-adjacent terms, Google Cloud's upstream safety classifier halted generation with an unrecoverable `PROHIBITED_CONTENT` error.
- **Key Takeaway:** Google Cloud Gemini models cannot be reliably deployed as autonomous planners on consumer social, relationship, or adult-adjacent domains due to inflexible upstream API content filters.

---

## 4. Key Comparative Findings & Recommendations

1. **Native Pi vs. Gateway Proxy (`deepseek-flash`):**
   - The native Pi execution channel outperformed the CodeBuddy gateway proxy by **54 seconds** (25% faster) and demonstrated significantly higher prompt cache hit efficiency and autonomy.
2. **The "xhigh" Planning Anti-Pattern Validated:**
   - Kimi K3.1 Pro's 15-minute investigation loop confirmed that unconstrained reasoning in planning tasks leads to analysis paralysis rather than superior delivery plans.
3. **Recommended Production Allocation:**
   - **Tactical Sprint Slicing & Codebase Audit:** Native `pi/deepseek-official/deepseek-flash` is the undisputed benchmark leader for autonomous planning, deadweight amputation, and E2E task contract construction.
   - **General Domain Modeling:** `codebuddy/deepseek-v4.1-flash` and `codebuddy/mimo-v2.6-pro` provide viable secondary alternatives when operating within IDE proxy environments.
