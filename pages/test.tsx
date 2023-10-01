import React, { useEffect } from "react";
import {
  Text,
  Link,
  Stack,
  Card,
  CardBody,
  Heading,
  CardHeader,
  VStack,
  Button,
  FormControl,
  FormLabel,
  Switch,
} from "@chakra-ui/react";
import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import NextLink from "next/link";
import { LinkIcon } from "@chakra-ui/icons";
import { Page } from "../src/react/components/page";
import { CapacitorStoreKeys } from "../src/capacitor-store-keys";
import { useCapacitorStore } from "@deep-foundation/store/capacitor";
import { SETTINGS_ROUTES } from "../src/settings-routes";
import { capitalCase } from "case-anything";
import debug from "debug";
import { ErrorAlert } from "../src/react/components/error-alert";
import { WithPackagesInstalled } from "@deep-foundation/react-with-packages-installed";
import { OptionalPackages } from "../src/optional-packages";
import { DecoratedDeep } from "../src/react/components/with-decorated-deep";
import { WithSubscriptions } from "../src/react/components/with-subscriptions";
import { NavBar } from "../src/react/components/navbar";
import { Monitoring } from "../src/react/components/monitoring";
import { setAllDataSync } from "../src/set-all-data-sync";
import { useIsAllDataSyncEnabled } from "../src/react/hooks/use-is-all-data-sync-enabled";

interface ContentParam {
  deep: DecoratedDeep;
  deviceLinkId: number;
}

function Content({ deep, deviceLinkId }: ContentParam) {
  const {value: value, setValue: setValue} = useCapacitorStore("myValue", undefined)
  console.log({ value, setValue })
  useEffect(() => {
    self['value'] = value;
    self['setValue'] = setValue;
  }, []);
  return null;
}

export default function IndexPage() {
  return (
    <Page
      renderChildren={({ deep, deviceLinkId }) => (
        <Content deep={deep} deviceLinkId={deviceLinkId} />
      )}
    />
  );
}

function Pages() {
  return (
    <Stack>
      {Object.entries(SETTINGS_ROUTES).map(([name, route]) => (
        <Link as={NextLink} href={route}>
          {capitalCase(name)} <LinkIcon mx="2px" />
        </Link>
      ))}
    </Stack>
  );
}
