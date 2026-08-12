[English](SKILL.md) | [简体中文](SKILL.zh-CN.md)

# 组织并行开发

## 派发原则

科斯定理：仅当派发 Sub-agent 的收益显著超过派发成本时，才进行派发。

## 规划与会话

- 规划阶段：根据任务难度使用 `paseo-advisor` 或 `paseo-committee`，在 ChatGPT、Claude、GLM 等模型的最强型号间选择。
- 当任务依赖延续性上下文，或启动新会话需要读取大量相同文件时，倾向复用会话。因网络、限流等临时出错时，发送“继续”并等待十分钟。
- 当前智能水平难以完成任务时，在原会话使用更强的模型或思考强度，例如同一任务连续超过三轮重大返修。改型号前先压缩上下文。
- 当任务所需的大部分上下文已经改变时，开启新会话。

## 权限与工作树

- Codex：写入或运行态验证使用 `modeId=full-access`；纯静态复审可用 `auto`。
- Paseo Worktree：先记录基线 SHA；创建后验证 `HEAD` 和 `merge-base` 均为该 SHA，不得只信分支名。
- 仅允许 Root Agent 派发 Sub-agent。Sub-agent 默认禁止创建、启动或委派其他 Agent，包括 Paseo run/create、detached/root Agent；需要协助时只向父 Agent 报告。
- 每个工作树同时最多只能有一个 full-access Writer；Reviewer 禁止继续委派。
- 所有需要回传的任务都只能由父 Agent 以 `relationship=subagent`、`notifyOnFinish=true` 创建。禁止轮询，完成后及时归档 Agent。
