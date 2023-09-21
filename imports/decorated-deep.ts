import { GeolocationDecorator } from "@deep-foundation/capacitor-geolocation";
import { DeviceDecorator } from "@deep-foundation/capacitor-device";
import { DeepClient } from "@deep-foundation/deeplinks/imports/client";

export type DecoratedDeep = GeolocationDecorator<DeepClient> & DeviceDecorator<DeepClient>;