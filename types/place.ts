// 資料來源 https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places?hl=zh-tw#resource:-place
// 此型別用網頁提供的md以AI建立

// Google Places API (New) v1 - Place Resource Types

export interface LocalizedText {
  text?: string;
  languageCode?: string;
}

export interface PostalAddress {
  revision?: number;
  regionCode?: string;
  languageCode?: string;
  postalCode?: string;
  sortingCode?: string;
  administrativeArea?: string;
  locality?: string;
  sublocality?: string;
  addressLines?: string[];
  recipients?: string[];
  organization?: string;
}

export interface AddressComponent {
  longText?: string;
  shortText?: string;
  types?: string[];
  languageCode?: string;
}

export interface PlusCode {
  globalCode?: string;
  compoundCode?: string;
}

export interface LatLng {
  latitude?: number;
  longitude?: number;
}

export interface Viewport {
  low?: LatLng;
  high?: LatLng;
}

export interface AuthorAttribution {
  displayName?: string;
  uri?: string;
  photoUri?: string;
}

export interface PlaceDate {
  year?: number;
  month?: number;
  day?: number;
}

export interface Review {
  name?: string;
  relativePublishTimeDescription?: string;
  text?: LocalizedText;
  originalText?: LocalizedText;
  rating?: number;
  authorAttribution?: AuthorAttribution;
  publishTime?: string;
  flagContentUri?: string;
  googleMapsUri?: string;
  visitDate?: PlaceDate;
}

export interface Point {
  date?: PlaceDate;
  truncated?: boolean;
  day?: number;
  hour?: number;
  minute?: number;
}

export interface Period {
  open?: Point;
  close?: Point;
}

export type SecondaryHoursType =
  | "SECONDARY_HOURS_TYPE_UNSPECIFIED"
  | "DRIVE_THROUGH"
  | "HAPPY_HOUR"
  | "DELIVERY"
  | "TAKEOUT"
  | "KITCHEN"
  | "BREAKFAST"
  | "LUNCH"
  | "DINNER"
  | "BRUNCH"
  | "PICKUP"
  | "ACCESS"
  | "SENIOR_HOURS"
  | "ONLINE_SERVICE_HOURS";

export interface SpecialDay {
  date?: PlaceDate;
}

export interface OpeningHours {
  periods?: Period[];
  weekdayDescriptions?: string[];
  secondaryHoursType?: SecondaryHoursType;
  specialDays?: SpecialDay[];
  nextOpenTime?: string;
  nextCloseTime?: string;
  openNow?: boolean;
}

export interface TimeZone {
  id?: string;
  version?: string;
}

export interface Photo {
  name?: string;
  widthPx?: number;
  heightPx?: number;
  authorAttributions?: AuthorAttribution[];
  flagContentUri?: string;
  googleMapsUri?: string;
}

export type BusinessStatus =
  | "BUSINESS_STATUS_UNSPECIFIED"
  | "OPERATIONAL"
  | "CLOSED_TEMPORARILY"
  | "CLOSED_PERMANENTLY";

export type PriceLevel =
  | "PRICE_LEVEL_UNSPECIFIED"
  | "PRICE_LEVEL_FREE"
  | "PRICE_LEVEL_INEXPENSIVE"
  | "PRICE_LEVEL_MODERATE"
  | "PRICE_LEVEL_EXPENSIVE"
  | "PRICE_LEVEL_VERY_EXPENSIVE";

export interface Attribution {
  provider?: string;
  providerUri?: string;
}

export interface PaymentOptions {
  acceptsCreditCards?: boolean;
  acceptsDebitCards?: boolean;
  acceptsCashOnly?: boolean;
  acceptsNfc?: boolean;
}

export interface ParkingOptions {
  freeParkingLot?: boolean;
  paidParkingLot?: boolean;
  freeStreetParking?: boolean;
  paidStreetParking?: boolean;
  valetParking?: boolean;
  freeGarageParking?: boolean;
  paidGarageParking?: boolean;
}

export interface SubDestination {
  name?: string;
  id?: string;
}

export interface AccessibilityOptions {
  wheelchairAccessibleParking?: boolean;
  wheelchairAccessibleEntrance?: boolean;
  wheelchairAccessibleRestroom?: boolean;
  wheelchairAccessibleSeating?: boolean;
}

export interface Money {
  currencyCode?: string;
  units?: string;
  nanos?: number;
}

export type FuelType =
  | "FUEL_TYPE_UNSPECIFIED"
  | "DIESEL"
  | "DIESEL_PLUS"
  | "REGULAR_UNLEADED"
  | "MIDGRADE"
  | "PREMIUM"
  | "SP91"
  | "SP91_E10"
  | "SP92"
  | "SP95"
  | "SP95_E10"
  | "SP98"
  | "SP99"
  | "SP100"
  | "LPG"
  | "E80"
  | "E85"
  | "E100"
  | "METHANE"
  | "BIO_DIESEL"
  | "TRUCK_DIESEL";

export interface FuelPrice {
  type?: FuelType;
  price?: Money;
  updateTime?: string;
}

export interface FuelOptions {
  fuelPrices?: FuelPrice[];
}

export type EVConnectorType =
  | "EV_CONNECTOR_TYPE_UNSPECIFIED"
  | "EV_CONNECTOR_TYPE_OTHER"
  | "EV_CONNECTOR_TYPE_J1772"
  | "EV_CONNECTOR_TYPE_TYPE_2"
  | "EV_CONNECTOR_TYPE_CHADEMO"
  | "EV_CONNECTOR_TYPE_CCS_COMBO_1"
  | "EV_CONNECTOR_TYPE_CCS_COMBO_2"
  | "EV_CONNECTOR_TYPE_TESLA"
  | "EV_CONNECTOR_TYPE_UNSPECIFIED_GB_T"
  | "EV_CONNECTOR_TYPE_UNSPECIFIED_WALL_OUTLET"
  | "EV_CONNECTOR_TYPE_NACS";

