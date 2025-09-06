import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome to SuperSecret
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to access your profile
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="grid place-items-center py-8 px-4 rounded-lg sm:px-10">
                    <SignIn />
                </div>
                
                <div className="mt-6 text-center">
                    <Link 
                        href="/" 
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                    >
                        ← Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}