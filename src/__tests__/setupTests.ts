/**
 * Setup para tests de Vitest
 */

import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup después de cada test
afterEach(() => {
  cleanup();
});

