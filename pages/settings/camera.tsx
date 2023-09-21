import {
  Card,
  CardBody,
  CardHeader,
  ChakraProvider,
  FormControl,
  FormLabel,
  Heading,
  Switch,
  useToast,
} from '@chakra-ui/react';
import { DeepClient, DeepProvider } from '@deep-foundation/deeplinks/imports/client';
import { useCapacitorStore } from '@deep-foundation/store/capacitor';
import { Provider } from '../../imports/provider';
import { CapacitorStoreKeys } from '../../imports/capacitor-store-keys';
import { Page } from '../../components/page';
import { SettingContent } from '../../components/setting-page';
import {Camera} from '@capacitor/camera'

function Content() {
  const toast = useToast();
  const [isCameraSyncEnabled, setIsCameraSyncEnabled] = useCapacitorStore(
    CapacitorStoreKeys[CapacitorStoreKeys.IsCameraSyncEnabled],
    undefined
  );

  return (
    <Card>
          <CardHeader>
            <Heading>Camera</Heading>
          </CardHeader>
          <CardBody>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="sync-camera-switch" mb="0">
                Sync Camera
              </FormLabel>
              <Switch
                id="sync-camera-switch"
                isChecked={isCameraSyncEnabled}
                onChange={async (event) => {
                  const permissionsResult = await Camera.requestPermissions()
                  if(permissionsResult.camera!=='granted' || permissionsResult.photos !== 'granted') {
                    toast({
                      title: 'Camera permissions required',
                      description: 'Please enable camera permissions in your device settings',
                      status: 'error',
                      duration: null,
                      isClosable: true,
                    })
                  } else {
                    setIsCameraSyncEnabled(event.target.checked);
                  }
                }}
              />
            </FormControl>
          </CardBody>
        </Card>
  );
}

export default function CameraSettingsPage() {
  return (
    <Page renderChildren={({deep,deviceLinkId}) => <SettingContent>
      <Content />
    </SettingContent>} />
  );
}
