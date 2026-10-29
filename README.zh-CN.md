[English](README.md) | [简体中文](README.zh-CN.md)

# yuis_skills

## 项目概述

> **目标：** 通过“需求对齐 → 架构决策 → Agent 团队实现 → 对抗性评审与改进 → 质量检查 → 人类反馈 → 经验沉淀为规则”的持续循环，让 Coding Agent 在大型复杂工程中有效发挥作用。

本项目总结了本人长期使用 AI 开发复杂系统时遇到的典型问题：

- **代码腐化与复杂度失控：** 巨型文件、圈复杂度上升、正则与补丁堆叠、未经需求支持的抽象、过度防御性代码与失去用途的遗留代码
- **架构反模式：** 职责过载的入口、业务事实归属不清、依赖方向失控、浅模块、接口复杂、跨架构层的一次性大规模重构
- **虚假完成与测试作弊：** 仅为满足“先失败”流程而制造的失败测试、通过放宽断言或注入跳过标记换取假性测试通过、牺牲用户体验换取 Bug 修复
- **上下文腐败与协调内耗：** 冗长多小时会话导致的推理降智、数十个分支与工作树无序蔓延且未治理、跨端并行导致的接口漂移、总控退化为臃肿的传话筒与会话垃圾桶
- **治理官僚化与元工作膨胀：** 智能体陷入层层嵌套的流程仪式——生成数百个关闭单、清单和样本文件，在自我审查的文山会海中消耗数亿 Token，却连续多个提交未推进产品核心源码路径
- **测试脚手架泥潭与调试死循环：** 子智能体各自重复造轮子编写脆弱的测试运行器，陷入端口冲突、TIME_WAIT 假报警与僵尸进程残留，甚至在清理逻辑中误删共享测试数据库
- **切片假闭环与异步瞬态抢跑：** 仅凭解耦的后端单元测试与前端组件 Mock 通过就宣布功能完成，而未 Mock 的端到端真实全链路长期处于失败状态；在异步网络请求飞渡的过渡态（In-Flight）中抢跑断言误报写丢失，或拿着只读 GET 探针草率证明写入就绪并盲目拉起整栈
- **反馈机制不够系统：** 动手前未对齐、缺乏架构守护与代码质量门控、设计判断欠佳、Bug 证据未持久化
- **Prompt 与文档写作缺陷：** 暴露内部思考、缺乏叙事结构、使用缺乏共同理解的术语

本项目将上述经验系统化，整理为用户级 `AGENTS.md` 与一组可被 Agent 自动发现、按需加载、独立执行和组合使用的 Skills。

`AGENTS.md` 负责承载跨项目稳定原则、安全约束和全局工作偏好；具体操作流程则拆分为架构设计、架构演进、自动守护、安全重构、测试证据、复杂任务复审、Agent 产品治理、多 Agent 协作等场景化技能。

## 使用场景

| 场景 | 技能 | 解决问题 |
|---|---|---|
| 设计或评审系统结构 | `system-design` | 划分业务 Owner、边界和组件，校验依赖方向、副作用归属与契约先行锁定 |
| 把架构规则接入自动化 | `arch-guard` | 设计架构测试、CI Gate、基线棘轮和例外机制 |
| 演进服务、数据或协议 | `arch-evolve` | 分析架构量子与运行耦合，规划 Expand-Contract 和不可逆点 |
| 执行跨模块重构 | `safe-refactor` | 用可运行的纵向切片替换旧路径，及时退役中间切片分支与工作树，避免大爆炸重构与负债积压 |
| 验收复杂或高风险任务 | `review-evidence` | 按风险对复审证据分级，冻结候选版本并生成统一机器事实清单 |
| 判断验证是否真正成立 | `test-evidence` | 区分证据能力边界，落实前置环境探针、故障可解释性与不可变测试目标 |
| 开发或优化 Agent 产品 | `agent-dev` | 版本化治理 Prompt、模型、Schema、工具、编排及确定性评测基准 |
| 组织多 Agent 并行工作 | `agent-team` | 组织二级总控与领域领队，控制任务契约、工作树与分支退役、短命 Worker 会话与总控摘要隔离 |
| 重构并重写受限的提示词 | `ambitious-prompt-rewrite` | 在高度、深度与广度上将平庸任务升维为专业级自闭环指令 |
| 研究可与仓库文件分析分离、前沿或有难度且需大量在线文献的问题 | `chatgpt-chat` | 通过用户现有 Edge/Chrome Profile 咨询 ChatGPT Web |

常见组合：

