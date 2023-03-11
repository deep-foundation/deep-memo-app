import { AccelListenerEvent } from '@capacitor/motion';
import { DeepClient } from '@deep-foundation/deeplinks/imports/client';
import { BoolExpLink } from '@deep-foundation/deeplinks/imports/client_types';
import { PACKAGE_NAME } from './package-name';

export async function updateOrInsertAccelerationDataToDeep({
  deep,
  data,
  deviceLinkId,
}: {
  deep: DeepClient;
  data: AccelListenerEvent;
  deviceLinkId: number;
}) {
  const accelerationXTypeLinkId = await deep.id(PACKAGE_NAME, 'AccelerationX');
  const accelerationYTypeLinkId = await deep.id(PACKAGE_NAME, 'AccelerationY');
  const accelerationZTypeLinkId = await deep.id(PACKAGE_NAME, 'AccelerationZ');
  const accelerationXIncludingGravityTypeLinkId = await deep.id(PACKAGE_NAME, 'AccelerationXIncludingGravity');
  const accelerationYIncludingGravityTypeLinkId = await deep.id(PACKAGE_NAME, 'AccelerationYIncludingGravity');
  const accelerationZIncludingGravityTypeLinkId = await deep.id(PACKAGE_NAME, 'AccelerationZIncludingGravity');
  const intervalTypeLinkId = await deep.id(PACKAGE_NAME, 'Interval');
  const containTypeLinkId = await deep.id('@deep-foundation/core', 'Contain');
  const rotationRateAlphaTypeLinkId = await deep.id(PACKAGE_NAME, 'RotationRateAlpha');
  const rotationRateBetaTypeLinkId = await deep.id(PACKAGE_NAME, 'RotationRateBeta');
  const rotationRateGammaTypeLinkId = await deep.id(PACKAGE_NAME, 'RotationRateGamma');

  const {data: linksUpToParentDeviceLink} = await deep.select({
    down: {
      parent_id: {
        _eq: deviceLinkId
      },
      tree_id: {
        _eq: await deep.id(PACKAGE_NAME, "MotionTree")
      }
    }
  });

  if (linksUpToParentDeviceLink.length === 1) {
    await deep.insert([
      {
        type_id: accelerationXTypeLinkId,
        from_id: deviceLinkId,
        to_id: deviceLinkId,
        in: {
          data: {
            type_id: containTypeLinkId,
            from_id: deep.linkId
          }
        },
        number: {
          data: {
            value: data.acceleration.x
          }
        }
      },
      {
        type_id: accelerationYTypeLinkId,
        from_id: deviceLinkId,
        to_id: deviceLinkId,
        in: {
          data: {
            type_id: containTypeLinkId,
            from_id: deep.linkId
          }
        },
        number: {
          data: {
            value: data.acceleration.y
          }
        }
      },
      {
        type_id: accelerationZTypeLinkId,
        from_id: deviceLinkId,
        to_id: deviceLinkId,
        in: {
          data: {
            type_id: containTypeLinkId,
            from_id: deep.linkId
          }
        },
        number: {
          data: {
            value: data.acceleration.z
          }
        }
      },
      {
        type_id: accelerationXIncludingGravityTypeLinkId,
        from_id: deviceLinkId,
        to_id: deviceLinkId,
        in: {
          data: {
            type_id: containTypeLinkId,
            from_id: deep.linkId
          }
        },
        number: {
          data: {
            value: data.accelerationIncludingGravity.x
          }
        }
      },
      {
        type_id: accelerationYIncludingGravityTypeLinkId,
        from_id: deviceLinkId,
        to_id: deviceLinkId,
        in: {
          data: {
            type_id: containTypeLinkId,
            from_id: deep.linkId
          }
        },
        number: {
          data: {
            value: data.accelerationIncludingGravity.y
          }
        }
      },
      {
        type_id: accelerationZIncludingGravityTypeLinkId,
        from_id: deviceLinkId,
        to_id: deviceLinkId,
        in: {
          data: {
            type_id: containTypeLinkId,
            from_id: deep.linkId
          }
        },
        number: {
          data: {
            value: data.accelerationIncludingGravity.z
          }
        }
      },
      {
        type_id: rotationRateAlphaTypeLinkId,
        from_id: deviceLinkId,
        to_id: deviceLinkId,
        in: {
          data: {
            type_id: containTypeLinkId,
            from_id: deep.linkId
          }
        },
        number: {
          data: {
            value: data.rotationRate.alpha
          }
        }
      },
      {
        type_id: rotationRateBetaTypeLinkId,
        from_id: deviceLinkId,
        to_id: deviceLinkId,
        in: {
          data: {
            type_id: containTypeLinkId,
            from_id: deep.linkId
          }
        },
        number: {
          data: {
            value: data.rotationRate.beta
          }
        }
      },
      {
        type_id: rotationRateGammaTypeLinkId,
        from_id: deviceLinkId,
        to_id: deviceLinkId,
        in: {
          data: {
            type_id: containTypeLinkId,
            from_id: deep.linkId
          }
        },
        number: {
          data: {
            value: data.rotationRate.gamma
          }
        }
      },
      {
        type_id: intervalTypeLinkId,
        from_id: deviceLinkId,
        to_id: deviceLinkId,
        in: {
          data: {
            type_id: containTypeLinkId,
            from_id: deep.linkId
          }
        },
        number: {
          data: {
            value: data.interval
          }
        }
      },
    ])
  } else if (linksUpToParentDeviceLink.length > 1) {
    const accelerationXLink = linksUpToParentDeviceLink.find(link => link.type_id === accelerationXTypeLinkId);
    await deep.update(
      {
        link_id: accelerationXLink.id
      },
      {
        value: data.acceleration.x
      },
      {
        table: 'numbers'
      }
    )

    const accelerationYLink = linksUpToParentDeviceLink.find(link => link.type_id === accelerationYTypeLinkId);
    await deep.update(
      {
        link_id: accelerationYLink.id
      },
      {
        value: data.acceleration.y
      },
      {
        table: 'numbers'
      }
    )

    const accelerationZLink = linksUpToParentDeviceLink.find(link => link.type_id === accelerationZTypeLinkId);
    await deep.update(
      {
        link_id: accelerationZLink.id
      },
      {
        value: data.acceleration.z
      },
      {
        table: 'numbers'
      }
    )

    const accelerationXIncludingGravityLink = linksUpToParentDeviceLink.find(link => link.type_id === accelerationXIncludingGravityTypeLinkId);
    await deep.update(
      {
        link_id: accelerationXIncludingGravityLink.id
      },
      {
        value: data.accelerationIncludingGravity.x
      },
      {
        table: 'numbers'
      }
    )

    const accelerationYIncludingGravityLink = linksUpToParentDeviceLink.find(link => link.type_id === accelerationYIncludingGravityTypeLinkId);
    await deep.update(
      {
        link_id: accelerationYIncludingGravityLink.id
      },
      {
        value: data.accelerationIncludingGravity.y
      },
      {
        table: 'numbers'
      }
    )

    const accelerationZIncludingGravityLink = linksUpToParentDeviceLink.find(link => link.type_id === accelerationZIncludingGravityTypeLinkId);
    await deep.update(
      {
        link_id: accelerationZIncludingGravityLink.id
      },
      {
        value: data.accelerationIncludingGravity.z
      },
      {
        table: 'numbers'
      }
    )

    const rotationRateAlphaLink = linksUpToParentDeviceLink.find(link => link.type_id === rotationRateAlphaTypeLinkId);
    await deep.update(
      {
        link_id: rotationRateAlphaLink.id
      },
      {
        value: data.rotationRate.alpha
      },
      {
        table: 'numbers'
      }
    )

    const rotationRateBetaLink = linksUpToParentDeviceLink.find(link => link.type_id === rotationRateBetaTypeLinkId);
    await deep.update(
      {
        link_id: rotationRateBetaLink.id
      },
      {
        value: data.rotationRate.beta
      },
      {
        table: 'numbers'
      }
    )

    const rotationRateGammaLink = linksUpToParentDeviceLink.find(link => link.type_id === rotationRateGammaTypeLinkId);
    await deep.update(
      {
        link_id: rotationRateGammaLink.id
      },
      {
        value: data.rotationRate.gamma
      },
      {
        table: 'numbers'
      }
    )

    const intervalLink = linksUpToParentDeviceLink.find(link => link.type_id === intervalTypeLinkId);
    await deep.update(
      {
        link_id: intervalLink.id
      },
      {
        value: data.interval
      },
      {
        table: 'numbers'
      }
    )
  }
}
