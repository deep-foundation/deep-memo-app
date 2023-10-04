import React from 'react';
import { DeepClient } from '@deep-foundation/deeplinks/imports/client';
import { Page } from '../src/react/components/page';
import { WithRecording } from '@deep-foundation/capacitor-voice-recorder';

function Content({
  deep,
  deviceLinkId,
  containerLinkId
}: {
  deep: DeepClient;
  deviceLinkId: number
  containerLinkId: number;
}) {

  return <WithRecording deep={deep} containerLinkId={containerLinkId}/>; 
}

export default function VoiceRecorderPage() {
  return (
    <Page
      renderChildren={({ deep, deviceLinkId, containerLinkId }) => { 
        return <Content deep={deep} deviceLinkId={deviceLinkId} containerLinkId={containerLinkId} />; 
      }}
    />
  );
}
