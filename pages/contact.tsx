import React from 'react';
import {
  DeepClient,
} from '@deep-foundation/deeplinks/imports/client';
import { Button, Stack } from '@chakra-ui/react';
import { saveAllContacts } from '../src/contact/contact';
import { Page } from '../src/react/components/page';
import { NavBar } from '../src/react/components/navbar';

function Content({deep, deviceLinkId}: {deep :DeepClient, deviceLinkId: number}) {
  return (
    <Stack>
      <NavBar/>
      <Button onClick={() => saveAllContacts({ deep, deviceLinkId })}>Save All Contacts</Button>
    </Stack>
  );
}

export default function ContactsPage() {
  return (
    <Page renderChildren={({deep,deviceLinkId}) => <Content deep={deep} deviceLinkId={deviceLinkId} />} />
  );
}
