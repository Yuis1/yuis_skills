[English](bilingual-agent-skills.md) | [简体中文](bilingual-agent-skills.zh-CN.md)

# 双语和多语言 Agent Skills 仓库

**调研日期：** 2026-08-12。本调研以本地 Pi 0.83.0 文档，以及 Agent Skills 规范、Codex CLI 0.146.0、Claude Code 2.1.220 和 OpenCode 1.18.9 的一手文档为依据。

## 决策摘要

采用**一个技能身份和一个可发现入口**。使用 ASCII 目录名和唯一的 `SKILL.md` 承载与语言无关的身份；翻译文件作为同一技能目录下的辅助文件存在。

```text
skill-name/
├── SKILL.md                    # 唯一可发现入口
├── references/
│   └── zh-CN.md                # 翻译后的辅助文档；不是技能
├── scripts/                    # 可选，由所有语言共享
└── assets/                     # 可选，由所有语言共享
```

本仓库现有的 `SKILL.zh-CN.md` 命名方式同样安全，前提是文件始终位于规范技能目录内。`references/zh-CN.md` 更明确地符合 Agent Skills 的目录形式。无论采用哪一种方式，都不要增加第二个 `SKILL.md`、`foo-zh` 技能目录或本地化的 `name` 字段。

语言选择是**发现技能之后由模型作出的选择**，而不是技能发现功能：规范入口可以声明，用户明确指定的语言优先；否则根据用户最新请求所用语言选择对应参考文件。被选择的参考文件只改变呈现语言，不改变技能名称、范围、工具、安全规则或工作流。本调研涉及的所有规范都没有定义可移植的 `language`、`locale`、翻译关系或语言协商字段。

机械检查可以证明发现过程安全、镜像覆盖完整、结构对齐，以及高风险字面量和规范性标记得到保留，但不能证明两份自然语言文档含义完全一致。因此仍然需要双语人工复审和成对行为评测。

## 一手资料确立的规则

| 来源 | 相关契约 | 对双语技能的影响 |
|---|---|---|
| [Agent Skills 规范][spec] | 技能是包含 `SKILL.md` 的目录；`name` 和 `description` 必填；`name` 必须与目录一致；允许其他文件和 `references/`；内容采用渐进披露方式加载。 | 翻译应作为辅助资源，而不是以第二个入口与技能并列。身份字段只保留在规范文件中。 |
| [Agent Skills 客户端集成指南][integration] | 客户端通常扫描包含精确文件名 `SKILL.md` 的目录，最初只披露名称和描述，并且必须以确定性方式处理名称冲突。 | 第二个可发现文件就是第二个目录候选。客户端规范没有把它重新合并为同一技能的语言选择步骤。 |
| [Pi 技能文档][pi] | Pi 会递归扫描 `.agents/skills` 等位置中包含 `SKILL.md` 的目录；只有 Pi 原生根目录中的直接 `.md` 文件属于特殊情况。缺少描述的技能不会加载，未知 Frontmatter 会被忽略，同名冲突会发出警告并保留第一个技能。 | 在共享目录布局中，技能目录内非 `SKILL.md` 的翻译不会成为第二个入口。不要把翻译展平到 Pi 原生根目录，也不要创建嵌套的 `SKILL.md`。 |
| [Codex 构建技能文档][codex] | Codex 会在仓库、用户、管理员和系统范围扫描 `.agents/skills`，支持符号链接形式的技能目录，使用描述进行隐式调用，并且不会合并同名技能。`agents/openai.yaml` 是可选的 UI/策略元数据。 | 同一个共享目录可以暴露给 Codex。中文显示标签可以放在 Codex 专用 UI 元数据中，但该元数据不是可移植的语言选择器。 |
| [Claude Code 技能文档][claude] | 项目和个人技能采用 `<skill-name>/SKILL.md`；辅助文件按需加载；目录名决定普通命令名；嵌套的重复名称可能成为带目录限定的变体。Claude 专用 Frontmatter 扩展了规范，而非标准字段可能导致 Claude Code 之外的打包失败。 | 为保证可移植性，规范 Frontmatter 应取各客户端支持范围的交集。翻译必须是被引用的辅助文件，而不是另一个 Claude 技能或命令。 |
| [OpenCode Agent Skills 文档][opencode] | OpenCode 会在 `.opencode`、`.claude` 和 `.agents` 位置查找 `skills/*/SKILL.md`；要求名称与目录一致；按名称和描述列出技能；要求技能名称唯一。 | 不要假设额外的嵌套 `SKILL.md` 会被所有客户端忽略；除非已经检查实际解析出的目录，否则不要通过多个 OpenCode 搜索根暴露同一身份。 |

规范提供的 `skills-ref validate` 工具会验证技能目录和 Frontmatter；其参考实现不会比较翻译正文或辅助文件。参见[参考库][skills-ref]，特别是其中的 [`validator.py`][validator]。

## 最安全的文件布局和身份规则

### 推荐的仓库形态

