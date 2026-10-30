export const CATALOG_LAYER_KINDS = ["company", "vessel", "port"] as const;

export type CatalogLayerKind = (typeof CATALOG_LAYER_KINDS)[number];

export type MapLayerKind = "person" | CatalogLayerKind;

export type MapLayerFeatureProperties = {
  kind: MapLayerKind;
  title: string;
  subtitle: string | null;
  href?: string;
};

export type GeoJsonPointFeature = {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: MapLayerFeatureProperties;
};

export type GeoJsonFeatureCollection = {
  type: "FeatureCollection";
  features: GeoJsonPointFeature[];
};

export type MapLayersResponse = Partial<
  Record<CatalogLayerKind, GeoJsonFeatureCollection>
>;

export type KindVisibility = Record<MapLayerKind, boolean>;

export const DEFAULT_KIND_VISIBILITY: KindVisibility = {
  person: true,
  company: true,
  vessel: true,
  port: true,
};
