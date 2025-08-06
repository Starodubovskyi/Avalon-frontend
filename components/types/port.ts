export default interface Port {
  id: string;
  port: string;
  unlocode: string;
  country: string;
  countryFlag: string;
  photo: string;
  vessels: number;
  departures: number;
  arrivals: number;
  expectedArrivals: number;
  localTime: string;
  anchorage: string;
  areaGlobal: string;
  areaLocal: string;
}
