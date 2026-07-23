---
name: agent-team
description: 组织多 Agent 并行的分工、会话和工作树。
---

# 组织并行开发

## 派发原则

科斯定理：仅当派发 Sub-agent 收益显著超过派发成本，才进行派发。

## 规划与会话

- 规划阶段：根据难度使用 `paseo-advisor` 或 `paseo-committee` 在 ChatGPT、Claude、GLM 等模型的最强型号间选择。
- 倾向复用会话：任务依赖的上下文有延续性，或启动新会话需要读大量相同文件；因网络、限流等临时出错，发送"继续"并等10分钟。
- 在原会话使用更强型号/思考强度：智能水平难以完成该难度/类型任务，如同一任务连续超过 3 轮重大返修。改型号时，先压缩上下文。
- 以下情况开启新会话：任务依赖的上下文大部分改变。

## 权限与工作树

- Codex：写入或运行态验证使用 `modeId=full-access`；纯静态审查可用 `auto`。
- Paseo Worktree：先记录基线 SHA；创建后验证 `HEAD` 和 `merge-base` 均为该 SHA，不得只信 branch name。
- 仅允许 Root Agent 派发 Sub-agents，Sub-agents 默认禁止创建、启动或委派其他 Agent，包括 paseo run/create、detached/root Agent；需要协助时只向父 Agent 报告。
- 每个工作树同时最多一个 full-access Writer，Reviewer 禁止再委派。
- 所有需回传任务只能由父 Agent 以 relationship=subagent、notifyOnFinish=true 创建，禁止轮询，完成后及时归档。
