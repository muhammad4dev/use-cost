import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isLocalPackage, extractPackageName } from './package-resolver.js';

vi.mock('fs');

describe('Package Resolver', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('isLocalPackage', () => {
    it('should identify local packages', () => {
      expect(isLocalPackage('./local')).toBe(true);
      expect(isLocalPackage('../parent')).toBe(true);
      expect(isLocalPackage('/absolute')).toBe(true);
      expect(isLocalPackage('react')).toBe(false);
      expect(isLocalPackage('@scope/pkg')).toBe(false);
    });
  });

  describe('extractPackageName', () => {
    it('should extract regular package names', () => {
      expect(extractPackageName('react')).toBe('react');
      expect(extractPackageName('react/client')).toBe('react');
    });

    it('should extract scoped package names', () => {
      expect(extractPackageName('@scope/pkg')).toBe('@scope/pkg');
      expect(extractPackageName('@scope/pkg/subpath')).toBe('@scope/pkg');
    });
  });
});
