import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Get authenticated user for security
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Get session for API calls
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { accountId } = await request.json();

  if (!accountId) {
    return new NextResponse('Stripe Account ID is required', { status: 400 });
  }

  try {
    const loginLink = await stripe.accounts.createLoginLink(accountId);

    return NextResponse.json({ url: loginLink.url });
  } catch (error: any) {
    console.error('Error creating Stripe login link:', error);
    return NextResponse.json(
      { error: 'Failed to create login link' },
      { status: 500 }
    );
  }
}
