-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "iso3" TEXT,
    "officialCode" TEXT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameLocal" TEXT,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" TEXT NOT NULL,
    "officialCode" TEXT,
    "code" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameLocal" TEXT,
    "type" TEXT NOT NULL DEFAULT 'state',
    "adminUnitTerm" TEXT NOT NULL DEFAULT 'Tehsil',
    "adminUnitTermPl" TEXT,
    "capital" TEXT,
    "tagline" TEXT,
    "source" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "countryId" TEXT NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" TEXT NOT NULL,
    "officialCode" TEXT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameLocal" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "source" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "stateId" TEXT NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUnit" (
    "id" TEXT NOT NULL,
    "officialCode" TEXT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "officialName" TEXT,
    "nameLocal" TEXT,
    "type" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "source" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "stateId" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "AdminUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Locality" (
    "id" TEXT NOT NULL,
    "officialCode" TEXT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameLocal" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'town',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "source" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "stateId" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "adminUnitId" TEXT,

    CONSTRAINT "Locality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Temple" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameLocal" TEXT,
    "alternativeNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "googlePlaceId" TEXT,
    "description" TEXT,
    "mainDeity" TEXT,
    "deities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "templeType" TEXT,
    "tradition" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "architecture" TEXT,
    "architectureSource" TEXT,
    "historicalPeriod" TEXT,
    "establishedYear" TEXT,
    "badges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "documentedHistory" TEXT,
    "traditionalBeliefs" TEXT,
    "religiousSignificance" TEXT,
    "culturalSignificance" TEXT,
    "stateCode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT,
    "districtId" TEXT NOT NULL,
    "adminUnitId" TEXT,
    "localityId" TEXT,
    "officialWebsite" TEXT,
    "officialPhone" TEXT,
    "officialEmail" TEXT,
    "googleMapsUrl" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "source" TEXT,
    "sourceType" TEXT,
    "sourceUrl" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "publishedBy" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Temple_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TempleTiming" (
    "id" TEXT NOT NULL,
    "templeId" TEXT NOT NULL,
    "day" TEXT NOT NULL DEFAULT 'daily',
    "label" TEXT,
    "openTime" TEXT,
    "closeTime" TEXT,
    "breakStart" TEXT,
    "breakEnd" TEXT,
    "note" TEXT,
    "source" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',

    CONSTRAINT "TempleTiming_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DarshanOption" (
    "id" TEXT NOT NULL,
    "templeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'general',
    "timing" TEXT,
    "price" TEXT,
    "durationMin" INTEGER,
    "bookingRequired" BOOLEAN NOT NULL DEFAULT false,
    "bookingUrl" TEXT,
    "source" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',

    CONSTRAINT "DarshanOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seva" (
    "id" TEXT NOT NULL,
    "templeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "timing" TEXT,
    "price" TEXT,
    "bookingRequired" BOOLEAN NOT NULL DEFAULT false,
    "bookingUrl" TEXT,
    "source" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',

    CONSTRAINT "Seva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Festival" (
    "id" TEXT NOT NULL,
    "templeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dateLabel" TEXT,
    "month" INTEGER,
    "day" INTEGER,
    "specialTiming" TEXT,
    "bookingInformation" TEXT,
    "isRegional" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',

    CONSTRAINT "Festival_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TempleBooking" (
    "id" TEXT NOT NULL,
    "templeId" TEXT NOT NULL,
    "bookingType" TEXT NOT NULL DEFAULT 'darshan',
    "onlineAvailable" BOOLEAN,
    "offlineAvailable" BOOLEAN,
    "price" TEXT,
    "bookingUrl" TEXT,
    "counterLocation" TEXT,
    "counterTiming" TEXT,
    "idRequirements" TEXT,
    "advanceBooking" BOOLEAN,
    "festivalBooking" BOOLEAN,
    "source" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',

    CONSTRAINT "TempleBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineItem" (
    "id" TEXT NOT NULL,
    "templeId" TEXT NOT NULL,
    "year" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "TimelineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhyFamous" (
    "id" TEXT NOT NULL,
    "templeId" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "WhyFamous_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NearbyPlace" (
    "id" TEXT NOT NULL,
    "templeId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "distanceKm" DOUBLE PRECISION NOT NULL,
    "recommendation" TEXT,
    "priceHint" TEXT,
    "cuisine" TEXT,

    CONSTRAINT "NearbyPlace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportJob" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "recordsFound" INTEGER NOT NULL DEFAULT 0,
    "recordsAdded" INTEGER NOT NULL DEFAULT 0,
    "recordsUpdated" INTEGER NOT NULL DEFAULT 0,
    "duplicates" INTEGER NOT NULL DEFAULT 0,
    "errors" INTEGER NOT NULL DEFAULT 0,
    "summary" JSONB,

    CONSTRAINT "ImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportLog" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'info',
    "message" TEXT NOT NULL,
    "entity" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "password" TEXT NOT NULL,
    "created" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Saved" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templeId" TEXT NOT NULL,
    "savedAt" TEXT NOT NULL,

    CONSTRAINT "Saved_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "templeId" TEXT,
    "email" TEXT,
    "topic" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "created" TEXT NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Country_slug_key" ON "Country"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "State_officialCode_key" ON "State"("officialCode");

-- CreateIndex
CREATE UNIQUE INDEX "State_code_key" ON "State"("code");

-- CreateIndex
CREATE UNIQUE INDEX "State_slug_key" ON "State"("slug");

-- CreateIndex
CREATE INDEX "State_countryId_idx" ON "State"("countryId");

-- CreateIndex
CREATE INDEX "District_stateId_idx" ON "District"("stateId");

-- CreateIndex
CREATE UNIQUE INDEX "District_stateId_slug_key" ON "District"("stateId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "District_stateId_officialCode_key" ON "District"("stateId", "officialCode");

-- CreateIndex
CREATE INDEX "AdminUnit_stateId_idx" ON "AdminUnit"("stateId");

-- CreateIndex
CREATE INDEX "AdminUnit_districtId_idx" ON "AdminUnit"("districtId");

-- CreateIndex
CREATE INDEX "AdminUnit_parentId_idx" ON "AdminUnit"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUnit_districtId_slug_key" ON "AdminUnit"("districtId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUnit_districtId_officialCode_key" ON "AdminUnit"("districtId", "officialCode");

-- CreateIndex
CREATE INDEX "Locality_stateId_idx" ON "Locality"("stateId");

-- CreateIndex
CREATE INDEX "Locality_districtId_idx" ON "Locality"("districtId");

-- CreateIndex
CREATE INDEX "Locality_adminUnitId_idx" ON "Locality"("adminUnitId");

-- CreateIndex
CREATE UNIQUE INDEX "Locality_adminUnitId_slug_key" ON "Locality"("adminUnitId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Temple_identifier_key" ON "Temple"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Temple_slug_key" ON "Temple"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Temple_googlePlaceId_key" ON "Temple"("googlePlaceId");

-- CreateIndex
CREATE INDEX "Temple_stateCode_idx" ON "Temple"("stateCode");

-- CreateIndex
CREATE INDEX "Temple_districtId_idx" ON "Temple"("districtId");

-- CreateIndex
CREATE INDEX "Temple_adminUnitId_idx" ON "Temple"("adminUnitId");

-- CreateIndex
CREATE INDEX "Temple_localityId_idx" ON "Temple"("localityId");

-- CreateIndex
CREATE INDEX "Temple_mainDeity_idx" ON "Temple"("mainDeity");

-- CreateIndex
CREATE INDEX "Temple_verificationStatus_idx" ON "Temple"("verificationStatus");

-- CreateIndex
CREATE INDEX "Temple_latitude_longitude_idx" ON "Temple"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "TempleTiming_templeId_idx" ON "TempleTiming"("templeId");

-- CreateIndex
CREATE INDEX "DarshanOption_templeId_idx" ON "DarshanOption"("templeId");

-- CreateIndex
CREATE INDEX "Seva_templeId_idx" ON "Seva"("templeId");

-- CreateIndex
CREATE INDEX "Festival_templeId_idx" ON "Festival"("templeId");

-- CreateIndex
CREATE INDEX "Festival_month_day_idx" ON "Festival"("month", "day");

-- CreateIndex
CREATE INDEX "TempleBooking_templeId_idx" ON "TempleBooking"("templeId");

-- CreateIndex
CREATE INDEX "ImportJob_status_idx" ON "ImportJob"("status");

-- CreateIndex
CREATE INDEX "ImportLog_jobId_idx" ON "ImportLog"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Saved_userId_templeId_key" ON "Saved"("userId", "templeId");

-- AddForeignKey
ALTER TABLE "State" ADD CONSTRAINT "State_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminUnit" ADD CONSTRAINT "AdminUnit_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminUnit" ADD CONSTRAINT "AdminUnit_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminUnit" ADD CONSTRAINT "AdminUnit_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AdminUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Locality" ADD CONSTRAINT "Locality_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Locality" ADD CONSTRAINT "Locality_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Locality" ADD CONSTRAINT "Locality_adminUnitId_fkey" FOREIGN KEY ("adminUnitId") REFERENCES "AdminUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Temple" ADD CONSTRAINT "Temple_stateCode_fkey" FOREIGN KEY ("stateCode") REFERENCES "State"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Temple" ADD CONSTRAINT "Temple_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Temple" ADD CONSTRAINT "Temple_adminUnitId_fkey" FOREIGN KEY ("adminUnitId") REFERENCES "AdminUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Temple" ADD CONSTRAINT "Temple_localityId_fkey" FOREIGN KEY ("localityId") REFERENCES "Locality"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TempleTiming" ADD CONSTRAINT "TempleTiming_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DarshanOption" ADD CONSTRAINT "DarshanOption_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seva" ADD CONSTRAINT "Seva_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Festival" ADD CONSTRAINT "Festival_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TempleBooking" ADD CONSTRAINT "TempleBooking_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineItem" ADD CONSTRAINT "TimelineItem_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhyFamous" ADD CONSTRAINT "WhyFamous_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NearbyPlace" ADD CONSTRAINT "NearbyPlace_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportLog" ADD CONSTRAINT "ImportLog_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ImportJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saved" ADD CONSTRAINT "Saved_templeId_fkey" FOREIGN KEY ("templeId") REFERENCES "Temple"("id") ON DELETE CASCADE ON UPDATE CASCADE;
