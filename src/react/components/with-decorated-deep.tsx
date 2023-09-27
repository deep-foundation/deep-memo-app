import { DeviceDecorator, createDeviceDecorator } from "@deep-foundation/capacitor-device";
import { GeolocationDecorator, createGeolocationDecorator } from "@deep-foundation/capacitor-geolocation";
import { MotionDecorator, createMotionDecorator } from "@deep-foundation/capacitor-motion";
import { DeepClient } from "@deep-foundation/deeplinks/imports/client.js";
import { compose } from 'lodash/fp';
import { useEffect } from "react";

export function WithDecoratedDeep(options: WithDecoratedDeepOptions) {
  const { deep, renderChildren } = options;
  const deviceDecoratedDeep = createDeviceDecorator(deep);
  const motionDecoratedDeep = createMotionDecorator(deviceDecoratedDeep);
  const geolocationDecoratedDeep = createGeolocationDecorator(motionDecoratedDeep);
  const decoratedDeep = geolocationDecoratedDeep;
  useEffect(() => {
    self['decoratedDeep'] = decoratedDeep;
  })
  return renderChildren({deep: decoratedDeep  })
}

export interface WithDecoratedDeepOptions {
  deep: DeepClient;
  renderChildren: (options: RenderChildrenOptions) => JSX.Element;
}

export interface RenderChildrenOptions {deep: DecoratedDeep}

export type DecoratedDeep = GeolocationDecorator<DeepClient> & DeviceDecorator<DeepClient> & MotionDecorator<DeepClient>;