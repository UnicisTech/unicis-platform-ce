import {
  getTaskModuleKeys,
  getVisibleSearchModules,
} from '@/components/shared/shell/GlobalSearch';
import type { Action, Resource } from '@/lib/permissions';

const denyAccess = (_resource: Resource, _actions: Action[]) => false;

describe('getVisibleSearchModules', () => {
  it('includes Asset Management when the module is ready', () => {
    const modules = getVisibleSearchModules({
      slug: 'acme',
      canAccess: denyAccess,
      hasAssetModuleAccess: true,
    });

    expect(modules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          labelKey: 'fleet:asset-management',
          path: '/asset',
        }),
      ])
    );
  });

  it('hides Asset Management when the module is unavailable', () => {
    const modules = getVisibleSearchModules({
      slug: 'acme',
      canAccess: denyAccess,
      hasAssetModuleAccess: false,
    });

    expect(modules.some((module) => module.path === '/asset')).toBe(false);
  });
});

describe('getTaskModuleKeys', () => {
  it('recognizes dynamic and legacy CSC controls', () => {
    expect(getTaskModuleKeys({ csc_controls_mvsp: ['mvsp-1'] })).toEqual([
      'csc',
    ]);
    expect(getTaskModuleKeys({ csc_controls: ['legacy-1'] })).toEqual(['csc']);
  });

  it('ignores malformed module payloads', () => {
    expect(
      getTaskModuleKeys({
        rpa_procedure: [],
        csc_controls_mvsp: 'mvsp-1',
      })
    ).toEqual([]);
  });
});
