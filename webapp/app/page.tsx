import { AuthWrapper } from '@/components/auth/AuthWrapper';

export default function Home() {
  return (
    <AuthWrapper>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to SuperSecret
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            You're successfully authenticated! This is your dashboard.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile</h3>
              <p className="text-gray-600">Manage your account settings and preferences.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Community</h3>
              <p className="text-gray-600">Connect with other users and share experiences.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Support</h3>
              <p className="text-gray-600">Get help and report any issues you encounter.</p>
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
