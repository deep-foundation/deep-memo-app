import {
  DeepClient,
  SerialOperation,
} from '@deep-foundation/deeplinks/imports/client.js';
import { BoolExpLink } from '@deep-foundation/deeplinks/imports/client_types.js';
import { createSerialOperation } from '@deep-foundation/deeplinks/imports/gql/index.js';

/**
 * Proxy for package management
 * 
 * @example
```ts
const npmPackagerProxy = new NpmPackagerProxy(deep);
await npmPackagerProxy.applyMinilinks();
await npmPackagerProxy.install('@deep-foundation/logger');
```
 */
export class NpmPackagerProxy {
  private deep: DeepClient;

  constructor(deep: DeepClient) {
    this.deep = deep;
  }

  /**
   * Installs packages
   * 
   * @remarks
   * {@link RequiredPackages} must be in minilinks. It is recommended to use {@link applyMinilinks} for this
   * 
   * @throws
   * If {@link RequiredPackages} is not in minilinks
   * If installation failed
   */
  public async install(...packageNames: Array<string>): Promise<any> {
    const operations = await this.makeInstallPackagesOperations(...packageNames);
    await this.deep.serial({
      operations: operations.flatMap(operation => operation.operations),
    });
    const promisesToAwaitInstallation = operations.map(async (operation) => await this.deep.await(operation.installLinkId));
    await Promise.all(promisesToAwaitInstallation);
  }

  /**
 * Makes operations to install packages
 * 
 * @remarks
 * {@link RequiredPackages} must be in minilinks. It is recommended to use {@link applyMinilinks} for this
 * 
 * @throws
 * If {@link RequiredPackages} is not in minilinks
*/
  public async makeInstallPackagesOperations(...packageNames: Array<string>): Promise<MakeInstallPackagesOperationsReturnType> {
    this.ensureRequiredPackagesAreInMinilinks()
    const containTypeLinkId = this.deep.idLocal(
      this.RequiredPackages.Core,
      'Contain'
    );
    const reservedLinkIds = await this.deep.reserve(packageNames.length * 2)
    
    const serialOperations = packageNames.map((packageName) => {
      const packageQueryLinkId = reservedLinkIds.pop()!;
      const installLinkId = reservedLinkIds.pop()!;
      return {
        packageQueryLinkId,
        installLinkId,
        operations: [
          createSerialOperation({
            type: 'insert',
            table: 'links',
            objects: {
              id: packageQueryLinkId,
              type_id: this.deep.idLocal(
                this.RequiredPackages.Core,
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
                this.RequiredPackages.NpmPackager,
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
        ]
      }
    })

    return serialOperations
  }

  public ensureRequiredPackagesAreInMinilinks() {
    for (const requiredPackageName of Object.values(this.RequiredPackages)) {
      try {
        this.deep.idLocal(requiredPackageName);
      } catch (error) {
        throw new Error(`Required package ${requiredPackageName} is not in minilinks`)
      }
    }
  }

  public RequiredPackages = {
    '@deep-foundation/core': '@deep-foundation/core',
    '@deep-foundation/npm-packager': '@deep-foundation/npm-packager',
  } as const

  /**
   * Puts {@link RequiredPackages} to minilinks
   */
  public async applyMinilinks() {
    const requiredPackageLinks = await this.getRequiredPackagesLinks();
    return this.deep.minilinks.apply(requiredPackageLinks.data)
  }

  /**
   * Gets all links down in contain tree to {@link RequiredPackages} 
   */
  public async getRequiredPackagesLinks() {
    const packageNamesToApply = Object.values(this.RequiredPackages);
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

export type MakeInstallPackagesOperationsReturnType = Array<{packageQueryLinkId: number; installLinkId: number; operations: Array<SerialOperation>}>