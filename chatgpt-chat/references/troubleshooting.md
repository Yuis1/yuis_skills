# Troubleshooting

只读取与 CLI 错误码同名的小节。

## COMMAND_MISSING

请求 `yuis_ops` Owner 应用 `chatgpt_chat` 角色；不要手工安装或创建链接。

## BROWSER_NOT_CONNECTED

确认日常 Edge 或 Chrome 正在运行且 Playwriter 扩展已启用。CLI 已自动等待重连；不得改用测试浏览器、专用 Profile、云浏览器或复制 Cookie。

## BROWSER_PROFILE_AMBIGUOUS

首选浏览器家族连接了多个 Profile。只保留目标 Profile 的 Playwriter 连接后重试；不得根据邮箱、当前标签页或最近活动猜测账号。

## AUTH_REQUIRED

当前 Profile 没有 ChatGPT 登录状态。正常设计应沿用用户已有登录；如果确实退出，只能在同一日常 Profile 完成认证。不得读取或迁移凭据。

## AUTH_UNVERIFIED

页面既不能证明已登录，也没有显示登录入口。报告可见 UI 回归；不得发送。

## CHALLENGE_REQUIRED

不要规避可见挑战。运行时不会降低安全约束或切换到其他 Profile。

## RUNTIME_MISSING

请求托管 `chatgpt_chat.yml` 收敛；不要自行安装 Playwriter、npm 或浏览器包。

## BROWSER_BUSY

另一个操作正在控制 ChatGPT。等待完成；不得并行启动第二个操作。

## project_missing

这是状态而非错误。只有在 Projects 列表加载并确认无精确同名项目后才会返回；需要新会话时调用 `ask --new`。

## Generic browser operation failure

只读取脱敏诊断尾部。没有匹配错误码时报告 ChatGPT UI 或 Playwriter 回归；普通调用不要读取源码。
