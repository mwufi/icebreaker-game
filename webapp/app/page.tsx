import { AuthWrapper } from '@/components/auth/AuthWrapper';

export default function Home() {
  return (
    <AuthWrapper>
      <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <h1 className="text-4xl font-bold text-center sm:text-left">
            NGL App
          </h1>
          <p className="text-lg text-gray-600 text-center sm:text-left">
            Welcome to your authenticated NGL application!
          </p>

          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold mb-4">Google Authentication Test</h2>
            <p className="text-gray-600 mb-4">
              You are now signed in with Google! This demonstrates the InstantDB authentication flow.
            </p>
            <div className="text-sm text-gray-500">
              <p>✅ Google OAuth integration working</p>
              <p>✅ InstantDB authentication configured</p>
              <p>✅ User session management active</p>
            </div>
          </div>
        </main>
      </div>
    </AuthWrapper>
  );
}
