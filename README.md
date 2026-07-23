# yuis_skills

面向 Coding Agent 与生产力 Agent 的场景化技能集，用于复杂软件工程中的架构设计、自动治理、安全演进、重构、验证和多 Agent 协作。

这些技能不是教程或书摘。每个技能只负责一个目标，`description` 只做触发钩子；正文提供可执行工作流，低频细节按需加载，避免一次占用过多上下文。

## 使用场景

| 场景 | 技能 | 主要解决的问题 |
|---|---|---|
| 设计或评审系统结构 | `system-design` | 划分业务 Owner、边界和组件，校验依赖方向与副作用归属 |
| 把架构规则接入自动化 | `arch-guard` | 设计架构测试、CI Gate、基线棘轮和例外机制 |
| 演进服务、数据或协议 | `arch-evolve` | 分析架构量子与运行耦合，规划 Expand-Contract 和不可逆点 |
| 执行跨模块重构 | `safe-refactor` | 用可工作的纵向切片替换旧路径，避免大爆炸重构和长期互锁 |
| 验收复杂或高风险任务 | `review-evidence` | 冻结验收范围，生成绑定候选版本的可复现证据 |
| 判断验证是否真正成立 | `test-evidence` | 区分行为、静态和非代码证据，安全迁移遗留测试 |
| 开发或优化 Agent 产品 | `agent-dev` | 版本化治理 Prompt、模型、Schema、工具、编排和评测 |
| 组织多 Agent 并行工作 | `agent-team` | 控制派发成本、会话复用、工作树、Writer 与 Reviewer 权限 |

常见组合：

- 系统拆分：`system-design` → `arch-evolve` → `arch-guard`
- 大范围重构：`safe-refactor` + `test-evidence`；高风险候选再用 `review-evidence`
- Agent 行为变更：`agent-dev` + `test-evidence`

安装后，Agent 可以根据任务和技能描述自动选择；也可以在 Prompt 中明确指定技能。不要在每次任务前预加载整套技能。

示例：

- “使用 `system-design` 评审订单与支付的边界，并给出 Owner 和依赖图。”
- “使用 `safe-refactor` 把这次底座替换拆成可独立验证的纵向切片。”
- “使用 `review-evidence` 为这个高风险变更冻结验收范围并准备复审证据。”

> `agent-team` 包含 Paseo 的会话与工作树规则，适合使用 Paseo 编排多 Agent 的环境。

## 安装

[Codex](https://developers.openai.com/codex/build-skills)、[Pi](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/skills.md) 和 [OpenCode](https://opencode.ai/docs/skills/) 均可从 `~/.agents/skills` 发现用户级技能；[Claude Code](https://code.claude.com/docs/en/agent-sdk/skills) 使用 `~/.claude/skills`。

以下命令适用于 macOS 与 Linux 的 Bash 环境。

### 1. 克隆仓库

```bash
git clone https://github.com/Yuis1/yuis_skills.git
cd yuis_skills
```

### 2. 安装到通用目录

下面的命令为每个技能建立符号链接。若同名位置已经是真实文件或目录，则跳过，不会覆盖。

```bash
skills=(
  system-design
  arch-guard
  arch-evolve
  safe-refactor
  review-evidence
  test-evidence
  agent-dev
  agent-team
)

repo_dir="$(pwd -P)"
skill_root="$HOME/.agents/skills"
mkdir -p "$skill_root"

for skill in "${skills[@]}"; do
  target="$skill_root/$skill"
  if [[ -e "$target" && ! -L "$target" ]]; then
    printf '跳过：%s 已存在且不是符号链接\n' "$target"
    continue
  fi
  ln -sfn "$repo_dir/$skill" "$target"
done
```

这一步适用于 Codex、Pi、OpenCode 及其他读取 Agent Skills 通用目录的工具。

### 3. Claude Code

Claude Code 用户再把同一组技能链接到专用目录：

```bash
repo_dir="$(pwd -P)"
skill_root="$HOME/.claude/skills"
mkdir -p "$skill_root"

for skill in \
  system-design arch-guard arch-evolve safe-refactor \
  review-evidence test-evidence agent-dev agent-team
do
  target="$skill_root/$skill"
  if [[ -e "$target" && ! -L "$target" ]]; then
    printf '跳过：%s 已存在且不是符号链接\n' "$target"
    continue
  fi
  ln -sfn "$repo_dir/$skill" "$target"
done
```

安装后请开启新会话，让 Agent 重新发现技能。

### 更新

符号链接始终指向本仓库，后续只需：

```bash
git pull --ff-only
```

## 安全说明

Agent Skills 会影响 Agent 的判断和操作。安装第三方技能前应先阅读内容。本仓库当前只包含 Markdown 指令和 YAML 展示元数据，不包含可执行脚本。
