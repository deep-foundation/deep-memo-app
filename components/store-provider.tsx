import { LocalStoreProvider } from "@deep-foundation/store/local";
import { CapacitorStoreProvider } from "@deep-foundation/store/capacitor";
import { QueryStoreProvider } from "@deep-foundation/store/query";

export function StoreProvider({ children }: { children: JSX.Element | JSX.Element[] }) {
  return <QueryStoreProvider>
    <LocalStoreProvider>
    <CapacitorStoreProvider>
      {children}
    </CapacitorStoreProvider>
    </LocalStoreProvider>
  </QueryStoreProvider>
}