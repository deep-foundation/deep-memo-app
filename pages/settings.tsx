import { ChakraProvider, Link, Stack } from "@chakra-ui/react";
import { DeepClient, DeepProvider } from "@deep-foundation/deeplinks/imports/client";
import { Provider } from "../imports/provider";
import NextLink from 'next/link';
import { Page } from "../imports/react/components/page";
import { capitalCase } from "case-anything";
import { SETTINGS_ROUTES } from "../imports/settings-routes";
import { LinkIcon } from "@chakra-ui/icons";
import { SettingContent } from "../imports/react/components/setting-page";

function Content() {
  return (
    <Stack>
      {
          Object.entries(SETTINGS_ROUTES).map(([name, route]) => (
            <Link as={NextLink} href={route}>
              {capitalCase(name)} <LinkIcon mx='2px' />
            </Link>
          ))
      }
    </Stack>
  )
}

export default function SettingsPage() {
  return (
    <Page renderChildren={({ deep, deviceLinkId }) => <SettingContent>
    <Content/>
  </SettingContent>} />
  );
}