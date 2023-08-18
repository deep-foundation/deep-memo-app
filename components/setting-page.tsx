import { Stack } from "@chakra-ui/react";
import { NavBar } from "./navbar";

export function SettingContent(options: SettingPageOptions) {
  return (
    <Stack alignItems={'center'}>
      <NavBar />
      {options.children}
    </Stack>
  );
}

export interface SettingPageOptions {
  children: JSX.Element
}
