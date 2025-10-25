import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="text-center px-4">
                <h1 className="text-9xl font-bold text-orange-600 mb-4">404</h1>
                <h2 className="text-3xl font-semibold text-gray-800 mb-4">
                    Page Not Found
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Sorry, the page you are looking for doesn't exist or has been moved.
                </p>
                <Link
                    href="/"
                    className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                    Go Back Home
                </Link>
            </div>
        </div>
    );
}