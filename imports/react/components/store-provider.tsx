import { LocalStoreProvider } from "@deep-foundation/store/local";
import { QueryStoreProvider } from "@deep-foundation/store/query";
import { CookiesStoreProvider } from "@deep-foundation/store/cookies";
import { CapacitorStoreProvider } from "@deep-foundation/store/capacitor";

export function StoreProvider({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) {
  return (
    <QueryStoreProvider>
      <CookiesStoreProvider>
        <LocalStoreProvider>
          <CapacitorStoreProvider fetchInterval={5000}>
            {children}
          </CapacitorStoreProvider>
        </LocalStoreProvider>
      </CookiesStoreProvider>
    </QueryStoreProvider>
  );
}
