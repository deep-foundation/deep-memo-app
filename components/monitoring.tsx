import { Box, Button, Card, CardBody, CardHeader, Heading, Link, Stack, Text, VStack, useToast } from "@chakra-ui/react";
import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import { JsonToTable } from "react-json-to-table";
import { JSONToHTMLTable } from '@kevincobain2000/json-to-html-table'
import { ErrorAlert } from "./error-alert";
import { toggleLogger } from "./toggle-logger";
import { makeLoggerToggleHandler } from "../imports/make-logger-toggle-handler";
import { useState } from "react";
import NextLink from "next/link";
import {LinkIcon} from '@chakra-ui/icons'
import debug from "debug";
import { QueryLink } from "@deep-foundation/deeplinks/imports/client_types";
import { JsonView, allExpanded, darkStyles, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import { OptionalPackages } from "../imports/optional-packages";

export function Monitoring(options: MonitoringOptions) {
  const log = debug(`deep-memo-app:${Monitoring.name}`)
  log({options})
  const { deep, isLoggerEnabled,deviceLinkId} = options;
  const useDeepSubscriptionQuery: QueryLink = {
    up: {
      tree_id: deep.idLocal(OptionalPackages.Logger, "LogTree"),
      parent: {
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
              from_id: {
                _in: [deep.linkId, deviceLinkId]
              }
            }
          }
        }
      }
    }
  }
  log({useDeepSubscriptionQuery})
  const { data: linksDownToLogUpdate } = deep.useDeepSubscription(useDeepSubscriptionQuery)
  log({logObjectLinks: linksDownToLogUpdate})


  return (
    <Stack>
      {
        isLoggerEnabled ? (
          linksDownToLogUpdate.length === 0 ? (
            <Text>
              No logs
            </Text>
            ) : (
              linksDownToLogUpdate.filter(link => link.type_id === deep.idLocal(OptionalPackages.Logger, "LogUpdate")).map(logUpdateLink => {
                const logIdLink = linksDownToLogUpdate.find(link => link.type_id === deep.idLocal(OptionalPackages.Logger, "LogId") && link.from_id === logUpdateLink.id)
                const linkBeingLogged = linksDownToLogUpdate.find(link => link.id === logIdLink.to_id)
                const nameOfTypeOfLinkBeingLogged = deep.nameLocal(linkBeingLogged.type_id)
                const logObjectLink = linksDownToLogUpdate.find(link => link.type_id === deep.idLocal(OptionalPackages.Logger, "LogObject") && link.from_id === logUpdateLink.id)
                const logTimestamp = linksDownToLogUpdate.find(link => link.type_id === deep.idLocal(OptionalPackages.Logger, "LogTimestamp") && link.from_id === logUpdateLink.id)
                const humanReadableTimestamp = new Date(logTimestamp.value.value).toLocaleString()
                return (
                  <Card>
                    <CardHeader>
                      <Heading>
                        {nameOfTypeOfLinkBeingLogged}
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <Text>
                        Update time: {humanReadableTimestamp}
                      </Text>
                      <JsonView data={logObjectLink.value.value} shouldInitiallyExpand={allExpanded} style={defaultStyles} />
                    </CardBody>
                  </Card>
                )
              })
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
  deviceLinkId: number;
}