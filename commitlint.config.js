export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nueva funcionalidad
        'fix',      // Corrección de bugs
        'docs',     // Cambios en documentación
        'style',    // Cambios de formato
        'refactor', // Refactorización
        'perf',     // Mejoras de performance
        'test',     // Añadir o actualizar tests
        'chore',    // Tareas de mantenimiento
        'ci',       // Cambios en CI
        'build',    // Cambios en build
        'revert',   // Revertir commits
      ],
    ],
  },
};

