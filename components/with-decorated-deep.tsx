import { GeolocationDecorator, createGeolocationDecorator } from "@deep-foundation/capacitor-geolocation";
import { DeepClient } from "@deep-foundation/deeplinks/imports/client";

export function WithDecoratedDeep(options: WithDecoratedDeepOptions) {
  const { deep, renderChildren } = options;
  const decoratedDeep = createGeolocationDecorator(deep);
  return renderChildren({deep: decoratedDeep})
}

export interface WithDecoratedDeepOptions {
  deep: DeepClient;
  renderChildren: (options: RenderChildrenOptions) => JSX.Element;
}

export interface RenderChildrenOptions {deep: DecoratedDeep}

export type DecoratedDeep = GeolocationDecorator<DeepClient>;