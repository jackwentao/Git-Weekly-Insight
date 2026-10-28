# CLI 与 API 使用

[返回项目首页](../README.md)

## 在其他目录调用 CLI

首选在仓库根目录运行 `npm run report -- <command>`。在同一个 PowerShell 终端跨目录调用时，可先记录工具仓库路径，再使用 npm 的 `--prefix`：

```powershell
# 在工具仓库根目录执行一次
$reportProject = (Get-Location).Path

# 同一终端切换到其他目录后仍可调用
npm --prefix "$reportProject" run report -- dry-run
```

这种方式由 npm 在工具仓库内运行脚本，并读取工具仓库的 `.env`。仓库另有 [weekly-report 包入口](../bin/weekly-report.js)，它保留调用者的工作目录；直接调用时配置加载位置也随之变化。CLI 无参数时默认执行 `generate`。

## API

```powershell
npm run dev
```

调用 `GET /api/weekly-report` 会执行生成流程，需配置真实模型密钥。

- 成功：`{ ok: true, data: WeeklyReportResult }`。
- 失败：`{ ok: false, error: { message } }`。

## PR 自动审查

仓库包含 [Claude Code Action 工作流](../.github/workflows/claude-code-review.yml)。如需启用，在仓库 Secrets 中配置 `ANTHROPIC_API_KEY`。它与生成周报所用的 `DEEPSEEK_API_KEY` 是两项独立配置。