- 系统拆分：`system-design` → `arch-evolve` → `arch-guard`
- 大范围重构：`safe-refactor` + `test-evidence`；高风险候选再用 `review-evidence`
- Agent 行为变更：`agent-dev` + `test-evidence`

### 借助 `ambitious-prompt-rewrite` 升维提示词

受 Anthropic 工程主管 Felix Rieseberg 发布的万字长文《如何更具雄心：人类与模型的进阶教程》（*How to be more ambitious: A tutorial for humans with models*，2026 年 10 月）启发，`ambitious-prompt-rewrite` 旨在消除人类请求与前沿模型能力之间的“雄心鸿沟”（Ambition Gap）。人类往往出于习惯，将前沿模型限定在平庸、局部、单次的浅层任务中。该技能在三个正交维度上重构提示词：
- **高度（Altitude）：** 将目标提升至超越当前动作的全局视角，把单次手工修复转化为将人类解放出来的持久自闭环系统；
- **深度（Depth）：** 调动领域顶尖专家的专业工具（原生 AST、性能探针、统计学模型），并强制引入外部独立裁判，严禁回路内的口头自我评价；
- **广度（Range）：** 将核心动词映射至正交交叉学科（如做空机构、法务会计师、动效设计师），引入其实质性求证方法学，拒绝浮于表面的角色扮演。

安装后，Agent 可以根据任务和技能描述自动选择；也可以在 Prompt 中明确指定技能。不要在每次任务前预加载整套技能。

示例：

- “使用 `system-design` 评审订单与支付的边界，并给出职责归属图和依赖图。”
- “使用 `ambitious-prompt-rewrite` 把这个平庸的崩溃修复需求升维成多视角的持久化工程指令。”
- “使用 `safe-refactor` 把这次平台替换拆成可独立验证的纵向切片。”
- “使用 `review-evidence` 为这个高风险变更冻结验收范围并准备复审证据。”

> `agent-team` 包含 Paseo 的会话与工作树规则，适合使用 Paseo 编排多 Agent 的环境。

## 配套的用户级 `AGENTS.md`

> 这是一部血泪史，这里的每句话都是本人的翻车事故现场。

仓库根目录的 [`AGENTS.md`](./AGENTS.md) 收录了这套技能配套的用户级规则。它既是维护本仓库时的项目规则，也是向各 Coding Agent 分发全局规则的权威来源。后续应从仓库通过 Ansible 等配置管理工具单向发布，避免同时手工维护仓库和用户目录中的副本。

这份规则只将跨项目原则和硬约束保留在常驻上下文中，具体技能按需加载，因此不能当作完全独立的 Prompt 使用。请配套安装下面三组技能：

