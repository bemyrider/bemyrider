CREATE TYPE "public"."DayOfWeek" AS ENUM('Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom');--> statement-breakpoint
CREATE TYPE "public"."PaymentStatus" AS ENUM('in_attesa', 'pagato', 'rimborsato');--> statement-breakpoint
CREATE TYPE "public"."Status" AS ENUM('in_attesa', 'confermata', 'in_corso', 'completata', 'annullata');--> statement-breakpoint
CREATE TYPE "public"."VehicleType" AS ENUM('bici', 'e_bike', 'scooter', 'auto');--> statement-breakpoint
CREATE TABLE "disponibilita_riders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rider_id" uuid NOT NULL,
	"day_of_week" "DayOfWeek" NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL
);
--> statement-breakpoint
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
	"full_name" varchar(255) NOT NULL,
	"avatar_url" varchar(255),
	"role" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
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
	"fiscal_code" varchar(50),
	"birth_place" varchar(100),
	"birth_date" timestamp,
	"residence_address" varchar(255),
	"residence_city" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "riders" (
	"id" uuid PRIMARY KEY NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"vehicle_type" "VehicleType" NOT NULL,
	"profile_picture_url" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "riders_details" (
	"profile_id" uuid PRIMARY KEY NOT NULL,
	"bio" text,
	"hourly_rate" numeric(10, 2) NOT NULL,
	"avg_rating" numeric(3, 2) DEFAULT '0.00' NOT NULL,
	"stripe_account_id" text,
	"stripe_onboarding_complete" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
