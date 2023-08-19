import {
  DeepClient,
  SerialOperation,
} from '@deep-foundation/deeplinks/imports/client.js';
import { createSerialOperation } from '@deep-foundation/deeplinks/imports/gql/index.js';
import { BoolExpLink } from "@deep-foundation/deeplinks/imports/client_types.js";

/**
 * Makes operations to install packages
 * 
 * @remarks
 * {@link REQUIRED_PACKAGES} must be in minilinks. It is recommended to use {@link applyMinilinks} for this
 * 
 * @example
```ts
await applyMinilinks({deep})
const operations = await makeInstallPackagesOperations({deep, packageNames: ['@deep-foundation/logger']})
await deep.serial({
  operations
})
```
 */
export async function makeInstallPackagesOperations(options: MakeInstallPackageOperationsOptions): Promise<Array<SerialOperation>> {
  const { deep, packageNames } = options;
  ensureRequiredPackagesAreInMinilinks({deep})
  const containTypeLinkId = deep.idLocal(
    REQUIRED_PACKAGES['@deep-foundation/core'],
    'Contain'
  );
  const reservedLinkIds = await deep.reserve(2)
  const packageQueryLinkId = reservedLinkIds.pop()!;
  const installLinkId = reservedLinkIds.pop()!;
  return packageNames.flatMap((packageName) => [
    createSerialOperation({
      type: 'insert',
      table: 'links',
      objects: {
        id: packageQueryLinkId,
        type_id: deep.idLocal(
          REQUIRED_PACKAGES['@deep-foundation/core'],
          'PackageQuery'
        ),
      }
    }),
    createSerialOperation({
      type: 'insert',
      table: 'strings',
      objects: {
        link_id: packageQueryLinkId,
        value: packageName
      }
    }),
    createSerialOperation({
      type: 'insert',
      table: 'links',
      objects: {
        type_id: containTypeLinkId,
        from_id: deep.linkId,
        to_id: packageQueryLinkId
      }
    }),
    createSerialOperation({
      type: 'insert',
      table: 'links',
      objects: {
        id: installLinkId,
        type_id: deep.idLocal(
          REQUIRED_PACKAGES['@deep-foundation/npm-packager'],
          'Install'
        ),
        from_id: deep.linkId,
        to_id: packageQueryLinkId
      }
    }),
    createSerialOperation({
      type: 'insert',
      table: 'links',
      objects: {
        type_id: containTypeLinkId,
        from_id: deep.linkId,
        to_id: installLinkId
      }
    }),
  ])
}

function ensureRequiredPackagesAreInMinilinks(options: EnsureRequiredPackagesAreInMinilinksOptions) {
  const {deep} = options;
  for (const requiredPackageName of Object.values(REQUIRED_PACKAGES)) {
    try {
      deep.idLocal(requiredPackageName);
    } catch (error) {
      throw new Error(`Required package ${requiredPackageName} is not in minilinks`)
    }
  }
}

export interface EnsureRequiredPackagesAreInMinilinksOptions {
  deep: DeepClient;
}

export const REQUIRED_PACKAGES = {
  '@deep-foundation/core': '@deep-foundation/core',
  '@deep-foundation/npm-packager': '@deep-foundation/npm-packager',
} as const

/**
 * Puts {@link REQUIRED_PACKAGES} to minilinks
 */
export async function applyMinilinks(options: ApplyMinilinksOptions) {
  const {deep} = options;
  const requiredPackageLinks = await getRequiredPackagesLinks({deep});
  return deep.minilinks.apply(requiredPackageLinks.data)
}

/**
 * Gets all links down in contain tree to {@link REQUIRED_PACKAGES} 
 */
export async function getRequiredPackagesLinks(options: GetRequiredPackagesLinksOptions) {
  const { deep } = options;
  const packageNamesToApply = Object.values(REQUIRED_PACKAGES);
  const selectData: BoolExpLink = {
    up: {
      tree_id: {
        _id: ["@deep-foundation/core", "containTree"]
      },
      parent: {
        _or: packageNamesToApply.map(packageName => ({
          id: {
            _id: [packageName]
          }
        }))
      }
    }
  }
  return await deep.select(selectData);
}

export interface GetRequiredPackagesLinksOptions {
  deep: DeepClient;
}

export interface ApplyMinilinksOptions {
  deep: DeepClient;
}

export interface MakeInstallPackageOperationsOptions {
  deep: DeepClient;
  packageNames: Array<string>;
}