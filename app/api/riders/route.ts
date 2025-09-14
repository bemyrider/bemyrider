import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { profiles, ridersDetails } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Query Drizzle per ottenere tutti i rider con i loro dettagli
    const riders = await db
      .select({
        id: profiles.id,
        fullName: profiles.fullName,
        role: profiles.role,
        hourlyRate: ridersDetails.hourlyRate,
        vehicleType: ridersDetails.vehicleType,
        bio: ridersDetails.bio,
        activeLocation: ridersDetails.activeLocation,
        profilePictureUrl: ridersDetails.profilePictureUrl,
        experienceYears: ridersDetails.experienceYears,
        completedJobs: ridersDetails.completedJobs,
        rating: ridersDetails.rating,
        isVerified: ridersDetails.isVerified,
        isPremium: ridersDetails.isPremium,
        createdAt: profiles.createdAt,
        updatedAt: profiles.updatedAt,
      })
      .from(profiles)
      .innerJoin(ridersDetails, eq(profiles.id, ridersDetails.profileId))
      .where(eq(profiles.role, 'rider'))
      .orderBy(profiles.createdAt);

    return NextResponse.json(riders);
  } catch (error: any) {
    console.error('Error fetching riders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
