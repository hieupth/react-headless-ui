'use client';

import { FileUpload } from '@hieupth/reui';
import { Demo } from '@/components/demo';
import { PropsTable } from '@/components/props-table';

// FileUpload is headless: useFileUpload handles drag/drop, file selection,
// size/count/type validation, and removal, all with ARIA. The component renders
// its own dropzone + file list with empty classes — theme via descendant
// selectors on .file-upload-container and its children.
const uploadBase =
  'w-full ' +
  '[&>div:first-of-type]:flex [&>div:first-of-type]:flex-col [&>div:first-of-type]:items-center ' +
  '[&>div:first-of-type]:justify-center [&>div:first-of-type]:gap-2 [&>div:first-of-type]:rounded-lg ' +
  '[&>div:first-of-type]:border-2 [&>div:first-of-type]:border-dashed [&>div:first-of-type]:border-gray-300 dark:[&>div:first-of-type]:border-gray-600 ' +
  '[&>div:first-of-type]:bg-gray-50 dark:[&>div:first-of-type]:bg-gray-900 [&>div:first-of-type]:p-8 [&>div:first-of-type]:text-center ' +
  '[&>div:first-of-type]:transition-colors [&>div:first-of-type]:cursor-pointer ' +
  '[&>div:first-of-type:hover]:border-blue-400 [&>div:first-of-type:hover]:bg-blue-50 dark:[&>div:first-of-type:hover]:bg-blue-950 ' +
  '[&_svg]:h-8 [&_svg]:w-8 [&_svg]:text-gray-400 dark:[&_svg]:text-gray-500 ' +
  '[&_p]:text-sm [&_p]:text-gray-600 dark:[&_p]:text-gray-400 ' +
  '[&_p:first-of-type]:font-medium [&_p:first-of-type]:text-gray-900 dark:[&_p:first-of-type]:text-gray-100';

