import {
  DeepClient,
  SerialOperation,
} from '@deep-foundation/deeplinks/imports/client.js';
import { BoolExpLink } from '@deep-foundation/deeplinks/imports/client_types.js';
import { createSerialOperation } from '@deep-foundation/deeplinks/imports/gql/index.js';
import { MinilinkCollection, Minilinks } from '@deep-foundation/deeplinks/imports/minilinks';
import debug from 'debug';

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
   * {@link REQUIRED_PACKAGES} must be in minilinks. It is recommended to use {@link applyMinilinks} for this
   * 
   * @throws
   * If {@link REQUIRED_PACKAGES} is not in minilinks
   * If installation failed
   */
  public async install(...packageNames: Array<string>): Promise<any> {
    const log = debug(`@deep-foundation/npm-packager:${NpmPackagerProxy.name}:${this.install.name}`)
    const operations = await this.makeInstallPackagesOperations(...packageNames);
    log({operations})
    const promisesToAwaitInstallation = operations.map(async (operation) => await this.deep.await(operation.installLinkId));
    log({promisesToAwaitInstallation})
    await Promise.all(promisesToAwaitInstallation);
    const intalledTypeLinkId = this.deep.idLocal(RequiredPackages.NpmPackager, "Installed");
    log({intalledTypeLinkId})
   
    const {data: failedInstallLinkIds} = await this.deep.select({
      _or: operations.map(operation => (
        {
          id: operation.installLinkId,
          out: {
            _not: {
              type_id: intalledTypeLinkId,
              to: {
                id: {
                  _id: [operation.packageName]
                }
              }
            }
          }
        }
      ))
    })
    log({failedInstallLinkIds})

    if(failedInstallLinkIds.length > 0) {
      throw new Error(`Failed to install ${failedInstallLinkIds.join(', ')}`)
    }
  }

  /**
 * Makes operations to install packages
 * 
 * @remarks
 * {@link REQUIRED_PACKAGES} must be in minilinks. It is recommended to use {@link applyMinilinks} for this
 * 
 * @throws
 * If {@link REQUIRED_PACKAGES} is not in minilinks
*/
  public async makeInstallPackagesOperations(...packageNames: Array<string>): Promise<MakeInstallPackagesOperationsReturnType> {
    const log = debug(`@deep-foundation/npm-packager:${NpmPackagerProxy.name}:${this.makeInstallPackagesOperations.name}`)
    this.ensureRequiredPackagesAreInMinilinks()
    const containTypeLinkId = this.deep.idLocal(
      RequiredPackages.Core,
      'Contain'
    );
    log({containTypeLinkId})
    const reservedLinkIds = await this.deep.reserve(packageNames.length * 2)
    log({reservedLinkIds})
    
    const result = packageNames.map((packageName) => {
      const packageQueryLinkId = reservedLinkIds.pop()!;
      const installLinkId = reservedLinkIds.pop()!;
      return {
        packageName,
        packageQueryLinkId,
        installLinkId,
        operations: [
          createSerialOperation({
            type: 'insert',
            table: 'links',
            objects: {
              id: packageQueryLinkId,
              type_id: this.deep.idLocal(
                RequiredPackages.Core,
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
                RequiredPackages.NpmPackager,
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
    log({result})

    return result
  }

  public ensureRequiredPackagesAreInMinilinks() {
    for (const requiredPackageName of Object.values(RequiredPackages)) {
      try {
        this.deep.idLocal(requiredPackageName);
      } catch (error) {
        throw new Error(`Required package ${requiredPackageName} is not in minilinks`)
      }
    }
  }

  /**
   * Puts {@link REQUIRED_PACKAGES} to minilinks
   */
  public async applyMinilinks() {
    const log = debug(`@deep-foundation/npm-packager:${NpmPackagerProxy.name}:${this.applyMinilinks.name}`)
    const requiredPackageLinks = await this.getRequiredPackagesLinks();
    log({requiredPackageLinks})
    const applyMinilinksResult = this.deep.minilinks.apply(requiredPackageLinks.data);
    log({applyMinilinksResult})
    return applyMinilinksResult
  }

  /**
   * Gets all links down in contain tree to {@link REQUIRED_PACKAGES} 
   */
  public async getRequiredPackagesLinks() {
    const log = debug(`@deep-foundation/npm-packager:${NpmPackagerProxy.name}:${this.getRequiredPackagesLinks.name}`)
    const packageNamesToApply = Object.values(RequiredPackages);
    log({packageNamesToApply})
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
    log({selectData})
    const result = await this.deep.select(selectData);
    log({result})
    return result;
  }

}

export enum RequiredPackages {
  Core = '@deep-foundation/core',
  NpmPackager = '@deep-foundation/npm-packager',
} 

export type MakeInstallPackagesOperationsReturnType = Array<{packageName: string; packageQueryLinkId: number; installLinkId: number; operations: Array<SerialOperation>}>