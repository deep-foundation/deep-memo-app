import { ChakraProvider, Link, Stack } from "@chakra-ui/react";
import { DeepClient, DeepProvider } from "@deep-foundation/deeplinks/imports/client";
import { Provider } from "../imports/provider";
import NextLink from 'next/link';
import { Page } from "../components/page";


function Content() {
  return (
    <Stack>
      <Link as={NextLink} href="/settings/device">
        Device
      </Link>
      <Link as={NextLink} href="/settings/motion">
        Motion
      </Link>
      <Link as={NextLink} href="/settings/contact">
        Contact
      </Link>
      <Link as={NextLink} href="/settings/network">
        Network
      </Link>
      <Link as={NextLink} href="/settings/camera">
        Voice Recorder
      </Link>
      <Link as={NextLink} href="/settings/camera">
        Voice Recorder
      </Link>
    </Stack>
  )
}

export default function SettingsPage() {
  return (
    <Page renderChildren={({ deep, deviceLinkId }) => <Content />} />
  );
}