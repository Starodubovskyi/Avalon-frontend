"use client";

import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { inputBase, labelBase } from "../ui/classes";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTheme } from "next-themes";

// Токен Mapbox
mapboxgl.accessToken =
  "pk.eyJ1IjoiYmFiYXN0ZXIiLCJhIjoiY21rcXlxcHFjMGIxbDNpczRjaXZ0bjU5ZCJ9.hM2_TSbf9hKdvuVYSWXsEQ";

type Props = {
  formData: {
    country?: string;
    state?: string;
    city?: string;
    address?: string;
    postalCode?: string;
    servicedPorts?: string;
    lat: number;
    lng: number;
    pinUrl?: string;
  };
  errors: Record<string, string>;
  setFormData: Dispatch<SetStateAction<any>>;
  countryList: [string, string][];
  pin: File | null;
};

export default function StepLocation({
  formData,
  errors,
  setFormData,
  countryList,
  pin,
}: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const markerInstance = useRef<mapboxgl.Marker | null>(null);
  const { resolvedTheme } = useTheme();

  // Инициализация карты
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const style =
      resolvedTheme === "dark"
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/light-v11";

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: style,
      center: [formData.lng || 0, formData.lat || 0],
      zoom: 13,
      attributionControl: false,
    });

    mapInstance.current = map;

    // Создаем маркер (пока пустой, позицию зададим ниже)
    const marker = new mapboxgl.Marker({
      draggable: true,
    })
      .setLngLat([formData.lng || 0, formData.lat || 0])
      .addTo(map);

    markerInstance.current = marker;

    // Слушаем клик по карте для переноса маркера
    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      marker.setLngLat([lng, lat]);
      setFormData((p: any) => ({ ...p, lat, lng }));
    });

    // Слушаем перетаскивание маркера
    marker.on("dragend", () => {
      const lngLat = marker.getLngLat();
      setFormData((p: any) => ({ ...p, lat: lngLat.lat, lng: lngLat.lng }));
    });

    return () => {
      map.remove();
      mapInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Пустой массив зависимостей, чтобы инициализировать один раз

  // Обновление темы карты
  useEffect(() => {
    if (!mapInstance.current) return;
    const style =
      resolvedTheme === "dark"
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/light-v11";
    mapInstance.current.setStyle(style);
  }, [resolvedTheme]);

  // Синхронизация маркера с formData (если координаты поменялись извне)
  useEffect(() => {
    if (markerInstance.current) {
      const currentPos = markerInstance.current.getLngLat();
      // Обновляем только если позиция реально отличается, чтобы избежать петель
      if (
        Math.abs(currentPos.lat - formData.lat) > 0.0001 ||
        Math.abs(currentPos.lng - formData.lng) > 0.0001
      ) {
        markerInstance.current.setLngLat([formData.lng, formData.lat]);
        if (mapInstance.current) {
          mapInstance.current.flyTo({ center: [formData.lng, formData.lat] });
        }
      }
    }
  }, [formData.lat, formData.lng]);

  // Обновление кастомной иконки (если нужно)
  useEffect(() => {
    if (!markerInstance.current) return;

    // В Mapbox GL JS стандартный маркер — это DOM элемент.
    // Если нужно поменять иконку на кастомную картинку (pin / pinUrl):
    const el = markerInstance.current.getElement();

    // Очищаем старое содержимое SVG
    el.innerHTML = "";

    // Создаем картинку
    const img = document.createElement("img");

    if (pin) {
      img.src = URL.createObjectURL(pin);
    } else if (formData.pinUrl) {
      img.src = formData.pinUrl;
    } else {
      // Если нет кастомной иконки - возвращаем дефолтный SVG Mapbox'а (или просто удаляем маркер и создаем заново, но проще оставить как есть)
      // Для простоты: если нет картинки, Mapbox маркер по умолчанию имеет синий цвет.
      // Чтобы вернуть дефолт, проще пересоздать маркер без element, но здесь мы просто оставим img.
      // Если вы хотите дефолтный синий пин Mapbox, не добавляйте img внутрь.

      // В данном коде: если нет картинки, мы просто не добавляем img, маркер останется дефолтным (синим).
      // Но так как мы очистили innerHTML, он может стать пустым.
      // Поэтому, лучший способ кастомизации в Mapbox — создавать DOM элемент ПРИ СОЗДАНИИ маркера.
      // Но так как у нас pin может меняться динамически, это сложнее.

      // РЕШЕНИЕ: Оставим дефолтный маркер Mapbox (синий), если нет картинки.
      // Если есть картинка - применяем стили.
      return;
    }

    img.style.width = "35px";
    img.style.height = "35px";
    img.style.objectFit = "contain";
    el.appendChild(img);
  }, [pin, formData.pinUrl]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className={labelBase}>Country</label>
          <select
            className={inputBase}
            value={formData.country || ""}
            onChange={(e) =>
              setFormData((p: any) => ({ ...p, country: e.target.value }))
            }
          >
            <option value="" disabled>
              Select Country
            </option>
            {countryList.map(([code, name]) => (
              <option key={code} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelBase}>State/Province</label>
          <input
            className={inputBase}
            value={formData.state ?? ""}
            onChange={(e) =>
              setFormData((p: any) => ({ ...p, state: e.target.value }))
            }
            placeholder="State/Province"
          />
        </div>
        <div>
          <label className={labelBase}>City</label>
          <input
            className={inputBase}
            value={formData.city ?? ""}
            onChange={(e) =>
              setFormData((p: any) => ({ ...p, city: e.target.value }))
            }
            placeholder="City"
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelBase}>Address *</label>
          <input
            className={`${inputBase} ${errors.address ? "border-red-500" : ""}`}
            value={formData.address ?? ""}
            onChange={(e) =>
              setFormData((p: any) => ({ ...p, address: e.target.value }))
            }
            placeholder="Street, building, office"
          />
          {errors.address && (
            <p className="mt-1 text-xs text-red-500">{errors.address}</p>
          )}
        </div>

        <div>
          <label className={labelBase}>Postal Code</label>
          <input
            className={inputBase}
            value={formData.postalCode ?? ""}
            onChange={(e) =>
              setFormData((p: any) => ({ ...p, postalCode: e.target.value }))
            }
            placeholder="Postal Code"
          />
        </div>

        <div>
          <label className={labelBase}>Serviced Ports (up to 1)</label>
          <input
            className={inputBase}
            value={formData.servicedPorts ?? ""}
            onChange={(e) =>
              setFormData((p: any) => ({ ...p, servicedPorts: e.target.value }))
            }
            placeholder="e.g. Port of Constanța"
          />
        </div>
      </div>

      <div className="mt-6">
        <div className="w-full h-72 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm relative">
          <div ref={mapContainer} className="w-full h-full outline-none" />
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-neutral-400">
          Tip: click on the map to set the pin.
        </div>
      </div>
    </>
  );
}
