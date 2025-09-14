'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function TestRolesPage() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setUserInfo({ user, profile });
      }
    };
    fetchUserData();
  }, []);

  const testDashboardAccess = async (dashboardType: 'rider' | 'merchant') => {
    setLoading(true);
    const results: { test: string; status: string; details?: string }[] = [];

    try {
      // Test 1: Check direct URL access
      const response = await fetch(`/dashboard/${dashboardType}`);
      results.push({
        test: `Direct access to /dashboard/${dashboardType}`,
        status: response.ok ? '✅ ACCESSIBLE' : '❌ BLOCKED',
        details: `HTTP ${response.status}`,
      });

      // Test 2: Check if current user role matches dashboard
      if (userInfo?.profile) {
        const hasCorrectRole = userInfo.profile.role === dashboardType;
        results.push({
          test: `Role verification for ${dashboardType} dashboard`,
          status: hasCorrectRole ? '✅ CORRECT ROLE' : '🚫 WRONG ROLE',
          details: `User role: ${userInfo.profile.role}, Required: ${dashboardType}`,
        });
      }
    } catch (error) {
      results.push({
        test: `Access test for ${dashboardType}`,
        status: '❌ ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    setTestResults(prev => [...prev, ...results]);
    setLoading(false);
  };

  const runAllTests = async () => {
    setTestResults([]);
    await testDashboardAccess('rider');
    await testDashboardAccess('merchant');
  };

  const updateUserRole = async (newRole: 'rider' | 'merchant') => {
    if (!userInfo?.user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userInfo.user.id);

      if (error) {
        alert('Error updating role: ' + error.message);
      } else {
        alert(`Role updated to ${newRole} successfully!`);
        window.location.reload();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className='max-w-6xl mx-auto p-8'>
      <h1 className='text-3xl font-bold mb-8'>🧪 Role Protection Test Suite</h1>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
        <Card>
          <CardHeader>
            <CardTitle>👤 Current User Info</CardTitle>
          </CardHeader>
          <CardContent>
            {userInfo ? (
              <div className='space-y-2'>
                <p>
                  <strong>Email:</strong> {userInfo.user.email}
                </p>
                <p>
                  <strong>Role:</strong>{' '}
                  <span
                    className={`px-2 py-1 rounded ${
                      userInfo.profile?.role === 'merchant'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {userInfo.profile?.role || 'No role'}
                  </span>
                </p>
                <p>
                  <strong>Name:</strong> {userInfo.profile?.full_name || 'N/A'}
                </p>
              </div>
            ) : (
              <p>
                Not logged in.{' '}
                <a href='/auth/login' className='text-blue-600 underline'>
                  Login
                </a>
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔧 Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <Button
                onClick={runAllTests}
                disabled={loading}
                className='w-full'
              >
                {loading ? 'Testing...' : 'Run All Protection Tests'}
              </Button>

              {userInfo && (
                <>
                  <Button
                    variant='outline'
                    onClick={() => updateUserRole('rider')}
                    className='w-full'
                  >
                    Switch to Rider Role
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => updateUserRole('merchant')}
                    className='w-full'
                  >
                    Switch to Merchant Role
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>🎯 Manual Navigation Tests</CardTitle>
          <CardDescription>
            Test navigation to different dashboards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <Button onClick={() => router.push('/dashboard/rider')}>
              Go to Rider Dashboard
            </Button>
            <Button onClick={() => router.push('/dashboard/merchant')}>
              Go to Merchant Dashboard
            </Button>
            <Button
              variant='outline'
              onClick={() => router.push('/auth/login')}
            >
              Test Login
            </Button>
            <Button
              variant='outline'
              onClick={() => router.push('/debug-user')}
            >
              Debug User Info
            </Button>
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📋 Test Results</CardTitle>
            <CardDescription>
              Results from automated protection tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {testResults.map((result, index) => (
                <div key={index} className='p-3 border rounded-lg'>
                  <div className='flex items-center justify-between mb-1'>
                    <span className='font-medium'>{result.test}</span>
                    <span className='text-sm'>{result.status}</span>
                  </div>
                  <p className='text-sm text-gray-600'>{result.details}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className='mt-6'>
        <CardHeader>
          <CardTitle>📖 Expected Behavior</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-sm space-y-2'>
            <p>
              <strong>✅ Correct behavior:</strong>
            </p>
            <ul className='list-disc ml-6 space-y-1'>
              <li>Riders can ONLY access /dashboard/rider</li>
              <li>Merchants can ONLY access /dashboard/merchant</li>
              <li>
                Accessing wrong dashboard → automatic redirect to correct one
              </li>
              <li>Not logged in → redirect to /auth/login</li>
              <li>Login → automatic redirect based on user role</li>
            </ul>

            <p className='mt-4'>
              <strong>🚫 Security violations:</strong>
            </p>
            <ul className='list-disc ml-6 space-y-1'>
              <li>Rider accessing merchant dashboard</li>
              <li>Merchant accessing rider dashboard</li>
              <li>Unauthenticated access to any dashboard</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
