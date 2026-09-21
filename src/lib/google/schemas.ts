import { z } from "zod";

const textSchema = z.object({ text: z.string() }).catchall(z.unknown()).nullable().optional();

const locationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

const openingHoursSchema = z.object({
  openNow: z.boolean().nullable().optional(),
  weekdayDescriptions: z.array(z.string()).optional(),
});

const photoSchema = z.object({
  name: z.string(),
  heightPx: z.number().int().optional(),
  widthPx: z.number().int().optional(),
});

export const placeSchema = z.object({
  id: z.string(),
  displayName: textSchema,
  formattedAddress: z.string().optional(),
  location: locationSchema.optional(),
  primaryType: z.string().optional(),
  types: z.array(z.string()).optional(),
  googleMapsUri: z.string().optional(),
  businessStatus: z.enum(["OPERATIONAL", "CLOSED_TEMPORARILY", "CLOSED_PERMANENTLY"]).optional(),
  regularOpeningHours: openingHoursSchema.optional(),
  photos: z.array(photoSchema).optional(),
  rating: z.number().optional(),
  userRatingCount: z.number().optional(),
  shortFormattedAddress: z.string().optional(),
  plusCode: z.object({ globalCode: z.string() }).optional(),
});

export const searchResponseSchema = z.object({
  places: z.array(placeSchema).optional(),
  nextPageToken: z.string().optional(),
});

export const placeDetailsResponseSchema = z.object({
  place: placeSchema.optional(),
});

const placePredictionSchema = z.object({
  placeId: z.string(),
  text: textSchema,
  types: z.array(z.string()).optional(),
});

const queryPredictionSchema = z.object({
  text: textSchema,
});

export const autocompleteResponseSchema = z.object({
  suggestions: z
    .array(
      z.object({
        placePrediction: placePredictionSchema.optional(),
        queryPrediction: queryPredictionSchema.optional(),
      })
    )
    .optional(),
});

export type TextSearchResult = z.infer<typeof searchResponseSchema>;
export type PlaceDetailsResult = z.infer<typeof placeDetailsResponseSchema>;
export type AutocompleteResult = z.infer<typeof autocompleteResponseSchema>;