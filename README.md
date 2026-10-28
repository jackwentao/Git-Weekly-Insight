# Git Weekly Insight

**把本地 Git 提交和个人笔记整理为 Markdown 周报。** CLI 负责采集、配置自检和生成，Next.js API 提供第二种调用入口。

[CLI 与 API](docs/CLI.md) · [架构与目录](docs/ARCHITECTURE.md) · [配置模板](.env.example)

## 主要能力

- 扫描 `WORK_DIR` 下的 Git 仓库，采集最近 N 天的提交。
- 可选读取 `THOUGHT_PATH` 指定的本地笔记。
- 调用 DeepSeek，解析结构化 JSON，再渲染并保存 Markdown。
- 提供超时、重试、退避和结构化日志。

## 快速开始

准备 **Node.js 20.9+、npm 和 Git**。项目使用 Next.js 16.2.2 / React 19.2.4。以下 PowerShell 命令均在**仓库根目录**执行：

```powershell
npm ci
Copy-Item .env.example .env
npm run report -- check-config
npm run report -- dry-run
```

先把 `.env` 的 `WORK_DIR` 改为待统计仓库的父目录。`dry-run` 只采集并输出预览，无需模型密钥。

需要生成周报时，填写 `DEEPSEEK_API_KEY`，再执行：

```powershell
npm run report -- generate
```

报告保存在 `output/`。生成时会把采集到的提交信息和选定笔记发送给配置的 DeepSeek 服务，使用前请确认统计目录与笔记范围。

## 配置

| 变量 | 用途 / 默认值 |
| --- | --- |
| `WORK_DIR` | 待扫描的本地目录，采集时必填 |
| `DEEPSEEK_API_KEY` | 生成周报时必填；自检和预演不要求 |
| `THOUGHT_PATH` | 可选笔记文件 |
| `SINCE_DAYS` | 统计天数，默认 `7` |
| `DEEPSEEK_MODEL` | 默认 `deepseek-chat` |
| `DEEPSEEK_RETRY_COUNT` | 默认 `2` |
| `DEEPSEEK_TIMEOUT_MS` | 默认 `15000` |
| `DEEPSEEK_BACKOFF_MS` | 默认 `500` |

CLI 从当前工作目录读取 `.env`，配置定义见 [env.ts](src/lib/config/env.ts)。跨目录调用方式见 [CLI 指南](docs/CLI.md)。

## 验证

```powershell
npm run lint
npm test
npm run test:e2e
npm run test:e2e:api
npm run perf:check
```

单元测试覆盖 AI 解析和输出契约，端到端测试使用 Git fixture 与 AI mock。`perf:check` 检查采集与组装阶段的时间预算；它不代表外部模型的生成延迟。

## 目录

```text
src/bin/       CLI 与性能检查入口
src/lib/git/   Git 仓库扫描
src/lib/notes/ 笔记读取
src/lib/ai/    模型调用
src/lib/report/ 编排、解析、渲染与落盘
src/app/api/   Next.js API 入口
output/        生成的 Markdown，默认忽略
```

`.env` 与生成报告默认不提交，`.env.example` 只保存无密钥模板。
