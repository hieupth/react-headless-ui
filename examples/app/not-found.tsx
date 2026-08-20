import Link from 'next/link';

// Custom 404 for the showcase. Without it Next renders the stock framework
// error (inline system-ui styles, height:100vh) inside the docs layout, which
// leaves the long sidebar-driven page ~84% blank below the message.
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
        404
      </p>
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="max-w-md text-sm text-gray-600 dark:text-gray-400">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
      >
        Back to overview
      </Link>
    </div>
  );
}
