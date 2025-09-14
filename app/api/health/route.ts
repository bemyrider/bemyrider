import { NextResponse } from 'next/server';

/**
 * Health check endpoint per verificare lo stato della connessione
 * e la disponibilità dei servizi
 */
export async function GET() {
  try {
    const startTime = Date.now();

    // Verifica base che il server risponde
    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        services: {
          api: 'ok',
          server: 'ok',
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Internal server error',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  }
}

// Supporta anche HEAD requests per test più leggeri
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}