1. 技能源码只在一个目录树中保存一次。按各客户端要求，将同一个目录安装或链接到发现根目录；不要在不同安装树中分别维护英文和中文副本。
2. 镜像放在同一技能目录下的 `SKILL.zh-CN.md`。本仓库选择这种明确的同目录约定；`references/zh-CN.md` 在规范下同样安全，但本仓库不采用。镜像是普通 Markdown 资源，不应包含第二个 Agent Skills Frontmatter。简短标题、返回链接和可供机器读取的 HTML 注释已经足够。
3. 控制 `SKILL.md` 大小，并使用相对路径链接镜像。规范和 Pi 都以技能根目录为基准解析辅助资源；规范建议采用浅层引用。
4. 使用 `agent-dev` 这样的 ASCII 身份，不要使用 `agent-dev-zh`，也不要使用中文目录名或名称。规范允许小写字母、数字和连字符，而 OpenCode 文档规定了更严格的 ASCII 正则，因此 ASCII 是安全交集。
5. 规范 Frontmatter 只使用跨客户端字段：`name`、`description`、`license`、`compatibility` 和 `metadata`。不要发明顶层 `language` 或 `locale` 字段。规范的 `allowed-tools` 与各客户端的调用控制字段支持程度不一；确有需要时，应使用客户端专用适配层。
6. 可执行代码、路径、选项名、环境变量、URL 和资源必须共享。翻译不得造成运行工件分叉。

