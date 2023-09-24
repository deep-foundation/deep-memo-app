import { HStack, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { LinkIcon } from '@chakra-ui/icons';

export function NavBar({ } = {}) {
  return (
    <HStack>
    <Link as={NextLink} href='/'>
      Home <LinkIcon mx='2px' />
    </Link>
    <Link as={NextLink} href="/settings">
        Settings <LinkIcon mx='2px' />
    </Link>
    </HStack>
  )
}