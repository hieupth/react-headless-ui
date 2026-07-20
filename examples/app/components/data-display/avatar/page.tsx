'use client';

import { Avatar } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// Avatar renders a container <div> with an <img> and a fallback. It tracks
// loading / error states internally and swaps to initials when the image fails.
// Headless on CSS — theme it through className.
export default function AvatarPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Avatar</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A user-image component backed by the headless{' '}
          <code className="font-mono text-sm">useAvatar</code> hook. It loads an
          image from <code>src</code>, tracks loading/error states, and falls
          back to initials from <code>fallback</code> when the image is missing
          or fails. Sizes range from <code>sm</code> to <code>2xl</code>; pass{' '}
          <code>onClick</code> to make it an interactive button.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Image with fallback</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          When <code>src</code> fails, the initials derived from{' '}
          <code>fallback</code> are shown instead.
        </p>
        <Demo
          code={`<Avatar src="/avatars/ada.png" fallback="Ada Lovelace" />
<Avatar src="/broken.png" fallback="Grace Hopper" />`}
        >
          <div className="flex items-center gap-3">
            <Avatar src="https://i.pravatar.cc/96?img=12" fallback="Ada Lovelace" className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-semibold" />
            <Avatar src="/definitely-broken.png" fallback="Grace Hopper" className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-semibold" />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Sizes</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>size</code> drives the size-class hook on the underlying hook;
          here Tailwind supplies the actual dimensions.
        </p>
        <Demo
          code={`<Avatar size="sm" fallback="SM" />
<Avatar size="md" fallback="MD" />
<Avatar size="lg" fallback="LG" />
<Avatar size="xl" fallback="XL" />`}
        >
          <div className="flex items-end gap-3">
            <Avatar size="sm" fallback="SM" className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs" />
            <Avatar size="md" fallback="MD" className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm" />
            <Avatar size="lg" fallback="LG" className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center text-base" />
            <Avatar size="xl" fallback="XL" className="w-16 h-16 rounded-full bg-indigo-500 text-white flex items-center justify-center text-lg" />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Clickable avatar</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Pass <code>onClick</code> to make the avatar focusable and activatable
          via keyboard.
        </p>
        <Demo
          code={`<Avatar
  fallback="Click me"
  onClick={() => alert('Avatar clicked')}
/>`}
        >
          <Avatar
            fallback="Click me"
            onClick={() => alert('Avatar clicked')}
            className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm cursor-pointer"
          />
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            { name: 'src', type: 'string', default: '—', description: 'Image source URL.' },
            { name: 'alt', type: 'string', default: '—', description: 'Alt text for the image.' },
            { name: 'fallback', type: 'string', default: '—', description: 'Initials/text shown when the image is missing or errors.' },
            { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl' | '2xl'", default: "'md'", description: 'Avatar size hook.' },
            { name: 'clickable', type: 'boolean', default: 'false', description: 'Whether the avatar is interactive.' },
            { name: 'onClick', type: '() => void', default: '—', description: 'Click handler (also enables keyboard activation).' },
            { name: 'onImageError', type: '(error: Event) => void', default: '—', description: 'Fires when the image fails to load.' },
            { name: 'onImageLoad', type: '(event: Event) => void', default: '—', description: 'Fires when the image loads successfully.' },
          ]}
        />
      </section>
    </div>
  );
}
