# 环境变量与启动命令说明

## 环境变量文件

| 文件 | mode | 用途 |
|------|------|------|
| `.env` | 所有模式 | 公共基础配置，所有模式都会加载 |
| `.env.development` | development | 本地开发环境 |
| `.env.test` | test | 测试环境打包 |
| `.env.release` | release | 生产环境打包（需从 `.env.release.example` 复制创建） |
| `.env.release.example` | — | 生产环境模板，不参与加载，仅供参考 |
| `.env.site` | site | TDesign 官方演示站打包 |

## Vite 加载规则

- `--mode xxx` 时，Vite 会加载 `.env` + `.env.xxx`，**同名变量 `.env.xxx` 覆盖 `.env`**
- `.env.release.example` 不会被 Vite 加载，因为它不匹配任何 mode 名

## 启动命令与环境变量对应关系

| 命令 | mode | 加载的 env 文件 | 说明 |
|------|------|----------------|------|
| `npm run dev` | development | `.env` + `.env.development` | 本地开发，API → `127.0.0.1:3000` |
| `npm run dev:mock` | mock | `.env`（无 .env.mock） | 本地开发 + mock 数据 |
| `npm run dev:linux` | development | `.env` + `.env.development` | 同 dev，但不自动打开浏览器 |
| `npm run build:test` | test | `.env` + `.env.test` | 测试环境打包 |
| `npm run build` | release | `.env` + `.env.release` | 生产环境打包 |
| `npm run build:site` | site | `.env` + `.env.site` | TDesign 官方演示站打包 |

## 各环境关键变量对比

| 变量 | development | test | release | site |
|------|-------------|------|---------|------|
| `VITE_BASE_URL` | `/` | `/` | `/` | `https://static.tdesign.tencent.com/starter/vue-next/` |
| `VITE_API_URL` | `http://127.0.0.1:3000` | `https://service-exndqyuk-1257786608.gz.apigw.tencentcs.com` | 空（靠 Vercel rewrites） | `https://service-bv448zsw-1257786608.gz.apigw.tencentcs.com` |
| `VITE_AUTH_API_TARGET` | `http://218.29.176.224:8079` | — | `http://218.29.176.224:8079` | — |
| `VITE_API_TARGET` | `http://127.0.0.1:3000` | — | `http://127.0.0.1:3000` | — |
| `VITE_API_URL_PREFIX` | `/api` | `/api` | `/api` | `/api` |
| `VITE_IS_REQUEST_PROXY` | true | true | true | true |

## 首次使用

如果需要 `npm run build` 打包，先创建生产环境配置：

```bash
cp .env.release.example .env.release
# 然后根据实际情况修改 .env.release 中的值
```
