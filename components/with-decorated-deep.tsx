import { DeviceDecorator, createDeviceDecorator } from "@deep-foundation/capacitor-device";
import { GeolocationDecorator, createGeolocationDecorator } from "@deep-foundation/capacitor-geolocation";
import { DeepClient } from "@deep-foundation/deeplinks/imports/client.js";
import { compose } from 'lodash/fp';

export function WithDecoratedDeep(options: WithDecoratedDeepOptions) {
  const { deep, renderChildren } = options;
  const deviceDecoratedDeep = createDeviceDecorator(deep);
  const geolocationDecoratedDeep = createGeolocationDecorator(deviceDecoratedDeep);
  const decoratedDeep = geolocationDecoratedDeep;
  return renderChildren({deep: decoratedDeep  })
}

export interface WithDecoratedDeepOptions {
  deep: DeepClient;
  renderChildren: (options: RenderChildrenOptions) => JSX.Element;
}

export interface RenderChildrenOptions {deep: DecoratedDeep}

export type DecoratedDeep = GeolocationDecorator<DeepClient> & DeviceDecorator<DeepClient>;