| 来源 | `AGENTS.md` 使用的技能 | 作用 |
|---|---|---|
| 本仓库 | `system-design`、`arch-guard`、`arch-evolve`、`safe-refactor`、`review-evidence`、`test-evidence`、`agent-dev`、`agent-team`、`ambitious-prompt-rewrite`、`chatgpt-chat` | 系统架构、演进、自动守护、重构、证据、Agent 协作与提示词升维 |
| [`mattpocock/skills`](https://github.com/mattpocock/skills) | `codebase-design`、`grill-me`、`grill-with-docs`、`prototype`、`to-spec`、`to-tickets`、`wayfinder`、`implement`、`ask-matt`、`research`、`code-review`、`tdd`、`diagnosing-bugs`、`improve-codebase-architecture`、`pr`、`retro`、`to-questionnaire`、`wait-what`、`wizard` | 需求对齐、规划、实现、测试、诊断、代码复审、PR 编写与会话复盘 |
| [`Leonxlnx/taste-skill`](https://github.com/Leonxlnx/taste-skill) | `design-taste-frontend` | 反 AI 模板化先锋视觉、宏观方差打破、网页与应用界面真实浏览器截屏评审 |
| [`nextlevelbuilder/ui-ux-pro-max-skill`](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | `ui-ux-pro-max` | 本地 BM25 垂直行业调色板、字体搭配与交互设计指南检索底座 |
| [`emilkowalski/skills`](https://github.com/emilkowalski/skills) | `emil-design-eng`、`animate`、`review-animations` | 微观人机工效学、物理弹簧阻尼比调优、150~250ms 交互时延硬顶与无障碍减弱动效 |
| [`Nutlope/hallmark`](https://github.com/Nutlope/hallmark) | `hallmark` | 防御型反油腻质量守门员、16 条不可让步 Floor 硬门禁与 `sloplint.mjs` 静态机检 |

`agent-team` 还依赖 Paseo 环境提供的 `paseo-advisor` 和 `paseo-committee`。不使用 Paseo 时，不要安装 `agent-team`，并删除 `AGENTS.md` 中对应的技能指引。

若缺少某组技能，`AGENTS.md` 中直接写出的原则仍然有效，但 Agent 无法按指引加载对应工作流。也可以删除不适用于自己环境的技能引用和工具约束；不要保留无法解析或从未安装的名字。

这是一份有明确个人工作流取向的参考配置，不是通用安全基线。使用前应逐条审核，特别是 Paseo、本地参考路径、模型选择和汇报偏好。

## 双语维护

英文和简体中文是地位相同的语义镜像。贡献者可以先维护自己的母语版本，但每次变更都必须在同一个变更集中同步更新另一版本，不得改变含义、约束强度、示例或范围。

- 英文是默认供客户端发现的版本：`README.md`、`AGENTS.md` 以及各技能的 `SKILL.md`。
- 简体中文镜像使用 `.zh-CN.md`，例如 `README.zh-CN.md`、`AGENTS.zh-CN.md` 和 `SKILL.zh-CN.md`。
- 同一技能的两种语言放在同一个目录中，共用脚本、资源、参考资料、安装路径和技能身份。
- 只有 `SKILL.md` 是可发现的技能入口。本地化镜像属于参考文档，不是第二个技能，从而避免同名技能冲突和两套安装包之间的分叉。
- 每份 `SKILL.md` 与其中文镜像都提供双向语言链接。
- `chatgpt-chat` 的正常工作流不需要用户编写 Prompt，因此有意仅保留英文版；这是唯一有文档记录的例外。
- 结构检查负责发现镜像缺失，以及标题、代码块、链接、路径、命令和规范性标记等易分叉内容的差异；语言质量和语义等价仍须由人工或语义复审保证。

任何一种语言都不是翻译分支或次级事实源。如果一项修改无法在不改变含义的前提下同步到另一版本，应停止合并并先解决底层内容决策。修改流程和验证边界详见[双语维护契约](docs/bilingual-maintenance.zh-CN.md)。

[2026 年 9 月维护记录](docs/optimization-2026-09-23.md)说明当前的触发和授权边界。

## 安装

[Codex](https://developers.openai.com/codex/build-skills)、[Pi](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/skills.md) 和 [OpenCode](https://opencode.ai/docs/skills/) 读取 `~/.agents/skills`；[Claude Code](https://code.claude.com/docs/en/agent-sdk/skills) 读取 `~/.claude/skills`。

### 本技能组

```bash
git clone https://github.com/Yuis1/yuis_skills.git
cd yuis_skills

skills=(
  system-design arch-guard arch-evolve safe-refactor
  review-evidence test-evidence agent-dev agent-team
  ambitious-prompt-rewrite chatgpt-chat
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
# Claude Code users should also run:
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
  --skill design-taste-frontend redesign-existing-projects
```

原版 `gpt-taste` 要求模拟执行并无条件采用营销布局，因此不纳入受控安装集合。其余视觉技能仅在产品任务适用时选择，保留已有设计系统和功能。

### 用户级规则

| 工具 | `AGENTS.md` 的发布位置 |
|---|---|
| [Codex](https://developers.openai.com/codex/guides/agents-md) | `~/.codex/AGENTS.md` |
| [Pi](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/usage.md#context-files) | `~/.pi/agent/AGENTS.md` |
| [OpenCode](https://opencode.ai/docs/rules/) | `~/.config/opencode/AGENTS.md` |
| [Claude Code](https://code.claude.com/docs/en/memory#agentsmd) | `~/.claude/CLAUDE.md` |

通过 Ansible 等配置管理工具从本仓库单向发布。Claude Code 使用同一内容，但文件名为 `CLAUDE.md`。

## 安全说明

Agent Skills 会影响 Agent 的判断和操作，安装前请先阅读内容。除 `chatgpt-chat` 外，本仓库技能仅包含指令和元数据；`chatgpt-chat` 通过 Playwriter 扩展操作用户现有 Edge/Chrome Profile，以沿用登录状态。扩展具有广泛页面控制能力，虽然技能流程只操作自己创建的 ChatGPT 标签页，安装与启用前仍应单独复核其凭据边界。

另外建议使用 `trash-cli`、[DCG](https://github.com/Dicklesworthstone/destructive_command_guard)、BTRFS 快照和异地备份，共同构成纵深防御体系。

## 许可证

[Apache License 2.0](LICENSE)
