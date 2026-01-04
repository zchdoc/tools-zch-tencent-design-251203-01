// commit-lint config
// 提交格式: <type>: <subject>
// 例如: feat: 添加用户登录功能
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        // ========== 功能开发 ==========
        'feat', // 新功能 (feature)
        'fix', // 修复 bug
        'bug', // 修复 bug（fix 的别名）
        'hotfix', // 紧急修复
        'patch', // 补丁

        // ========== 代码质量 ==========
        'refactor', // 重构（不是新功能，也不是修复bug）
        'perf', // 性能优化
        'style', // 代码格式（不影响代码运行的变动）
        'types', // 类型定义文件修改
        'lint', // 代码检查修复

        // ========== 文档相关 ==========
        'docs', // 文档变更
        'comment', // 注释修改

        // ========== 测试相关 ==========
        'test', // 测试用例

        // ========== 构建部署 ==========
        'build', // 构建流程、外部依赖变更（如 webpack、npm）
        'ci', // CI 配置、脚本文件修改
        'deploy', // 部署相关
        'release', // 发布新版本
        'config', // 配置文件修改

        // ========== 项目管理 ==========
        'init', // 初始化项目
        'chore', // 杂项（不修改 src 或测试文件）
        'revert', // 回退
        'merge', // 合并分支
        'sync', // 同步代码
        'wip', // 开发中 (Work In Progress)
        'workflow', // 工作流改进

        // ========== 依赖管理 ==========
        'deps', // 依赖更新
        'upgrade', // 升级依赖
        'downgrade', // 降级依赖

        // ========== 其他 ==========
        'ui', // UI/样式调整
        'i18n', // 国际化
        'typo', // 拼写错误修复
        'clean', // 清理代码/文件
        'remove', // 删除代码/文件
        'move', // 移动/重命名文件
        'security', // 安全相关
        'update', // 更新（通用）
        'add', // 添加（通用）
      ],
    ],
    // 放宽 body 每行长度限制（默认100）
    'body-max-line-length': [1, 'always', 500],
    // 放宽 header 长度限制（默认100）
    'header-max-length': [1, 'always', 200],
    // 放宽 footer 长度限制
    'footer-max-line-length': [1, 'always', 500],
    // subject 不强制以句号结尾
    'subject-full-stop': [0],
    // subject 大小写不限制
    'subject-case': [0],
  },
};
