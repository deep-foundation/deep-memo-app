import { Button, Link, Stack, Text, VStack, useToast } from "@chakra-ui/react";
import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import { JsonToTable } from "react-json-to-table";
import { JSONToHTMLTable } from '@kevincobain2000/json-to-html-table'
import { ErrorAlert } from "./error-alert";
import { toggleLogger } from "./toggle-logger";
import { makeLoggerToggleHandler } from "../imports/make-logger-toggle-handler";
import { useState } from "react";
import NextLink from "next/link";
import {LinkIcon} from '@chakra-ui/icons'

export function Monitoring(options: MonitoringOptions) {
  const { deep, isLoggerEnabled,setIsLoggerEnabled } = options;
  const { data: logObjectLinks } = deep.useDeepSubscription({
    type_id: {
      _id: ["@deep-foundation/logger", "LogObject"]
    },
    from: {
      type_id: {
        _id: ["@deep-foundation/logger", "LogUpdate"]
      },
      out: {
        type_id: {
          _id: ["@deep-foundation/logger", "LogId"]
        },
        to: {
          _or: [
            {
              type_id: {
                _id: ["@deep-foundation/capacitor-motion", "Motion"]
              },
            },
            {
              type_id: {
                _id: ["@deep-foundation/capacitor-device", "Device"]
              },
            },
            {
              type_id: {
                _id: ["@deep-foundation/capacitor-geolocation", "Position"]
              },
            }
          ],
          in: {
            type_id: {
              _id: ["@deep-foundation/core", "Contain"]
            },
            from_id: deep.linkId
          }
        }
      }
    }
  })

  return (
    <Stack>
      {
        isLoggerEnabled ? (
          logObjectLinks.length === 0 ? (
            <Text>
              No logs
            </Text>
            ) : (
              logObjectLinks.map(logObjectLink => <JSONToHTMLTable data={JSON.parse(logObjectLink.value.value)} />)
            ) 
        ): (
          <VStack>
            <ErrorAlert title="Logger is disabled" description={
              <VStack>
                <Text>Enable the logger to see logs</Text>
                <Link as={NextLink} href="/settings/logger">
                  Logger Settings <LinkIcon mx='2px' />
                  </Link>
                </VStack>
            } />
          </VStack>
        )
      }
    </Stack>
  )
}

export interface MonitoringOptions {
  deep: DeepClient,
  isLoggerEnabled: boolean;
  setIsLoggerEnabled: (isLoggerEnabled: boolean) => void;
}