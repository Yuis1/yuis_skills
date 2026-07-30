# yuis_skills

面向 Coding Agent 与生产力 Agent 的场景化技能集，用于复杂软件工程中的架构设计、自动治理、安全演进、重构、验证和多 Agent 协作。

每个技能只负责一个目标，`description` 只做触发钩子；正文提供可执行工作流，低频细节按需加载，避免一次占用过多上下文。

## 使用场景

| 场景 | 技能 | 主要解决的问题 |
|---|---|
| 设计或评审系统结构 | `system-design` | 划分业务 Owner、边界和组件，校验依赖方向与副作用归属 |
| 把架构规则接入自动化 | `arch-guard` | 设计架构测试、CI Gate、基线棘轮和例外机制 |
| 演进服务、数据或协议 | `arch-evolve` | 分析架构量子与运行耦合，规划 Expand-Contract 和不可逆点 |
| 执行跨模块重构 | `safe-refactor` | 用可工作的纵向切片替换旧路径，避免大爆炸重构和长期互锁 |
| 验收复杂或高风险任务 | `review-evidence` | 冻结验收范围，生成绑定候选版本的可复现证据 |
| 判断验证是否真正成立 | `test-evidence` | 区分行为、静态和非代码证据，安全迁移遗留测试 |
| 开发或优化 Agent 产品 | `agent-dev` | 版本化治理 Prompt、模型、Schema、工具、编排和评测 |
| 组织多 Agent 并行工作 | `agent-team` | 控制派发成本、会话复用、工作树、Writer 与 Reviewer 权限 |
| 咨询已登录的 ChatGPT Web | `chatgpt-chat` | 通过专用 Chrome 或 Edge Profile 管理 Project、长回答与附件 |

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

## 配套的用户级 AGENTS.md

> 这是一部血泪史，这里的每句话都是本人的翻车事故现场。

仓库根目录的 [`AGENTS.md`](./AGENTS.md) 收录了这套技能配套的用户级规则。它既是维护本仓库时的项目规则，也是向各 Coding Agent 分发全局规则的权威来源。后续应从仓库通过 Ansible 等配置管理工具单向发布，避免同时手工维护仓库和用户目录中的副本。

这份规则刻意只常驻跨项目原则和硬约束，把具体工作流按技能名延迟加载，因此不能把它当作一份完全独立的 Prompt 使用。要让其中的技能指引完整生效，建议把下面三组技能作为一套安装和版本管理：

| 来源 | `AGENTS.md` 使用的技能 | 作用 |
|---|---|---|
| 本仓库 | `system-design`、`arch-guard`、`arch-evolve`、`safe-refactor`、`review-evidence`、`test-evidence`、`agent-dev`、`agent-team` | 系统架构、演进、自动守护、重构、证据与 Agent 协作 |
| [`mattpocock/skills`](https://github.com/mattpocock/skills) | `codebase-design`、`grill-me`、`grill-with-docs`、`prototype`、`to-spec`、`to-tickets`、`wayfinder`、`implement`、`ask-matt`、`research`、`code-review`、`tdd`、`diagnosing-bugs`、`improve-codebase-architecture`、`resolving-merge-conflicts` | 需求对齐、规划、实现、测试、排障、代码评审与模块设计 |
| [`Leonxlnx/taste-skill`](https://github.com/Leonxlnx/taste-skill) | `gpt-taste`、`design-taste-frontend`、`redesign-existing-projects` | 新前端设计与既有界面翻新 |

`agent-team` 还依赖 Paseo 环境提供的 `paseo-advisor` 和 `paseo-committee`。不使用 Paseo 时，不要安装 `agent-team`，并删除 `AGENTS.md` 中对应的技能指引。

若缺少某组技能，`AGENTS.md` 中直接写出的原则仍然有效，但 Agent 无法按指引加载对应工作流。也可以删除不适用于自己环境的技能引用和工具约束；不要保留无法解析或从未安装的名字。

这是一份有明确个人工作流取向的参考配置，不是通用安全基线。使用前应逐条审核，特别是 Paseo、`trash-cli`、本地参考路径、模型选择和汇报偏好。

## 安装

[Codex](https://developers.openai.com/codex/build-skills)、[Pi](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/skills.md) 和 [OpenCode](https://opencode.ai/docs/skills/) 读取 `~/.agents/skills`；[Claude Code](https://code.claude.com/docs/en/agent-sdk/skills) 读取 `~/.claude/skills`。

### 本技能组

```bash
git clone https://github.com/Yuis1/yuis_skills.git
cd yuis_skills

skills=(
  system-design arch-guard arch-evolve safe-refactor
  review-evidence test-evidence agent-dev agent-team chatgpt-chat
)
repo_dir="$(pwd -P)"

link_skills() {
  local root="$1"
  mkdir -p "$root"
  for skill in "${skills[@]}"; do
    [[ -e "$root/$skill" || -L "$root/$skill" ]] ||
      ln -s "$repo_dir/$skill" "$root/$skill"
  done
}

link_skills "$HOME/.agents/skills"
# Claude Code 用户再执行：
link_skills "$HOME/.claude/skills"
```

### 配套技能

依赖版本固定如下：

| 仓库 | 固定版本 |
|---|---|
| [`mattpocock/skills`](https://github.com/mattpocock/skills/tree/v1.1.0) | `v1.1.0`（`eabea89380927aadb93abf6e290a19334d249292`） |
| [`Leonxlnx/taste-skill`](https://github.com/Leonxlnx/taste-skill/tree/e988add20dab0fa97d7a76781c48961c8184288e) | `e988add20dab0fa97d7a76781c48961c8184288e` |

```bash
git clone --branch v1.1.0 --depth 1 \
  https://github.com/mattpocock/skills.git ../mattpocock-skills
git clone https://github.com/Leonxlnx/taste-skill.git ../taste-skill
git -C ../taste-skill checkout --detach \
  e988add20dab0fa97d7a76781c48961c8184288e

npx skills@latest add ../mattpocock-skills --global --skill '*'
npx skills@latest add ../taste-skill --global \
  --skill design-taste-frontend gpt-taste redesign-existing-projects
```

### 用户级规则

| 工具 | `AGENTS.md` 的发布位置 |
|---|---|---|
| [Codex](https://developers.openai.com/codex/guides/agents-md) | `~/.codex/AGENTS.md` |
| [Pi](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/usage.md#context-files) | `~/.pi/agent/AGENTS.md` |
| [OpenCode](https://opencode.ai/docs/rules/) | `~/.config/opencode/AGENTS.md` |
| [Claude Code](https://code.claude.com/docs/en/memory#agentsmd) | `~/.claude/CLAUDE.md` |

建议通过 Ansible 等配置管理工具从本仓库单向发布。Claude Code 使用同一内容，但文件名为 `CLAUDE.md`。

### 更新

本仓库执行 `git pull --ff-only`。配套技能保持上述固定版本；升级时同时更新版本记录并复核 `AGENTS.md`。

## 安全说明

Agent Skills 会影响 Agent 的判断和操作，安装前请先阅读内容。除 `chatgpt-chat` 外，本仓库技能仅包含指令和元数据；`chatgpt-chat` 带有经过测试的浏览器驱动，使用隔离 Chrome 或 Edge Profile 和短生命周期本地 CDP，安装与启用前应单独复核其凭据边界。

## 许可证

[Apache License 2.0](LICENSE)
