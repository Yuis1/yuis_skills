[English](evaluator-deepseek-2026-11.md) | [简体中文](evaluator-deepseek-2026-11.zh-CN.md)

# DeepSeek (Pi DeepSeek V4.1 Flash) Independent Architectural Evaluation Report (Project-Alpha)

---

## 0. Evaluation Methodology & Evidence Baseline

Rather than performing a superficial text critique, all **verifiable factual assertions** made across the six candidate proposals were back-tested against the repository tree at `main @ 87a7045f` via read-only inspections (`git ls-tree` / `git show`). This establishes an empirical ground truth for evaluation.

| Verifiable Metric / Claim | Physical Codebase Ground Truth | Accurate vs. Distorted Candidates |
|---|---|---|
| Git tag total / `recovery/*` count | **547 total / 240 recovery** (Exact Match) | Candidate A precisely matched; others vague or omitted |
| Initial migration (`00176_initial.sql`) tables / lines | **319 tables / 25,847 lines** (Exact Match) | Candidate A precisely matched; C/D/E wrote generic "300+" |
| `packages/contracts` top-level schemas / versioned count | **147 total / 135 versioned** (Exact Match) | Candidate A precisely matched |
| Repository `.md` / product directory `.md` | **497 total / 332 product**; 137 dev process docs (Exact Match) | Candidate A precisely matched |
| `services/core/cmd/` single-journey `*fixture` + `s11/s13text03` directories | **13 fixture directories** (Exact Match) | Candidate A precisely matched |
| `dev/tests/run_*` runner scripts | **23 runners** (Exact Match) | Candidate A matched; E wrote 21; F/C omitted count |
| Go codebase line count | **191,877 production / 196,178 test** (388,055 total) | Candidate A precisely matched |
| `main` branch HEAD commit | **`87a7045f`** | Candidate A matched; D/E/F quoted ancestor `03d09cc4` from old docs |
| `apps/web` internationalization (i18n) | `i18n|l10n` matched **0 hits** (hardcoded non-English) | Candidate A exclusively identified; B claimed i18n was ready |
| Administrative Operator UI | Frontend only had business app; operator directory had only README | Candidate A exclusively identified missing admin UI as a launch blocker |
| Continuous Integration jobs | Active `.github/workflows/core-ci.yml` has **4 jobs** (core/web/runtime/mobile) | Candidate C matched; A proposed creating a new make gate |
| Candidate deletion diff scope | 49 files, +867/−3436; deleted legacy snapshots; **did not touch** `partner_height_cm` | See analysis below |
| Schema requirement for `partner_height_cm` | **Required** in current schema; also required in active draft | Candidate C correctly verified; **Candidate A misjudged** |
| Test assertion logic pattern | Bidirectional check: `contains(answers, expected)` **AND** expects legacy fields to be `undefined` | All six candidates failed to identify the "extra legacy field" branch |

Two **Decisive Findings**:
1. **Candidate A misjudged the single blocking failure:** It suggested amputating `partner_height_cm` if it belonged to legacy snapshots. However, this field is an **actively required live field** in the current schema that was never deleted by the candidate. Executing A's advice would result in amputating a live business field and weakening assertions.
2. **All candidates shared a blindspot on the failure assertion:** The test failure assertion requires live fields to be present AND requires legacy fields to be `undefined`. The true failure root cause is likely an unexpected extra legacy projection, rather than a missing field. Only Candidate A maintained a neutral "field divergence" stance with multi-stage tracing.

---

## 1. Evaluation Standings & Scoring Matrix

| Rank | Candidate | D1: Schema Collapse (25) | D2: Happy-Path (25) | D3: Executability & E2E (20) | D4: Stub Decoupling (15) | D5: Taskboard Protocol (15) | **Total** | Wall Time |
|---|---|---|---|---|---|---|---|---|
| **1** | **A · pi/deepseek-4.1-flash** | **21** | **22** | 17 | **14** | **14** | **88** | 217s |
| **2** | **C · codebuddy deepseek-4.1-flash** | 17 | **22** | **19** | **14** | **14** | **86** | 271s |
| **3** | **D · codebuddy kimi-k3.1-pro** | 20 | 21 | 16 | 13 | **14** | **84** | 945s |
| 4 | E · codebuddy mimo-v2.6-pro | 19 | 20 | 15 | 12 | 13 | **79** | 509s |
| 5 | F · codebuddy glm-5.3 | 16 | 17 | 12 | 10 | 12 | **67** | 264s |
| 6 | B · pi/gemini-3.8-flash | 8 | 7 | 8 | 9 | 9 | **41** | 319s |

---

## 2. In-Depth Candidate Evaluations

### A · pi/deepseek-4.1-flash — Score: 88, 1st Place: The Only Plan Grounded in Physical Audit

