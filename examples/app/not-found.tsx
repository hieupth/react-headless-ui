import Link from 'next/link';

// Custom 404 for the showcase. Without it Next renders the stock framework
// error (inline system-ui styles, height:100vh) inside the docs layout, which
// leaves the long sidebar-driven page ~84% blank below the message.
export default function NotFound() {
  return (
    <div className="nf-page">
      <p className="nf-code">404</p>
      <h1 className="docs-h1">Page not found</h1>
      <p className="docs-desc">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className="button button-default button-lg nf-back">
        Back to overview
      </Link>
    </div>
  );
}
