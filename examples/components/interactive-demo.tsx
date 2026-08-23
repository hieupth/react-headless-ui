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
      // With no consumer className the lib's own vocabulary classes
      // (.button .button-default) apply — painted by showcase.css.
      className={className}
    >
      {label}
    </Button>
  );
}
