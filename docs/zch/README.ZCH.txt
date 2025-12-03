================================================================================
                        项目开发笔记 - TDesign 工具箱
================================================================================

【项目基本信息】
- 项目名称: tools-zch-tencent-design-251203-01
- 框架: Vue 3 + TDesign + Vite
- 包管理: npm (不是 pnpm)
- Node 版本要求: >= 18.18.0

================================================================================
                              常用命令速查
================================================================================

【安装依赖】
npm install

【启动开发服务器】(注意：AI 不会执行这些命令)
npm run dev              # 开发模式
npm run dev:mock         # Mock 数据模式
npm run dev:linux        # Linux 环境（不自动打开浏览器）

【代码检查与修复】
npm run lint             # ESLint 检查
npm run lint:fix         # ESLint 自动修复
npm run stylelint        # Stylelint 检查（CSS/Less）
npm run stylelint:fix    # Stylelint 自动修复

【构建】
npm run build            # 生产构建
npm run build:test       # 测试环境构建
npm run build:type       # 仅类型检查

================================================================================
                           Git 提交前必做步骤
================================================================================

【问题说明】
本项目配置了 husky + lint-staged，在 git commit 时会自动运行:
1. prettier --write (格式化代码)
2. npm run lint:fix (ESLint 检查并修复)
3. npm run stylelint:fix (Stylelint 检查并修复)

如果检查失败，commit 会被阻止。

【提交前推荐流程】

步骤1: 先手动运行代码格式化和检查
---------------------------------------
npx prettier --write src/你修改的文件路径
npm run lint:fix
npm run stylelint:fix

步骤2: 检查是否有错误（可选，但推荐）
---------------------------------------
npx eslint src/你修改的文件路径 --max-warnings 0

步骤3: 暂存文件
---------------------------------------
git add .
# 或者
git add src/具体文件路径

步骤4: 提交代码
---------------------------------------
git commit -m "类型: 提交信息"

【一键检查修复命令】(提交前运行)
npx prettier --write . && npm run lint:fix && npm run stylelint:fix

================================================================================
                           Commit 消息格式规范
================================================================================

本项目使用 commitlint 检查提交消息，必须符合 Conventional Commits 规范。

【格式】
类型(作用域): 描述

类型(作用域): 描述

详细说明（可选）

【允许的类型 (type)】
- feat     : 新功能
- fix      : Bug 修复
- docs     : 文档变更
- style    : 代码格式（不影响功能）
- refactor : 代码重构
- perf     : 性能优化
- test     : 测试相关
- build    : 构建系统或外部依赖
- ci       : CI 配置
- chore    : 其他杂项
- revert   : 回滚
- types    : 类型定义

【示例】
git commit -m "feat: 添加时间戳转换工具"
git commit -m "fix(tools): 修复时间戳转换精度问题"
git commit -m "docs: 更新开发文档"
git commit -m "style: 格式化代码"

================================================================================
                           常见问题及解决方案
================================================================================

【问题1】commit 时报 ESLint 错误
原因: 代码不符合 ESLint 规则
解决: 
1. 查看错误信息，找到问题文件和行号
2. 运行: npx eslint 问题文件 --fix
3. 如果 --fix 无法自动修复，需手动修改代码
4. 重新 git add 并 commit

【问题2】prettier 和 ESLint 规则冲突
现象: prettier 格式化后 ESLint 报错，或 ESLint 修复后 prettier 报错
解决: 
1. 使用中间变量拆分长链式调用
2. 避免单行过长的链式方法调用

【问题3】commit 消息格式错误
现象: husky - commit-msg script failed
解决: 确保消息格式为 "类型: 描述" 或 "类型(作用域): 描述"
错误示例: git commit -m "添加新功能"
正确示例: git commit -m "feat: 添加新功能"

【问题4】stylelint 报错
原因: CSS/Less 代码不符合规范
解决: npm run stylelint:fix

================================================================================
                              快速命令组合
================================================================================

【提交前完整检查】
npx prettier --write . && npm run lint:fix && npm run stylelint:fix && git add . && git status

【检查单个文件】
npx eslint src/pages/tools/timestamp-converter/index.vue --max-warnings 0

【格式化并检查单个文件】
npx prettier --write src/文件路径 && npx eslint src/文件路径 --max-warnings 0

【清理并重装依赖】
rm -rf node_modules package-lock.json && npm install

【Windows PowerShell 清理】
Remove-Item -Recurse -Force node_modules, package-lock.json; npm install

================================================================================
                              项目路由地址
================================================================================

/dashboard/base          - 仪表盘
/bookmark/zch            - 书签管理
/tools/timestamp-converter - 时间戳转换工具

================================================================================
                              注意事项
================================================================================

1. 请勿让 AI 执行 npm run dev, npm run build 等启动/构建命令
2. AI 可以执行 npm install, eslint, prettier 等检查命令
3. 提交前务必运行 lint 检查，避免提交失败
4. commit 消息必须符合规范，否则会被 commitlint 拦截

================================================================================

