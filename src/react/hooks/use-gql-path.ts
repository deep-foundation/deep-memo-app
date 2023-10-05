import { useCapacitorStore } from "@deep-foundation/store/capacitor";
import { processEnvs } from "../../process-envs";
import { CapacitorStoreKeys } from "../../capacitor-store-keys";

export function useGraphQlUrl(defaultValue: string|undefined = processEnvs.graphQlUrl) {
  return useCapacitorStore(CapacitorStoreKeys[CapacitorStoreKeys.GraphQlUrl], defaultValue)
}