本仓库 [`README.md`](../../README.md#bilingual-maintenance) 中的现有策略已经规定了核心不变量：同一目录、唯一可发现的 `SKILL.md`、成对链接、同一变更集内同步更新，以及结构检查之后的人工语义复审。[`agent-dev` 配对文件](../../agent-dev/SKILL.md)演示了入口到镜像的链接。Codex 专用的 [`agents/openai.yaml`](../../agent-dev/agents/openai.yaml) 则展示了独立的 UI 元数据层；它不会创建另一个技能身份。

### 为什么第二个 `SKILL.md` 不安全

同一对文件在不同客户端中可能表现不同：

- Pi 发出警告后保留第一个同名技能。
- Codex 不会合并两个同名技能。
- Claude 可能覆盖另一作用域中的技能，或以限定名称暴露嵌套变体。
- OpenCode 要求其搜索位置中的名称保持唯一。

因此，客户端不会把 `skill-name/SKILL.md` 和 `skill-name-zh/SKILL.md` 识别为翻译对，而会把它们识别为两个可能包含冲突指令的技能。嵌套的 `skill-name/zh-CN/SKILL.md` 同样不安全，因为即使另一个客户端碰巧忽略它，Pi 的递归发现仍然可能找到它。只有当 `SKILL.zh-CN.md` 作为非入口文件位于规范目录内时才是安全的；如果把它平铺复制到 Pi 原生发现根目录中，Pi 对根目录 `.md` 的特殊规则可能使其不再安全。

符号链接只能解决源码重复，不能解决身份重复。Codex 和 Claude 都记录了符号链接支持，Claude 还明确会对从多个位置到达的同一目标去重。OpenCode 文档则要求所有位置中的名称唯一。因此，当同一个进程同时扫描 `.agents/skills` 和 `.claude/skills` 时，除非该客户端的实际技能目录能够证明按真实路径去重，否则每个实际技能只应通过其中一条路径暴露。

## 可移植的语言选择方式

本调研涉及的客户端都不会协商技能语言。可移植做法如下：

1. 让普通技能目录根据英文 `SKILL.md` 的描述发现 `skill-name`。
2. 在规范正文中用英文声明选择规则，使每个客户端都能遵循：
   - 用户明确要求中文时，选择 `SKILL.zh-CN.md`；
   - 否则根据用户最新请求所用语言选择可用镜像；
   - 如果没有对应镜像，使用规范英文指令；
   - 镜像是同一契约的翻译，不是覆盖项；如果出现冲突，应停止并修复镜像，而不是选择约束更弱的规则。
3. 技能命令或提及方式保持不变（`/skill-name`、`$skill-name` 或客户端的等效形式）。不要要求用户调用带语言后缀的技能。
4. 如果客户端具有独立呈现层，则在该层进行本地化。例如，Codex 可选的 `agents/openai.yaml` 可以提供中文显示名称或默认 Prompt，但它不会改变发现过程或创建语言语义。

规范 `description` 应保持简洁，说明技能的作用和使用时机，并包含触发词。如果需要增强中文用户的隐式发现，可以在同一个描述中加入少量中文触发词；不要把第二份本地化描述增加为另一条目录记录。这样做符合规范、Pi 和 Codex 关于“描述驱动激活”的指引。

仓库可以允许先修改任一语言，但两个文件必须在同一个可复审变更集中更新。将共享的单元 ID、命令、路径和规范性标记视为契约。这样既保留了仓库的双语同等权威策略，也不会假装客户端能够把两个语言变体发现为同一个对象。

## CI 能够验证什么

除了标准验证器外，还应运行一个小型仓库检查器。以下检查具有确定性，适合作为阻断 Gate：

### 1. 发现与身份

- 查找每个预期的规范技能目录，并断言其中恰好只有一个大写 `SKILL.md`。
- 解析规范 Frontmatter 并运行 `skills-ref validate`；同时要求更严格的跨客户端 ASCII 名称正则，以及名称与目录一致。
- 断言镜像目录中不存在 `SKILL.md`，镜像没有作为同级技能目录安装，也不包含第二份可发现 Frontmatter。
- 解析配置的发现根目录，并断言每个客户端中每个技能身份只出现一次。发现同名冲突时直接报告，不依赖“第一个优先”的顺序。
- 检查每个镜像路径都位于规范技能目录内、每个链接目标存在，并且所有相对路径仍然有效。

### 2. 双向镜像覆盖

为每个规范性章节或指令单元分配稳定的不透明 ID，例如：

```markdown
<!-- mirror-unit id=external-side-effects kind=prohibition severity=high -->
...
<!-- /mirror-unit -->
```

同一组 ID 必须在 `SKILL.md` 和每个镜像中分别且唯一地出现。检查器应要求：

```text
IDs(SKILL.md) == IDs(zh-CN.md)
```

并要求每个 ID 具有相同的单元类型、严重程度、顺序（如果顺序影响行为）和镜像修订号。这是真正的双向检查：既能发现英文单元在中文中缺失，也能发现只在中文中新增、却没有英文对应项的单元。如果不希望使用 HTML 注释，也可以用 Sidecar Manifest 保存这些 ID，但 Manifest 应描述契约，而不是复制正文。

### 3. 高价值结构与字面量对等

对每个配对单元比较：

- 标题和单元结构、列表或步骤数量、代码围栏语言；
- 代码块逐字节一致，除非记录了经过复审的明确例外；
- 链接目标、相对文件路径、URL、环境变量名、命令名、Flag、占位符、正则表达式、标识符和数值阈值；
- 用稳定标签而不是翻译词表示的机器可读规范性标记，例如 `must`、`must-not`、`may`、`should`、`prohibition` 和 `side-effect`；
- 被引用脚本、资源和其他工件的集合。

不要比较原始 Markdown Hash 或逐行正文，因为正确翻译的词语和换行必然不同。也不要用关键词数量证明含义。本地规则同样禁止把需要语言语义的判断伪装成正则或固定话术；确定性检查只用于协议、标识符和硬约束（参见 [`AGENTS.md`](../../AGENTS.md)）。

### 4. 行为与人工复审

维护输入相同的成对英文和中文 Prompt，并使用相同的动作级断言：允许或禁止的动作、必需工件、命令或路径，以及错误行为。使用同一个技能版本，在全新会话中运行。尽可能比较结构化输出和副作用，而不是比较翻译后的正文。Agent Skills 评测指南建议使用真实且多样的 Prompt、边界情况、具体断言、相互隔离的“使用技能/基线”运行，并由人工复核断言无法表达的质量（参见[评测指南][evaluation]）。

因此，机械检查通过只表示**结构和契约对等**，不表示已经证明语义等价。对安全规则、权限、不可逆操作、工具使用和例外处理的每次修改，仍须由双语 Reviewer 复核。如果两份文本不一致，应让复审失败，而不是静默选择限制较宽松的语言。

## 实用 Gate

对于每个涉及技能或镜像的 Pull Request，Preflight/CI Gate 应依次执行：

1. `skills-ref validate <skill-directory>`。
2. 上述发现和身份检查。
3. 镜像单元集合相等与修订检查。
4. 字面量、链接、路径、命令和规范性标记对等检查。
5. 对影响行为的变更运行成对英文/中文评测。
6. 由人工进行含义、安全性和可用性的双语复审。

这样可以让五种客户端都只发现一个技能，在激活后进行可预测的语言选择，并提供有价值的自动化漂移检测，同时避免声称解析器能够认证翻译质量。

## 一手资料

- [Agent Skills 规范][spec]
- [Agent Skills 客户端实现指南][integration]
- [Agent Skills 评测指南][evaluation]
- [Agent Skills `skills-ref` README][skills-ref] 与[验证器实现][validator]
- [Pi 技能文档（上游）][pi]——同时检查了本机 Pi 0.83.0 的 `/home/yuis/.local/lib/node_modules/@earendil-works/pi-coding-agent/docs/skills.md`
- [OpenAI Codex：构建技能][codex]
- [Claude Code：使用技能扩展 Claude][claude]
- [OpenCode：Agent Skills][opencode]

[spec]: https://agentskills.io/specification.md
[integration]: https://agentskills.io/client-implementation/adding-skills-support.md
[evaluation]: https://agentskills.io/skill-creation/evaluating-skills.md
[skills-ref]: https://github.com/agentskills/agentskills/tree/main/skills-ref
[validator]: https://github.com/agentskills/agentskills/blob/main/skills-ref/src/skills_ref/validator.py
[pi]: https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/skills.md
[codex]: https://developers.openai.com/codex/build-skills.md
[claude]: https://code.claude.com/docs/en/skills.md
[opencode]: https://opencode.ai/docs/skills.md
