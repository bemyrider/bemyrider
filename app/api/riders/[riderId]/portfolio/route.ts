import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { ridersDetails } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Configurazione Supabase Storage
const BUCKET_NAME = 'portfolio-images';
const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Helper function to create Supabase server client
function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );
}

interface PortfolioData {
  portfolioImages: string[];
  certifications: string[];
  portfolioUrl: string;
  servicesDescription: string;
}

// GET - Recupera il portfolio di un rider
export async function GET(
  request: NextRequest,
  { params }: { params: { riderId: string } }
) {
  try {
    const riderId = params.riderId;

    if (!riderId) {
      return NextResponse.json(
        { error: 'Rider ID is required' },
        { status: 400 }
      );
    }

    // Recupera i dati del portfolio dal database
    const portfolioData = await db
      .select({
        portfolioImages: ridersDetails.portfolioImages,
        certifications: ridersDetails.certifications,
        portfolioUrl: ridersDetails.portfolioUrl,
        servicesDescription: ridersDetails.servicesDescription,
        portfolioUpdatedAt: ridersDetails.portfolioUpdatedAt,
      })
      .from(ridersDetails)
      .where(eq(ridersDetails.profileId, riderId))
      .limit(1);

    if (!portfolioData || portfolioData.length === 0) {
      return NextResponse.json(
        {
          portfolioImages: [],
          certifications: [],
          portfolioUrl: '',
          servicesDescription: '',
          portfolioUpdatedAt: null,
        },
        { status: 200 }
      );
    }

    const portfolio = portfolioData[0];

    return NextResponse.json({
      portfolioImages: portfolio.portfolioImages || [],
      certifications: portfolio.certifications || [],
      portfolioUrl: portfolio.portfolioUrl || '',
      servicesDescription: portfolio.servicesDescription || '',
      portfolioUpdatedAt: portfolio.portfolioUpdatedAt,
    });
  } catch (error: any) {
    console.error('Error fetching rider portfolio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Aggiorna il portfolio di un rider
export async function PUT(
  request: NextRequest,
  { params }: { params: { riderId: string } }
) {
  try {
    const riderId = params.riderId;

    if (!riderId) {
      return NextResponse.json(
        { error: 'Rider ID is required' },
        { status: 400 }
      );
    }

    // Verifica autenticazione
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verifica che l'utente sia il proprietario del portfolio o un admin
    if (user.id !== riderId) {
      // TODO: Aggiungere controllo admin se necessario
      return NextResponse.json(
        { error: 'Forbidden: You can only edit your own portfolio' },
        { status: 403 }
      );
    }

    // Parse del body della richiesta
    const body: PortfolioData = await request.json();

    // Validazione dati
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Validazione portfolioImages
    if (body.portfolioImages && !Array.isArray(body.portfolioImages)) {
      return NextResponse.json(
        { error: 'portfolioImages must be an array' },
        { status: 400 }
      );
    }

    if (body.portfolioImages && body.portfolioImages.length > MAX_IMAGES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_IMAGES} images allowed` },
        { status: 400 }
      );
    }

    // Validazione certifications
    if (body.certifications && !Array.isArray(body.certifications)) {
      return NextResponse.json(
        { error: 'certifications must be an array' },
        { status: 400 }
      );
    }

    // Validazione portfolioUrl
    if (body.portfolioUrl && typeof body.portfolioUrl !== 'string') {
      return NextResponse.json(
        { error: 'portfolioUrl must be a string' },
        { status: 400 }
      );
    }

    if (body.portfolioUrl && !body.portfolioUrl.match(/^https?:\/\/.+/)) {
      return NextResponse.json(
        {
          error:
            'portfolioUrl must be a valid URL starting with http:// or https://',
        },
        { status: 400 }
      );
    }

    // Validazione servicesDescription
    if (
      body.servicesDescription &&
      typeof body.servicesDescription !== 'string'
    ) {
      return NextResponse.json(
        { error: 'servicesDescription must be a string' },
        { status: 400 }
      );
    }

    if (body.servicesDescription && body.servicesDescription.length > 1000) {
      return NextResponse.json(
        { error: 'servicesDescription must be less than 1000 characters' },
        { status: 400 }
      );
    }

    // Salva i dati nel database
    const updateData: any = {
      portfolioUpdatedAt: new Date(),
    };

    if (body.portfolioImages !== undefined) {
      updateData.portfolioImages = body.portfolioImages;
    }

    if (body.certifications !== undefined) {
      updateData.certifications = body.certifications;
    }

    if (body.portfolioUrl !== undefined) {
      updateData.portfolioUrl = body.portfolioUrl;
    }

    if (body.servicesDescription !== undefined) {
      updateData.servicesDescription = body.servicesDescription;
    }

    // Esegue l'update
    await db
      .update(ridersDetails)
      .set(updateData)
      .where(eq(ridersDetails.profileId, riderId));

    return NextResponse.json({
      success: true,
      message: 'Portfolio updated successfully',
      data: {
        portfolioImages: body.portfolioImages || [],
        certifications: body.certifications || [],
        portfolioUrl: body.portfolioUrl || '',
        servicesDescription: body.servicesDescription || '',
        portfolioUpdatedAt: new Date(),
      },
    });
  } catch (error: any) {
    console.error('Error updating rider portfolio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Upload di immagini per il portfolio
export async function POST(
  request: NextRequest,
  { params }: { params: { riderId: string } }
) {
  try {
    const riderId = params.riderId;

    if (!riderId) {
      return NextResponse.json(
        { error: 'Rider ID is required' },
        { status: 400 }
      );
    }

    // Verifica autenticazione
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verifica che l'utente sia il proprietario del portfolio
    if (user.id !== riderId) {
      return NextResponse.json(
        {
          error: 'Forbidden: You can only upload images to your own portfolio',
        },
        { status: 403 }
      );
    }

    // Parse del form data per l'upload
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validazione dimensione file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size too large. Maximum 5MB allowed' },
        { status: 400 }
      );
    }

    // Validazione tipo file
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' },
        { status: 400 }
      );
    }

    // Genera nome file univoco
    const fileExtension = file.name.split('.').pop();
    const fileName = `${riderId}/${Date.now()}.${fileExtension}`;

    // Converts the file to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Upload del file a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading file to Supabase Storage:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      );
    }

    // Genera l'URL pubblico dell'immagine
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: publicUrl,
      fileName: fileName,
    });
  } catch (error: any) {
    console.error('Error uploading portfolio image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
