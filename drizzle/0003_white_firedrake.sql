CREATE TYPE "public"."PaymentStatus" AS ENUM('in_attesa', 'pagato', 'rimborsato');--> statement-breakpoint
CREATE TYPE "public"."ServiceRequestStatus" AS ENUM('pending', 'accepted', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."Status" AS ENUM('in_attesa', 'confermata', 'in_corso', 'completata', 'annullata');--> statement-breakpoint
CREATE TABLE "esercente_tax_details" (
	"esercente_id" uuid PRIMARY KEY NOT NULL,
	"company_name" varchar(255),
	"vat_number" varchar(50),
	"address" varchar(255),
	"city" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "esercenti" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_name" varchar(255) NOT NULL,
	"address" varchar(255),
	"city" varchar(100),
	"phone_number" varchar(20),
	"description" text,
	"profile_picture_url" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "occasional_performance_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prenotazione_id" uuid NOT NULL,
	"receipt_number" integer NOT NULL,
	"receipt_date" timestamp NOT NULL,
	CONSTRAINT "occasional_performance_receipts_prenotazione_id_unique" UNIQUE("prenotazione_id")
);
--> statement-breakpoint
CREATE TABLE "prenotazioni" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"esercente_id" uuid NOT NULL,
	"rider_id" uuid NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"service_duration_hours" numeric(5, 2) NOT NULL,
	"gross_amount" numeric(10, 2) NOT NULL,
	"tax_withholding_amount" numeric(10, 2),
	"net_amount" numeric(10, 2) NOT NULL,
	"status" "Status" NOT NULL,
	"payment_status" "PaymentStatus" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text,
	"avatar_url" text,
	"role" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recensioni" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prenotazione_id" uuid NOT NULL,
	"esercente_id" uuid NOT NULL,
	"rider_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recensioni_prenotazione_id_unique" UNIQUE("prenotazione_id")
);
--> statement-breakpoint
CREATE TABLE "rider_tax_details" (
	"rider_id" uuid PRIMARY KEY NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"fiscal_code" varchar(50),
	"birth_place" varchar(100),
	"birth_date" timestamp,
	"residence_address" varchar(255),
	"residence_city" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "service_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"merchant_id" uuid NOT NULL,
	"rider_id" uuid NOT NULL,
	"requested_date" timestamp NOT NULL,
	"start_time" time NOT NULL,
	"duration_hours" numeric(5, 2) NOT NULL,
	"description" text,
	"status" "ServiceRequestStatus" DEFAULT 'pending' NOT NULL,
	"rider_response" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "disponibilita_riders" DROP CONSTRAINT "disponibilita_riders_rider_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "riders_details" ALTER COLUMN "hourly_rate" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "riders_details" ADD COLUMN "active_location" varchar(100) DEFAULT 'Non specificata' NOT NULL;--> statement-breakpoint
ALTER TABLE "riders_details" DROP COLUMN "first_name";--> statement-breakpoint
ALTER TABLE "riders_details" DROP COLUMN "last_name";--> statement-breakpoint
ALTER TABLE "riders_details" DROP COLUMN "avg_rating";