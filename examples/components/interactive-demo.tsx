'use client';

import { Button } from '@hieupth/react-headless-ui';

/**
 * Interactive demo button used inside docs MDX.
 *
 * Docs pages are Server Components that render MDX via the RSC `MDXRemote`.
 * MDX there cannot create an event-handler function and pass it to a Client
 * Component prop (`<Button onPress={() => ...}>`) — RSC serialization rejects
 * functions, which breaks the static export. This wrapper is itself a Client
 * Component, so `onPress` is defined on the client and no function crosses the
 * RSC boundary. MDX renders `<InteractiveDemo label="…" />` instead.
 */
export interface InteractiveDemoProps {
  /** Button label. */
  label?: string;
  /** Optional className forwarded to the underlying Button. */
  className?: string;
}

export function InteractiveDemo({ label = 'Click me', className }: InteractiveDemoProps) {
  return (
    <Button
      onPress={() => alert('Hello!')}
      className={
        className ??
        'inline-flex items-center justify-center rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600'
      }
    >
      {label}
    </Button>
  );
}
