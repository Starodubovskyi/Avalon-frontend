import Port from "@/components/types/port";

const mockPorts: Port[] = [
  {
    country: "China",
    countryFlag: "https://flagcdn.com/cn.svg",
    port: "SHANGHAI",
    unlocode: "CNSHG",
    photo: "/ports/zhangai.jpg",
    vessels: 2415,
    departures: 1409,
    arrivals: 1542,
    expectedArrivals: 939,
    localTime: "2025-08-01 08:48 UTC",
    anchorage: "CJK Anchorage",
    areaGlobal: "East Asia",
    areaLocal: "East China Sea",
  },
  {
    country: "China",
    countryFlag: "https://flagcdn.com/cn.svg",
    port: "ZHOUSHAN",
    unlocode: "CNZOS",
    photo: "/ports/zhoushan.jpg",
    vessels: 1750,
    departures: 826,
    arrivals: 783,
    expectedArrivals: 511,
    localTime: "2025-08-01 08:50 UTC",
    anchorage: "ZHOUSHAN Anchorage",
    areaGlobal: "East Asia",
    areaLocal: "Zhoushan Islands",
  },
];

export default mockPorts;
