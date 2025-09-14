-- Create merchant_favorites table
CREATE TABLE "merchant_favorites" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "merchant_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "rider_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,

  -- Prevent duplicate favorites from same merchant
  UNIQUE("merchant_id", "rider_id")
);

-- Create indexes for performance
CREATE INDEX "idx_merchant_favorites_merchant_id" ON "merchant_favorites"("merchant_id");
CREATE INDEX "idx_merchant_favorites_rider_id" ON "merchant_favorites"("rider_id");
CREATE INDEX "idx_merchant_favorites_created_at" ON "merchant_favorites"("created_at");
