import React, { useEffect } from "react";
import {
  startRecording,
  stopRecording,
} from "@deep-foundation/capacitor-voice-recorder";

export default function IndexPage() {
  const intervalRef = React.useRef<NodeJS.Timer | undefined>(undefined);

  useEffect(() => {
    new Promise(async () => {
      await startRecording();
      intervalRef.current = setInterval(async () => {
        const recording = await stopRecording();
        console.log({ recording });
        await startRecording();
      }, 1000);
    });

    return () => {
      intervalRef.current && clearInterval(intervalRef.current);
    };
  });

  return null;
}