export interface ConnectorAggregation {
  type?: EVConnectorType;
  maxChargeRateKw?: number;
  count?: number;
  availabilityLastUpdateTime?: string;
  availableCount?: number;
  outOfServiceCount?: number;
}

export interface EVChargeOptions {
  connectorCount?: number;
  connectorAggregation?: ConnectorAggregation[];
}

export interface GenerativeSummary {
  overview?: LocalizedText;
  overviewFlagContentUri?: string;
  disclosureText?: LocalizedText;
}

export interface ContainingPlace {
  name?: string;
  id?: string;
}

export type SpatialRelationship =
  | "NEAR"
  | "WITHIN"
  | "BESIDE"
  | "ACROSS_THE_ROAD"
  | "DOWN_THE_ROAD"
  | "AROUND_THE_CORNER"
  | "BEHIND";

export interface Landmark {
  name?: string;
  placeId?: string;
  displayName?: LocalizedText;
  types?: string[];
  spatialRelationship?: SpatialRelationship;
  straightLineDistanceMeters?: number;
  travelDistanceMeters?: number;
}

export type Containment =
  | "CONTAINMENT_UNSPECIFIED"
  | "WITHIN"
  | "OUTSKIRTS"
  | "NEAR";

export interface Area {
  name?: string;
  placeId?: string;
  displayName?: LocalizedText;
  containment?: Containment;
}

export interface AddressDescriptor {
  landmarks?: Landmark[];
  areas?: Area[];
}

export interface GoogleMapsLinks {
  directionsUri?: string;
  placeUri?: string;
  writeAReviewUri?: string;
  reviewsUri?: string;
  photosUri?: string;
}

export interface PriceRange {
  startPrice?: Money;
  endPrice?: Money;
}

export interface ReviewSummary {
  text?: LocalizedText;
  flagContentUri?: string;
  disclosureText?: LocalizedText;
  reviewsUri?: string;
}

export interface ContentBlock {
  content?: LocalizedText;
  referencedPlaces?: string[];
}

export interface EvChargeAmenitySummary {
  overview?: ContentBlock;
  coffee?: ContentBlock;
  restaurant?: ContentBlock;
  store?: ContentBlock;
  flagContentUri?: string;
  disclosureText?: LocalizedText;
}

export interface NeighborhoodSummary {
  overview?: ContentBlock;
  description?: ContentBlock;
  flagContentUri?: string;
  disclosureText?: LocalizedText;
}

export interface Link {
  title?: string;
  uri?: string;
}

export interface Details {
  title?: string;
  description?: string;
  aboutLink?: Link;
}

export interface ConsumerAlert {
  overview?: string;
  details?: Details;
  languageCode?: string;
}

export interface Place {
  name?: string;
  id?: string;
  displayName?: LocalizedText;
  types?: string[];
  primaryType?: string;
  primaryTypeDisplayName?: LocalizedText;
  googleMapsTypeLabel?: LocalizedText;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  formattedAddress?: string;
  shortFormattedAddress?: string;
  postalAddress?: PostalAddress;
  addressComponents?: AddressComponent[];
  plusCode?: PlusCode;
  location?: LatLng;
  viewport?: Viewport;
  rating?: number;
  googleMapsUri?: string;
  websiteUri?: string;
  reviews?: Review[];
  regularOpeningHours?: OpeningHours;
  timeZone?: TimeZone;
  photos?: Photo[];
  adrFormatAddress?: string;
  businessStatus?: BusinessStatus;
  priceLevel?: PriceLevel;
  attributions?: Attribution[];
  iconMaskBaseUri?: string;
  iconBackgroundColor?: string;
  currentOpeningHours?: OpeningHours;
  currentSecondaryOpeningHours?: OpeningHours[];
  regularSecondaryOpeningHours?: OpeningHours[];
  editorialSummary?: LocalizedText;
  paymentOptions?: PaymentOptions;
  parkingOptions?: ParkingOptions;
  subDestinations?: SubDestination[];
  fuelOptions?: FuelOptions;
  evChargeOptions?: EVChargeOptions;
  generativeSummary?: GenerativeSummary;
  containingPlaces?: ContainingPlace[];
  addressDescriptor?: AddressDescriptor;
  googleMapsLinks?: GoogleMapsLinks;
  priceRange?: PriceRange;
  reviewSummary?: ReviewSummary;
  evChargeAmenitySummary?: EvChargeAmenitySummary;
  neighborhoodSummary?: NeighborhoodSummary;
  consumerAlert?: ConsumerAlert;
  movedPlace?: string;
  movedPlaceId?: string;
  utcOffsetMinutes?: number;
  userRatingCount?: number;
  takeout?: boolean;
  delivery?: boolean;
  dineIn?: boolean;
  curbsidePickup?: boolean;
  reservable?: boolean;
  servesBreakfast?: boolean;
  servesLunch?: boolean;
  servesDinner?: boolean;
  servesBeer?: boolean;
  servesWine?: boolean;
  servesBrunch?: boolean;
  servesVegetarianFood?: boolean;
  outdoorSeating?: boolean;
  liveMusic?: boolean;
  menuForChildren?: boolean;
  servesCocktails?: boolean;
  servesDessert?: boolean;
  servesCoffee?: boolean;
  goodForChildren?: boolean;
  allowsDogs?: boolean;
  restroom?: boolean;
  goodForGroups?: boolean;
  goodForWatchingSports?: boolean;
  accessibilityOptions?: AccessibilityOptions;
  pureServiceAreaBusiness?: boolean;
}
