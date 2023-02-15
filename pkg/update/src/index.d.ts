export interface SetupOptions {
  config?: string | boolean
  cwd?: string
  lineBreak?: boolean
  progress?: boolean
  list?: boolean
  verbose?: boolean
  dryRun?: boolean
}

export interface DowngradeOptions extends SetupOptions {
  save?: boolean
}

export interface UpgradeOptions extends DowngradeOptions {
  deep?: boolean
}

export declare type Dependencies = string[] | null | undefined

export function upgradeDependencies(deps?: Dependencies, options?: UpgradeOptions): Promise<void>

export function downgradeDependencies(deps?: Dependencies, options?: DowngradeOptions): Promise<void>

export function setupUpdateDependencies(options?: SetupOptions): Promise<void>
