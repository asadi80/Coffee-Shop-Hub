import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">☕</div>
        <h1 className="text-4xl font-serif font-bold text-coffee-dark mb-4">
          Shop Not Found
        </h1>
        <p className="text-lg text-coffee-medium mb-8">
          Sorry, we couldn't find the coffee shop you're looking for. It may have been removed or the link might be incorrect.
        </p>
        <div className="space-y-4">
          <Link href="/" className="btn-primary inline-block">
            Discover Coffee Shops
          </Link>
          <div>
            <Link href="/dashboard" className="text-coffee-medium hover:text-accent-orange transition-colors font-medium">
              Go to Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
