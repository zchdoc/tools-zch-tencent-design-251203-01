// commit-lint config
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test', 'types'],
    ],
    // 放宽 body 每行长度限制（默认100，设为200或0禁用）
    'body-max-line-length': [1, 'always', 500],
    // 放宽 header 长度限制（默认100）
    'header-max-length': [1, 'always', 200],
  },
};
