import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignInPage() {
    return (
        <div className="relative min-h-screen bg-black overflow-hidden">
            {/* Grainy texture overlay */}
            <div
                className="fixed inset-0 opacity-30 mix-blend-overlay pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Gradient background */}
            <div className="fixed inset-0 bg-gradient-to-b from-orange-900/40 via-red-900/30 to-black" />

            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-white font-[family-name:var(--font-merriweather)]">
                            Welcome to SuperSecret
                        </h1>
                        <p className="mt-2 text-sm text-white/70">
                            Sign in to access your profile
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center mt-8 sm:mx-auto sm:w-full sm:max-w-md min-h-[400px]">
                    <SignIn appearance={{
                        elements: {
                            card: "",
                            headerTitle: "",
                            headerSubtitle: "",
                            header: "hidden", // hide the header
                        },
                        variables: {
                            colorPrimary: "#ea580c",
                        }
                    }}
                    />

                    <div className="mt-6 text-center">
                        <Link
                            href="/"
                            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
                        >
                            ← Back to home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}