'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to login page
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-800">Redirecting to login...</h1>
      </div>
    </div>
  );
}