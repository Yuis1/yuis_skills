[English](SKILL.md) | [简体中文](SKILL.zh-CN.md)

# 委派任务默认模型

仅在用户未显式指定委派 Agent 的模型或推理强度时使用这些默认设置。尊重用户的明确选择。不更改父级 Agent 的模型、推理强度或手动模型选择器。

本技能不构成派发任务的授权依据；行动前首先遵守适用的派发与团队规则。
不强制命名特定角色。除非用户显式要求，否则保持快速模式（Fast Mode）关闭。
统一采用 Pi 原生执行引擎（`pi`）驱动所有模型与子智能体，以获得更高效的执行速度、统一的会话流式交互与零子进程包装开销。在 Paseo 中，OpenAI Codex、Antigravity 与 DeepSeek 系列模型均统一通过 `pi` 提供方调度。

## 按领域划分的模型认知特化

前沿工程实践与 SlopCodeBench 实测表明：无条件将高推理大模型推至顶格（xhigh）会导致严重的废话膨胀、自我辩论死循环以及过度防御的样板代码。高效的多智能体编排必须依据认知原型对模型进行精准分工：

1. **顶层系统架构与不变量建模（Top-Level Architecture）：**
   - 使用 `pi/openai-codex/gpt-6-astra`（默认采用 `high`；`xhigh` 仅限硬核死锁攻坚时按需启用）。
   - 产出形式化类型、状态机枚举与接口契约（`Schema-as-Spec`），不编写推测性的自然语言空话。
2. **架构审查与瘦身去油腻（Architecture Review & Slop Reduction）：**
   - 使用 `pi/antigravity/gemini-3.8-flash`（通过 Pi 原生 Antigravity 扩展调用，而非直连 Antigravity CLI；思考等级：`high`）。
   - 依托真正的 1M+ 全局上下文视野审视跨模块依赖，在代码实现前主动识别并剔除过度防御分支、冗余兼容垫片与偶然复杂度。
3. **开发计划制定与任务切片拆解（Development Planning）：**
   - **计划规划主笔引擎：** 使用 `pi/deepseek-official/deepseek-flash`（思考等级：`high`；其他渠道的 DeepSeek 如 `codebuddy/deepseek-v4.1-flash` 作为兜底）。由其主导宏观里程碑路线图与端到端黄金路径，果断剔除历史负债，锚定单命令 E2E 验收，并将当前里程碑细化为 3~6 个原子任务契约（变更 < 300 行）。
   - **架构不变量参考顾问：** 通过 `/skill:paseo-advisor` 咨询 `pi/openai-codex/gpt-6-astra`（思考等级：`high`）提供领域不变量与状态机边界的参考补充意见。Astra 仅作为咨询顾问，绝不作为计划放行的前置阻塞门禁。
4. **战术主控分层配置（Tactical Orchestration Hierarchy）：**
   - **一级总控（Tier 1 Root）：** 使用 `pi/deepseek-official/deepseek-flash`（Pi 原厂通道，具备 1M 原生超长上下文，高缓存命中率，负责跨域契约锁定与里程碑仲裁）。
   - **二级领域领队（Tier 2 Domain Leads）：** 默认采用 `codebuddy/deepseek-v4.1-flash`（兼具成本效益与战术敏捷，负责微瀑布切片派发与任务看板把关；不可用时退回 Pi 原厂通道）。
5. **疑难硬核排障与死锁攻坚（Hardcore Troubleshooting）：**
   - 遭遇并发竞态、协议底层硬伤或不可复现死锁时，通过 `/skill:paseo-advisor` 咨询 `pi/openai-codex/gpt-6-astra`（思考等级：`high`）获取只读专家建议。编排主控权始终保留在战术领队手中，不发生控制权交接。
6. **日常文案、市场宣发、产品文档与调研（Copywriting & Docs）：**
   - 使用 `pi/antigravity/gemini-3.8-flash`（通过 Pi 的 Antigravity 扩展托管调用；文案使用 `medium`，PRD 与长文调研使用 `high`）。
   - 语言亲切流畅、具有感染力，彻底脱离工程模型的代码防御执念，具备超长文档吞吐与高合成速度。
7. **代码实现与常规干活模型（Working & Implementation Models）：**
   - **默认干活主力模型：** 默认采用 `pi/openai-codex/gpt-6.1-sol`（思考等级：`high`）。主导核心业务逻辑开发、纵向切片 TDD、复杂重构与状态机实现。
   - **低难度重复性任务：** 仅低难度、重复性机械任务走 `pi/openai-codex/gpt-6.1-terra`（思考等级：`low` 或 `medium`）。用于样板代码生成、简单局部修改与提交元数据更新。
8. **网关裁剪边界警告：**
   - 经由多租户代理网关包装的第三方模型（如部分 IDE 套餐）普遍存在上下文窗口被硬截断至 16k~32k 及后台有损压缩现象。严禁将网关截断模型用作全局总控或跨文件架构规划师；仅用于局部单文件编辑。

## 委派任务默认矩阵

| 委派工作类型 | 默认模型 | 推理等级 | 指引说明 |
| --- | --- | --- | --- |
| 顶层系统架构 | `pi/openai-codex/gpt-6-astra` | `high` | 建立核心 Schema、状态机枚举与不变量。默认采用 `high`，`xhigh` 仅限硬核死锁攻坚。 |
| 架构审查与瘦身 | `pi/antigravity/gemini-3.8-flash` | `high` | 站在全局上下文审查 Astra 架构草案，剔除推测性防御代码与偶然复杂度。 |
| 开发计划规划 | `pi/deepseek-official/deepseek-flash` | `high` | 主导里程碑规划、主干黄金路径与单命令 E2E 原子切片（< 300 行）。其他 DeepSeek 兜底。 |
| 计划架构参考咨询 | `pi/openai-codex/gpt-6-astra` | `high` | 通过 `/skill:paseo-advisor` 对不变量边界提供参考建议，非阻塞门禁。 |
| 一级总控编排 | `pi/deepseek-official/deepseek-flash` | `high` | Pi 原厂 1M 上下文，锁定跨域契约与里程碑裁决。 |
| 二级领域领队 | `codebuddy/deepseek-v4.1-flash` | `high` | 兼具成本优势的战术主控，负责微瀑布切片与看板把关。Pi 原厂兜底。 |
| 战术切片契约拆解 | `pi/deepseek-official/deepseek-flash` | `high` | 将当前里程碑拆解为 3~6 个原子任务契约（变更 < 300 行），绑定单命令 E2E。 |
| 疑难硬核排障 | `pi/openai-codex/gpt-6-astra` | `high` | 通过 `/skill:paseo-advisor` 获取只读专家第二意见破局，主控权不发生交接。 |
| 日常文案与市场 | `pi/antigravity/gemini-3.8-flash` | `medium` | 语言自然亲切、富有感染力，杜绝工程说教感与生硬译制腔。 |
| 产品定义与 PRD | `pi/antigravity/gemini-3.8-flash` | `high` | 梳理用户旅程、交互边界与业务用例，不掺杂底层实现细节。 |
| 宏观调研与文献 | `pi/antigravity/gemini-3.8-flash` | `high` | 跨超长文档提炼事实；当需要大量外部实时检索时调用 `chatgpt-chat`。 |
| 核心代码实现主力 | `pi/openai-codex/gpt-6.1-sol` | `high` | 默认干活模型，在单命令端到端与无状态沙箱约束下跑通主干黄金路径。 |
| 重复任务与元数据 | `pi/openai-codex/gpt-6.1-terra` | `low` | 仅用于低难度重复性任务、简单单文件修改与提交信息撰写。 |
