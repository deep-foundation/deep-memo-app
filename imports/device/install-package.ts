import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import { PACKAGE_NAME } from "./package-name";
import { generateApolloClient } from '@deep-foundation/hasura/client';
import * as dotenv from 'dotenv';
import { MutationInputLink } from "@deep-foundation/deeplinks/imports/client_types";
dotenv.config();

async function installPackage() {

  const apolloClient = generateApolloClient({
    path: process.env.NEXT_PUBLIC_GQL_PATH || '', // <<= HERE PATH TO UPDATE
    ssl: !!~process.env.NEXT_PUBLIC_GQL_PATH.indexOf('localhost')
      ? false
      : true,
    // admin token in prealpha deep secret key
    // token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsibGluayJdLCJ4LWhhc3VyYS1kZWZhdWx0LXJvbGUiOiJsaW5rIiwieC1oYXN1cmEtdXNlci1pZCI6IjI2MiJ9LCJpYXQiOjE2NTYxMzYyMTl9.dmyWwtQu9GLdS7ClSLxcXgQiKxmaG-JPDjQVxRXOpxs',
  });

  const unloginedDeep = new DeepClient({ apolloClient });
  const guest = await unloginedDeep.guest();
  const guestDeep = new DeepClient({ deep: unloginedDeep, ...guest });
  const admin = await guestDeep.login({
    linkId: await guestDeep.id('deep', 'admin'),
  });
  const deep = new DeepClient({ deep: guestDeep, ...admin });

  const typeTypeLinkId = await deep.id("@deep-foundation/core", "Type");
  const anyTypeLinkId = await deep.id("@deep-foundation/core", "Any");
  const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
  const packageTypeLinkId = await deep.id("@deep-foundation/core", "Package");
  const joinTypeLinkId = await deep.id("@deep-foundation/core", "Join");
  const valueTypeLinkId = await deep.id("@deep-foundation/core", "Value");
  const stringTypeLinkId = await deep.id("@deep-foundation/core", "String");
  const numberTypeLinkId = await deep.id("@deep-foundation/core", "Number");

await deep.select({
  _by_item: {
    
  }
})
  const { data: [{ id: packageLinkId }] } = await deep.insert({
    type_id: packageTypeLinkId,
    string: { data: { value: PACKAGE_NAME } },
    in: {
      data: [
        {
          type_id: containTypeLinkId,
          from_id: deep.linkId
        },
      ]
    },
    out: {
      data: [
        {
          type_id: joinTypeLinkId,
          to_id: await deep.id('deep', 'users', 'packages'),
        },
        {
          type_id: joinTypeLinkId,
          to_id: await deep.id('deep', 'admin'),
        },
      ]
    },
  });

  const reservedIds = await deep.reserve(1);

  const deviceInsertData: MutationInputLink = {
    id: reservedIds.pop(),
    type_id: typeTypeLinkId,
    in: {
      data: {
        type_id: containTypeLinkId,
        from_id: packageLinkId,
        string: { data: { value: 'Device' } },
      }
    },
  }

  await deep.insert([
    deviceInsertData,
    {
      type_id: typeTypeLinkId,
      in: {
        data: {
          type_id: containTypeLinkId,
          from_id: packageLinkId,
          string: { data: { value: 'Uuid' } },
        }
      },
      out: {
        data: {
          type_id: valueTypeLinkId,
          to_id: stringTypeLinkId,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: 'UuidValue' } },
            }
          },
        }
      }
    },
    {
      type_id: typeTypeLinkId,
      in: {
        data: {
          type_id: containTypeLinkId,
          from_id: packageLinkId,
          string: { data: { value: 'Name' } },
        }
      },
      out: {
        data: {
          type_id: valueTypeLinkId,
          to_id: stringTypeLinkId,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: 'NameValue' } },
            }
          },
        }
      }
    },
    {
      type_id: typeTypeLinkId,
      in: {
        data: {
          type_id: containTypeLinkId,
          from_id: packageLinkId,
          string: { data: { value: 'Model' } },
        }
      },
      out: {
        data: {
          type_id: valueTypeLinkId,
          to_id: stringTypeLinkId,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: 'ModelValue' } },
            }
          },
        }
      }
    },
    {
      type_id: typeTypeLinkId,
      in: {
        data: {
          type_id: containTypeLinkId,
          from_id: packageLinkId,
          string: { data: { value: 'Platform' } },
        }
      },
      out: {
        data: {
          type_id: valueTypeLinkId,
          to_id: stringTypeLinkId,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: 'PlatformValue' } },
            }
          },
        }
      }
    },
    {
      type_id: typeTypeLinkId,
      in: {
        data: {
          type_id: containTypeLinkId,
          from_id: packageLinkId,
          string: { data: { value: 'OperatingSystem' } },
        }
      },
      out: {
        data: {
          type_id: valueTypeLinkId,
          to_id: stringTypeLinkId,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: 'OperatingSystemValue' } },
            }
          },
        }
      }
    },
    {
      type_id: typeTypeLinkId,
      in: {
        data: {
          type_id: containTypeLinkId,
          from_id: packageLinkId,
          string: { data: { value: 'OsVersion' } },
        }
      },
      out: {
        data: {
          type_id: valueTypeLinkId,
          to_id: stringTypeLinkId,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: 'OsVersionValue' } },
            }
          },
        }
      }
    },
    {
      type_id: typeTypeLinkId,
      in: {
        data: {
          type_id: containTypeLinkId,
          from_id: packageLinkId,
          string: { data: { value: 'Manufacturer' } },
        }
      },
      out: {
        data: {
          type_id: valueTypeLinkId,
          to_id: stringTypeLinkId,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: 'ManufacturerValue' } },
            }
          },
        }
      }
    },
    {
      type_id: typeTypeLinkId,
      in: {
        data: {
          type_id: containTypeLinkId,
          from_id: packageLinkId,
          string: { data: { value: 'IsVirtual' } },
        }
      },
    },
    {
      type_id: typeTypeLinkId,
      in: {
        data: {
          type_id: containTypeLinkId,
          from_id: packageLinkId,
          string: { data: { value: 'MemUsed' } },
        }
      },
      out: {
        data: {
          type_id: valueTypeLinkId,
          to_id: numberTypeLinkId
          ,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: 'MemUsedValue' } },
            }
          },
        }
      }
    },
    {
      type_id: typeTypeLinkId,
      in: {
        data: {
          type_id: containTypeLinkId,
          from_id: packageLinkId,
          string: { data: { value: 'RealDiskFree' } },
        }
      },
      out: {
        data: {
          type_id: valueTypeLinkId,
          to_id: numberTypeLinkId,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: 'RealDiskFreeValue' } },
            }
          },
        }
      }
    },
    {
      type_id: typeTypeLinkId,
      in: {
        data: {
          type_id: containTypeLinkId,
          from_id: packageLinkId,
          string: { data: { value: 'WebViewVersion' } },
        }
      },
      out: {
        data: {
          type_id: valueTypeLinkId,
          to_id: stringTypeLinkId,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: 'WebViewVersionValue' } },
            }
          },
        }
      }
    },
    {
      type_id: typeTypeLinkId,
      in: {
        data: {
          type_id: containTypeLinkId,
          from_id: packageLinkId,
          string: { data: { value: 'BatteryLevel' } },
        }
      },
      out: {
        data: {
          type_id: valueTypeLinkId,
          to_id: numberTypeLinkId
          ,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: 'BatteryLevelValue' } },
            }
          },
        }
      }
    },

    {
      type_id: typeTypeLinkId,
      in: {
        data: {
          type_id: containTypeLinkId,
          from_id: packageLinkId,
          string: { data: { value: 'IsCharging' } },
        }
      },
    },

    {
      type_id: typeTypeLinkId,
      in: {
        data: {
          type_id: containTypeLinkId,
          from_id: packageLinkId,
          string: { data: { value: 'LanguageCode' } },
        }
      },
      out: {
        data: {
          type_id: valueTypeLinkId,
          to_id: stringTypeLinkId,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: 'LanguageCodeValue' } },
            }
          },
        }
      }
    },

    {
      type_id: typeTypeLinkId,
      in: {
        data: {
          type_id: containTypeLinkId,
          from_id: packageLinkId,
          string: { data: { value: 'LanguageTag' } },
        }
      },
      out: {
        data: {
          type_id: valueTypeLinkId,
          to_id: stringTypeLinkId,
          in: {
            data: {
              type_id: containTypeLinkId,
              from_id: packageLinkId,
              string: { data: { value: 'LanguageTagValue' } },
            }
          },
        }
      }
    },
  ]);



}

installPackage();