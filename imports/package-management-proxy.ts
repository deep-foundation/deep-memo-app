import {
  DeepClient,
  SerialOperation,
} from '@deep-foundation/deeplinks/imports/client.js';
import { BoolExpLink } from '@deep-foundation/deeplinks/imports/client_types';
import { createSerialOperation } from '@deep-foundation/deeplinks/imports/gql';

/**
 * Proxy for package management
 * 
 * @example
```ts
const packageManagementProxy = new PackageManagementProxy(deep);
await packageManagementProxy.applyMinilinks();
await packageManagementProxy.install('@deep-foundation/logger');
```
 */
export class PackageManagementProxy {
  private deep: DeepClient;

  constructor(deep: DeepClient) {
    this.deep = deep;
  }

  /**
   * Installs packages
   * 
   * @remarks
   * {@link REQUIRED_PACKAGES} must be in minilinks. It is recommended to use {@link applyMinilinks} for this
   */
  public async install(...packageNames: Array<string>): Promise<any> {
    const operations = await this.makeInstallPackagesOperations(...packageNames);
    return await this.deep.serial({
      operations,
    });
  }

  /**
 * Makes operations to install packages
 * 
 * @remarks
 * {@link REQUIRED_PACKAGES} must be in minilinks. It is recommended to use {@link applyMinilinks} for this
*/
  public async makeInstallPackagesOperations(...packageNames: Array<string>): Promise<Array<SerialOperation>> {
    this.ensureRequiredPackagesAreInMinilinks()
    const containTypeLinkId = this.deep.idLocal(
      this.REQUIRED_PACKAGES['@deep-foundation/core'],
      'Contain'
    );
    const reservedLinkIds = await this.deep.reserve(2)
    const packageQueryLinkId = reservedLinkIds.pop()!;
    const installLinkId = reservedLinkIds.pop()!;
    return packageNames.flatMap((packageName) => [
      createSerialOperation({
        type: 'insert',
        table: 'links',
        objects: {
          id: packageQueryLinkId,
          type_id: this.deep.idLocal(
            this.REQUIRED_PACKAGES['@deep-foundation/core'],
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
          from_id: this.deep.linkId,
          to_id: packageQueryLinkId
        }
      }),
      createSerialOperation({
        type: 'insert',
        table: 'links',
        objects: {
          id: installLinkId,
          type_id: this.deep.idLocal(
            this.REQUIRED_PACKAGES['@deep-foundation/npm-packager'],
            'Install'
          ),
          from_id: this.deep.linkId,
          to_id: packageQueryLinkId
        }
      }),
      createSerialOperation({
        type: 'insert',
        table: 'links',
        objects: {
          type_id: containTypeLinkId,
          from_id: this.deep.linkId,
          to_id: installLinkId
        }
      }),
    ])
  }

  public ensureRequiredPackagesAreInMinilinks() {
    for (const requiredPackageName of Object.values(this.REQUIRED_PACKAGES)) {
      try {
        this.deep.idLocal(requiredPackageName);
      } catch (error) {
        throw new Error(`Required package ${requiredPackageName} is not in minilinks`)
      }
    }
  }

  public REQUIRED_PACKAGES = {
    '@deep-foundation/core': '@deep-foundation/core',
    '@deep-foundation/npm-packager': '@deep-foundation/npm-packager',
  } as const

  /**
   * Puts {@link REQUIRED_PACKAGES} to minilinks
   */
  public async applyMinilinks() {
    const requiredPackageLinks = await this.getRequiredPackagesLinks();
    return this.deep.minilinks.apply(requiredPackageLinks.data)
  }

  /**
   * Gets all links down in contain tree to {@link REQUIRED_PACKAGES} 
   */
  public async getRequiredPackagesLinks() {
    const packageNamesToApply = Object.values(this.REQUIRED_PACKAGES);
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
    return await this.deep.select(selectData);
  }

}


