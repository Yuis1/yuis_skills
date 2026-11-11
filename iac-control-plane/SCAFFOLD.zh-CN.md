[English](SCAFFOLD.md) | [简体中文](SCAFFOLD.zh-CN.md)

# IaC 控制面仓库脚手架搭建规范

用于仓库初始化与管理边界扩展。日常运维工作流与架构不变量请返回 [SKILL.zh-CN.md](SKILL.zh-CN.md)。脚手架搭建并规范组织基础设施代码控制面仓库，确保模块化、安全性与运维清晰度，避免模板冗余代码蔓延。

## 仓库拓扑不变量

- **根目录极简原则：** 仅跟踪全局编排入口（全量收敛的 `site.yml` 与状态巡检的 `audit.yml`）、共享基线配置（`ansible.cfg` 与 `ansible.local.cfg.example`）、基础文档（`README.md` 与 `CHANGELOG.md`）以及安全模板（`.vault_pass.txt.example`）。
- **双层剧本拓扑结构：** 对于 Ansible 自动化，将专项任务剧本平铺归入 `playbooks/`。变量唯一维护在仓库根目录（`group_vars/` 与 `host_vars/`），通过相对软链接（`playbooks/group_vars -> ../group_vars` 与 `playbooks/host_vars -> ../host_vars`）向剧本暴露，维持单一事实源（`SSOT`）。非 Ansible 技术栈避免人工堆叠剧本或软链接结构。
- **可复用角色底座：** 在 `roles/<role_name>/` 下承载可复用的任务、处理器、默认变量与模板。剧本本身保持轻量化，仅负责主机映射、角色调用、执行时序与显式参数覆盖。
- **多云根模块独立隔离：** 将不同云环境解耦为独立 OpenTofu/Terraform 根目录（位于 `infra/envs/<environment>/`）。每个根目录维护独立本地或远程状态、变量与信任边界。禁止维护全局庞大状态。
- **目标注册表模型：** 维护结构化、机器可校验的目标注册表（如 `infra/policies/cloud-targets.yml` 及其检查器 `check_cloud_targets.sh`），映射云厂商、账户、项目、环境目录、防护策略与工作流白名单。允许声明计划中的目标名称，但禁止未创建资源预填服务商分配的标识符，静态扫描注册表禁止出现机密字段。
- **清单明确分层隔离：** 严格区分主动变更清单（如 `inventory/production.ini` 与 `inventory/development.ini`）与描述性发现目录（如 `inventory/catalog.ini`）。变更执行必须显式携带 `--limit` 目标过滤。
- **本地私有机密隔离：** 设立 `.local-secrets/` 承载本地私有凭据。版本库仅跟踪 `README.md` 与 `*.example` 模板；实体机密文件受 `.gitignore` 严格排除。
- **领域归口辅助脚本：** 自动化与校验脚本按功能域归入 `scripts/<domain>/`（如 `scripts/checks/`、`scripts/ansible/`、`scripts/cloud/`）。`scripts/` 顶层严禁散落可执行脚本。

## 渐进式脚手架向导

1. **识别运维场景需求：** 明确纳管基础设施范围（裸金属物理机、云平台资源、容器运行时或边缘设备），选取最小必要工具集（`Ansible`、`OpenTofu` 或 `Docker Compose`）。
2. **仅实例化活跃根模块：** 仅创建当前需求直接引用的目录与代码骨架。严格禁止为未引入的云厂商或闲置环境预先建立推测性空目录。
3. **建立变量层级与路径锚点：** 使用 Ansible 时，初始化根目录 `group_vars/all/main.yml`，配置动态仓库根解析 `ops_repo_root`，基于 `ops_local_secrets_root` 解析本地机密以支持链接工作树，在 `playbooks/` 下建立相对软链接。
4. **布设本地私有机密边界：** 生成受 `.gitignore` 保护的 `.local-secrets/` 目录，配置初始 `*.example` 模板与 `.vault_pass.txt.example`。
5. **集成基线门禁校验脚本：** 提供离线检查器（如 `check_repository_structure.sh`、文档链接校验器与剧本语法检查）。防护脚本必须显式声明自身能力边界，并配套负向回归夹具证明其能够拦截违规。

## 执行包装器模式

通过受控包装器管理执行环境上下文与配置选择：

```bash
scripts/ansible/with_ansible_config.sh ansible-playbook -i inventory/development.ini playbooks/example.yml --limit hostname --syntax-check
```

- **配置上下文选择：** 优先尊重调用方显式指定的 `ANSIBLE_CONFIG`，其次回退至根目录 `ansible.local.cfg`，缺省使用 `ansible.cfg`。注意 `ansible.local.cfg` 属于完全覆盖而非与基础配置合并。
- **包装器安全边界：** 仅负责选择环境配置上下文，绝不向外广播或凭空合成明文机密。
- **语法检查前置准则：** 在发起远程执行前，先在本地执行语法验证与变量解析推导。