export default function FileUploadPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">FileUpload</h1>
        <p className="text-gray-600 dark:text-gray-400">
          A drag-and-drop file upload backed by the headless{' '}
          <code className="font-mono text-sm">useFileUpload</code> hook. It handles
          drag-over/drop, click-to-browse, size/count/type validation, and file
          removal — all wired with ARIA. The component renders its own dropzone
          and file list with empty classes; theme them via descendant selectors
          on <code className="font-mono text-sm">.file-upload-container</code>.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Basic</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A single-file dropzone. Click or drag a file onto it.
        </p>
        <Demo
          code={`<FileUpload uploadText="Upload a file" dragText="Drag and drop, or click to browse" className="w-full [&>div:first-of-type]:flex [&>div:first-of-type]:flex-col [&>div:first-of-type]:items-center [&>div:first-of-type]:justify-center [&>div:first-of-type]:gap-2 [&>div:first-of-type]:rounded-lg [&>div:first-of-type]:border-2 [&>div:first-of-type]:border-dashed [&>div:first-of-type]:border-gray-300 dark:[&>div:first-of-type]:border-gray-600 [&>div:first-of-type]:bg-gray-50 dark:[&>div:first-of-type]:bg-gray-900 [&>div:first-of-type]:p-8 [&>div:first-of-type]:text-center [&>div:first-of-type]:transition-colors [&>div:first-of-type]:cursor-pointer [&>div:first-of-type:hover]:border-blue-400 [&>div:first-of-type:hover]:bg-blue-50 dark:[&>div:first-of-type:hover]:bg-blue-950 [&_svg]:h-8 [&_svg]:w-8 [&_svg]:text-gray-400 dark:[&_svg]:text-gray-500 [&_p]:text-sm [&_p]:text-gray-600 dark:[&_p]:text-gray-400 [&_p:first-of-type]:font-medium [&_p:first-of-type]:text-gray-900 dark:[&_p:first-of-type]:text-gray-100" />`}
        >
          <div className="w-full max-w-md">
            <FileUpload
              className={uploadBase}
              uploadText="Upload a file"
              dragText="Drag and drop, or click to browse"
            />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Multiple with constraints</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <code>multiple</code> + <code>maxFiles</code> + <code>maxSize</code>{' '}
          (bytes) + <code>accept</code> (MIME/glob) constrain the selection.
        </p>
        <Demo
          code={`<FileUpload
  multiple
  maxFiles={5}
  maxSize={5 * 1024 * 1024}
  accept="image/*"
  uploadText="Upload images"
  dragText="Up to 5 images, max 5MB each"
  className="w-full [&>div:first-of-type]:flex [&>div:first-of-type]:flex-col [&>div:first-of-type]:items-center [&>div:first-of-type]:justify-center [&>div:first-of-type]:gap-2 [&>div:first-of-type]:rounded-lg [&>div:first-of-type]:border-2 [&>div:first-of-type]:border-dashed [&>div:first-of-type]:border-gray-300 dark:[&>div:first-of-type]:border-gray-600 [&>div:first-of-type]:bg-gray-50 dark:[&>div:first-of-type]:bg-gray-900 [&>div:first-of-type]:p-8 [&>div:first-of-type]:text-center [&>div:first-of-type]:transition-colors [&>div:first-of-type]:cursor-pointer [&>div:first-of-type:hover]:border-blue-400 [&>div:first-of-type:hover]:bg-blue-50 dark:[&>div:first-of-type:hover]:bg-blue-950 [&_svg]:h-8 [&_svg]:w-8 [&_svg]:text-gray-400 dark:[&_svg]:text-gray-500 [&_p]:text-sm [&_p]:text-gray-600 dark:[&_p]:text-gray-400 [&_p:first-of-type]:font-medium [&_p:first-of-type]:text-gray-900 dark:[&_p:first-of-type]:text-gray-100"
/>`}
        >
          <div className="w-full max-w-md">
            <FileUpload
              className={uploadBase}
              multiple
              maxFiles={5}
              maxSize={5 * 1024 * 1024}
              accept="image/*"
              uploadText="Upload images"
              dragText="Up to 5 images, max 5MB each"
            />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Controlled &amp; disabled</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Drive files with <code>value</code> / <code>onChange</code>;{' '}
          <code>disabled</code> blocks interaction.
        </p>
        <Demo
          code={`<FileUpload disabled uploadText="Uploads closed" className="w-full [&>div:first-of-type]:flex [&>div:first-of-type]:flex-col [&>div:first-of-type]:items-center [&>div:first-of-type]:justify-center [&>div:first-of-type]:gap-2 [&>div:first-of-type]:rounded-lg [&>div:first-of-type]:border-2 [&>div:first-of-type]:border-dashed [&>div:first-of-type]:border-gray-300 dark:[&>div:first-of-type]:border-gray-600 [&>div:first-of-type]:bg-gray-50 dark:[&>div:first-of-type]:bg-gray-900 [&>div:first-of-type]:p-8 [&>div:first-of-type]:text-center [&>div:first-of-type]:transition-colors [&>div:first-of-type]:cursor-pointer [&>div:first-of-type:hover]:border-blue-400 [&>div:first-of-type:hover]:bg-blue-50 dark:[&>div:first-of-type:hover]:bg-blue-950 [&_svg]:h-8 [&_svg]:w-8 [&_svg]:text-gray-400 dark:[&_svg]:text-gray-500 [&_p]:text-sm [&_p]:text-gray-600 dark:[&_p]:text-gray-400 [&_p:first-of-type]:font-medium [&_p:first-of-type]:text-gray-900 dark:[&_p:first-of-type]:text-gray-100" />
<FileUpload value={files} onChange={setFiles} className="w-full [&>div:first-of-type]:flex [&>div:first-of-type]:flex-col [&>div:first-of-type]:items-center [&>div:first-of-type]:justify-center [&>div:first-of-type]:gap-2 [&>div:first-of-type]:rounded-lg [&>div:first-of-type]:border-2 [&>div:first-of-type]:border-dashed [&>div:first-of-type]:border-gray-300 dark:[&>div:first-of-type]:border-gray-600 [&>div:first-of-type]:bg-gray-50 dark:[&>div:first-of-type]:bg-gray-900 [&>div:first-of-type]:p-8 [&>div:first-of-type]:text-center [&>div:first-of-type]:transition-colors [&>div:first-of-type]:cursor-pointer [&>div:first-of-type:hover]:border-blue-400 [&>div:first-of-type:hover]:bg-blue-50 dark:[&>div:first-of-type:hover]:bg-blue-950 [&_svg]:h-8 [&_svg]:w-8 [&_svg]:text-gray-400 dark:[&_svg]:text-gray-500 [&_p]:text-sm [&_p]:text-gray-600 dark:[&_p]:text-gray-400 [&_p:first-of-type]:font-medium [&_p:first-of-type]:text-gray-900 dark:[&_p:first-of-type]:text-gray-100" />`}
        >
          <div className="w-full max-w-md">
            <FileUpload
              className={uploadBase}
              disabled
              uploadText="Uploads closed"
              dragText="Try again later"
            />
          </div>
        </Demo>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Props</h2>
        <PropsTable
          props={[
            {
              name: 'value / defaultValue',
              type: 'File | File[] | null',
              default: 'null',
              description: 'Controlled or uncontrolled file selection.',
            },
            {
              name: 'onChange',
              type: '(files: File | File[] | null) => void',
              default: '—',
              description: 'Called with the new selection on change.',
            },
            {
              name: 'multiple',
              type: 'boolean',
              default: 'false',
              description: 'Allow selecting more than one file.',
            },
            {
              name: 'accept',
              type: 'string',
              default: '—',
              description: 'Accepted MIME types or globs (e.g. "image/*").',
            },
            {
              name: 'maxSize / minSize',
              type: 'number (bytes)',
              default: '—',
              description: 'Per-file size bounds.',
            },
            {
              name: 'maxFiles',
              type: 'number',
              default: '—',
              description: 'Maximum number of files (multiple mode).',
            },
            {
              name: 'validate',
              type: '(file: File) => boolean | string',
              default: '—',
              description: 'Custom validation; a string return is the error.',
            },
            {
              name: 'disabled / required',
              type: 'boolean',
              default: 'false',
              description: 'Native states reflected to ARIA.',
            },
            {
              name: 'size / variant',
              type: "'sm' | 'md' | 'lg' / 'outline' | 'filled' | 'ghost'",
              default: "'md' / 'outline'",
              description: 'Size and variant hooks.',
            },
            {
              name: 'uploadText / dragText / browseText',
              type: 'string',
              default: "'Upload files' / 'Drag and drop files here' / 'Browse files'",
              description: 'Dropzone copy.',
            },
          ]}
        />
      </section>
    </div>
  );
}
