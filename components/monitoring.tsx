import { Stack, Text } from "@chakra-ui/react";
import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import { JsonToTable } from "react-json-to-table";
import { JSONToHTMLTable } from '@kevincobain2000/json-to-html-table'

export function Monitoring(options: MonitoringOptions) {
  const { deep } = options;
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
        logObjectLinks.length === 0 ? (
        <Text>
          No logs
        </Text>
        ) : (
          logObjectLinks.map(logObjectLink => <JSONToHTMLTable data={JSON.parse(logObjectLink.value.value)} />)
        ) 
      }
    </Stack>
  )
}

export interface MonitoringOptions {
  deep: DeepClient
}