- **Key Strengths:** The only candidate to anchor its baseline to the real HEAD (`87a7045f`) and deliver verifiable metrics across tables, lines, tags, and fixtures. Identified three genuine launch blockers that all others missed: (1) Hardcoded non-English strings across frontend components on a target US deployment; (2) Total absence of an operator management UI; (3) Missing exit criteria to graduate from rule stubs to real model evaluation before billing. Quantified the anti-governance ratchet by targeting table and tag reductions with weekly audit bounds.
- **Critical Weaknesses:** Misjudged the single blocking failure by recommending the deletion of an actively required live field; misclassified operational receipt and idempotency tables as test scaffolding; proposed converting `text+CHECK` to PostgreSQL enums (churn without invariant benefit).
- **Verdict:** Unrivaled empirical ground truth and execution velocity; prime candidate for driving the overall roadmap, provided that critical deletion actions undergo adversarial invariant checks.

---

### C · codebuddy deepseek-4.1-flash — Score: 86, 2nd Place: Superior Failure Diagnosis

- **Key Strengths:** Performed three critical analyses: (1) Pinpointed the exact assertion failure line in the test runner; (2) Provided a structured diagnostic ladder with bounded sub-2-minute probes; (3) Correctly verified that the schema still required the disputed fields, avoiding A's deletion trap. Formulated the pragmatic Three-Ring release model and identified the monolithic entrypoint as the primary concurrent merge conflict hotspot.
- **Critical Weaknesses:** Yielded on greenfield schema collapse by asserting that "existing migrations must not be rewritten", treating migration file count as architectural completion; preserved dead unlistened preview ports as active protected assets.
- **Verdict:** Outstanding diagnostic methodology and task slicing; serves as the ideal tactical execution partner to Candidate A.

---

### D · codebuddy kimi-k3.1-pro — Score: 84, 3rd Place: Deepest Architectural Migration Design

- **Key Strengths:** Firm stance on schema collapse without adding backward compatibility bridges. Formulated an invaluable "field lifecycle ownership checklist" tracing data from PRD through OpenAPI, Core validation, and database serialization to client display. Maintained modular monolith discipline against premature microservice decomposition.
- **Critical Weaknesses:** Completely ignored process asset sprawl (zero mention of 547 tags or 497 docs); excessive runtime latency (945 seconds) creates a severe timeout liability in automated environments.
- **Verdict:** Highly robust architectural design, best utilized as a read-only advisory consult for complex refactoring segments.

---

### E · codebuddy mimo-v2.6-pro — Score: 79: Sound Invariant Stance, but Soft Convergence

- **Key Strengths:** Firm collapse philosophy ("one-time schema collapse without migration matrices"); correctly utilized three-way baseline comparison for triage; structured external dependency register.
- **Critical Weaknesses:** Misaligned the collapse timeline by deferring it to pre-release milestones, forcing intermediate development on deprecated columns; overly passive posture lacking immediately actionable atomic task cards.

---

### F · codebuddy glm-5.3 — Score: 67: Clean Structure, Delegated Substance

- **Key Strengths:** Clean swimlane design parallelizing security fixes and onboarding readiness; four-column refactoring tables with practical forbidden lists.
- **Critical Weaknesses:** Severe substance delegation (declared adherence to old document checklists rather than synthesizing fresh plans), omitting 60% of critical scope; lacked granular 300-line diff budgets.

---

### B · pi/gemini-3.8-flash — Score: 41, 6th Place: Scope Explosion & Secondary Sprawl

- **Key Strengths:** Accurate four-dimensional critique of historical governance bloat; demonstrated multi-turn recovery resilience following an upstream content filter interruption.
- **Critical Weaknesses:** Severe scope explosion: scheduled distributed agent workers, StateGraph, checkpointing, vector memory, and multi-replica storage into pre-release milestones, directly violating happy-path primacy; invented non-existent single-purpose test scripts for every slice, destroying single-command E2E coherence.
- **Verdict:** Strong macro narrative, but detached from current codebase realities; unsuitable as a tactical execution plan.

---

## 3. Executive Recommendations & Production Synthesis

1. **Primary Planning Engine: Candidate A (`pi/deepseek-official/deepseek-flash`).** Delivers verifiable ground-truth facts, quantified deadweight targets, and measurable fulfillment exit gates with unmatched execution speed.
2. **Tactical Task Slicing: Candidate C (`codebuddy/deepseek-v4.1-flash`).** Adopt its tiered diagnostic ladder, Three-Ring release strategy, and entrypoint modularization.
3. **Architectural Advisory Consult: Candidate D (`codebuddy/kimi-k3.1-pro`).** Engage its field lifecycle checklist and repository modularization patterns as read-only advisory inputs via `/skill:paseo-advisor`.
