[English](SKILL.md) | [简体中文](SKILL.zh-CN.md)

# 委派任务默认模型

仅在用户未显式指定委派 Agent 的模型或推理强度时使用这些默认设置。尊重用户的明确选择。不更改父级 Agent 的模型、推理强度或手动模型选择器。

本技能不构成派发任务的授权依据；行动前首先遵守适用的派发与团队规则。
不强制命名特定角色。除非用户显式要求，否则保持快速模式（Fast Mode）关闭。
统一采用 Pi 原生执行引擎（`pi`）驱动所有模型与子智能体，以获得更高效的执行速度、统一的会话流式交互与零子进程包装开销。在 Paseo 中，OpenAI Codex、Antigravity 与 DeepSeek 系列模型均统一通过 `pi` 提供方调度。

## 按领域划分的模型认知特化

前沿工程实践与 SlopCodeBench 实测表明：无条件将高推理大模型推至顶格（xhigh）会导致严重的废话膨胀、自我辩论死循环以及过度防御的样板代码。高效的多智能体编排必须依据认知原型对模型进行精准分工：

1. **顶层系统架构与不变量建模（Top-Level Architecture）：**
   - 使用 `pi/openai-codex/gpt-6-astra`（推理强度封顶为 `high`；严禁使用 `xhigh`，杜绝推测性辩论死循环）。
   - 产出形式化类型、状态机枚举与接口契约（`Schema-as-Spec`），不编写推测性的自然语言空话。
2. **架构审查与瘦身去油腻（Architecture Review & Slop Reduction）：**
   - 使用 `pi/antigravity/gemini-3.8-flash`（通过 Pi 原生 Antigravity 扩展调用，而非直连 Antigravity CLI；思考等级：`high`）。
   - 依托真正的 1M+ 全局上下文视野审视跨模块依赖，在代码实现前主动识别并剔除过度防御分支、冗余兼容垫片与偶然复杂度。
3. **一级与二级战术总控（Tactical Orchestration）：**
   - 使用 `pi/deepseek-official/deepseek-flash`（Pi 原厂通道）。
   - 原生具备 1M（`1000000`）超长上下文视野。依托非对称因果编码架构与超高前缀缓存（Prefix Caching）命中率，下发紧凑的有界任务契约，执行敏捷微瀑布与低成本重规划，绝不擅自脑补未请求的边缘异常。
4. **疑难硬核排障与死锁攻坚（Hardcore Troubleshooting）：**
   - 遭遇并发竞态、协议底层硬伤或不可复现死锁时，通过 `/skill:paseo-advisor` 咨询 `pi/openai-codex/gpt-6-astra`（思考等级：`high`）获取只读专家建议。编排主控权始终保留在战术领队手中，不发生控制权交接。
5. **日常文案、市场宣发、产品文档与调研（Copywriting & Docs）：**
   - 使用 `pi/antigravity/gemini-3.8-flash`（通过 Pi 的 Antigravity 扩展托管调用；文案使用 `medium`，PRD 与长文调研使用 `high`）。
   - 语言亲切流畅、具有感染力，彻底脱离工程模型的代码防御执念，具备超长文档吞吐与高合成速度。
6. **常规代码开发与重构（Implementation & TDD）：**
   - 使用 `pi/openai-codex/gpt-6.1-terra`（思考等级：`high`）或 `pi/deepseek-official/deepseek-flash`。
   - 严格遵循主干黄金路径优先（Happy-Path Primacy）与单命令端到端真实验收。
7. **网关裁剪边界警告：**
   - 经由多租户代理网关包装的第三方模型（如部分 IDE 套餐）普遍存在上下文窗口被硬截断至 16k~32k 及后台有损压缩现象。严禁将网关截断模型用作全局总控或跨文件架构规划师；仅用于局部单文件编辑。

## 委派任务默认矩阵

| 委派工作类型 | 默认模型 | 推理等级 | 指引说明 |
| --- | --- | --- | --- |
| 顶层系统架构 | `pi/openai-codex/gpt-6-astra` | `high` | 建立核心 Schema、状态机枚举与不变量。封顶为 `high`，严禁使用 `xhigh`。 |
| 架构审查与瘦身 | `pi/antigravity/gemini-3.8-flash` | `high` | 站在全局上下文审查 Astra 架构草案，剔除推测性防御代码与偶然复杂度。 |
| 战术总控与派发 | `pi/deepseek-official/deepseek-flash` | `high` | 下发微瀑布切片，严格把关完成定义（DoD），执行低成本敏捷重规划。 |
| 疑难硬核排障 | `pi/openai-codex/gpt-6-astra` | `high` | 通过 `/skill:paseo-advisor` 获取只读专家第二意见破局，主控权不发生交接。 |
| 日常文案与市场 | `pi/antigravity/gemini-3.8-flash` | `medium` | 语言自然亲切、富有感染力，杜绝工程说教感与生硬译制腔。 |
| 产品定义与 PRD | `pi/antigravity/gemini-3.8-flash` | `high` | 梳理用户旅程、交互边界与业务用例，不掺杂底层实现细节。 |
| 宏观调研与文献 | `pi/antigravity/gemini-3.8-flash` | `high` | 跨超长文档提炼事实；当需要大量外部实时检索时调用 `chatgpt-chat`。 |
| 代码实现与 TDD | `pi/openai-codex/gpt-6.1-terra` | `high` | 在单命令端到端与无状态沙箱约束下跑通主干黄金路径。 |
| 局部小任务与元数据 | `pi/openai-codex/gpt-6.1-terra` | `low` | 局部单文件修改、提交信息撰写与元数据更新。 |
