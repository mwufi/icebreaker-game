import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignInPage() {
    // Media variable - easily switch between video and image
    const mediaUrl = "https://cdn.midjourney.com/video/4ff32549-e337-4cc5-aeb9-8e3e64a63962/0.mp4";
    const isVideo = true; // Set to false to use an image instead

    return (
        <div className="max-h-screen overflow-hidden bg-white">
            {/* Mobile Layout - Single Column */}
            <div className="lg:hidden max-h-screen overflow-hidden flex flex-col">
                {/* Mobile Media */}
                <div className="flex-1 p-4">
                    <div className="h-full rounded-2xl overflow-hidden bg-gray-100">
                        {isVideo ? (
                            <video
                                className="w-full h-full object-cover"
                                autoPlay
                                muted
                                loop
                                playsInline
                            >
                                <source src={mediaUrl} type="video/mp4" />
                            </video>
                        ) : (
                            <img
                                src={mediaUrl}
                                alt="Welcome"
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                </div>

                {/* Mobile Sign In */}
                <div className="p-4">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border">
                        <div className="text-center mb-4">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Home is where you connect
                            </h1>
                            <p className="text-gray-600 text-sm">
                                We're building an app to connect people
                            </p>
                        </div>
                        <SignIn />
                    </div>
                </div>
            </div>

            {/* Desktop Layout - Two Columns */}
            <div className="hidden lg:flex max-h-screen">
                {/* Left Column - Media */}
                <div className="flex-1 p-6">
                    <div className="h-full rounded-3xl overflow-hidden bg-gray-100 relative">
                        {/* Logo Space */}
                        <div className="absolute top-6 left-6 z-10">
                            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                {/* Logo placeholder */}
                                <div className="w-8 h-8 bg-gray-300 rounded"></div>
                            </div>
                        </div>

                        {/* Message Overlay */}
                        <div className="absolute bottom-6 left-6 right-6 z-10">
                            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                                Home is where you connect
                            </h1>
                            <p className="text-xl text-white/90 drop-shadow-lg">
                                We're building an app to connect people
                            </p>
                        </div>

                        {/* Media */}
                        {isVideo ? (
                            <video
                                className="w-full h-full object-cover"
                                autoPlay
                                muted
                                loop
                                playsInline
                            >
                                <source src={mediaUrl} type="video/mp4" />
                            </video>
                        ) : (
                            <img
                                src={mediaUrl}
                                alt="Welcome"
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                </div>

                {/* Right Column - Sign In */}
                <div className="flex-1 flex items-center justify-center p-12">
                    <div className="w-full max-w-sm">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Welcome back
                            </h2>
                            <p className="text-gray-600 text-sm">
                                Or{' '}
                                <Link href="/" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                                    go back to home
                                </Link>
                            </p>
                        </div>
                        <SignIn />
                    </div>
                </div>
            </div>
        </div>
    );
}
