import { GUDANG } from "@/lib/config";

export type TitikRute = {
  id: string;
  latitude: number;
  longitude: number;
};

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Jarak garis lurus antara dua koordinat (derajat) dalam kilometer. */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // radius bumi (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export type LangkahRute<T extends TitikRute> = {
  titik: T;
  urutan: number;
  jarakDariSebelumnyaKm: number;
};

/**
 * Mengurutkan titik-titik kunjungan dengan algoritma nearest-neighbor,
 * dimulai dari koordinat gudang. Lihat PRD.md bagian 5.1 dan 8.
 * Kompleksitas O(n^2), cukup untuk jumlah pesanan harian skala kecil.
 */
export function urutkanRuteNearestNeighbor<T extends TitikRute>(titikList: T[]): {
  langkah: LangkahRute<T>[];
  totalJarakKm: number;
} {
  const belumDikunjungi = [...titikList];
  let current = { latitude: GUDANG.latitude, longitude: GUDANG.longitude };
  const langkah: LangkahRute<T>[] = [];
  let totalJarakKm = 0;
  let urutan = 1;

  while (belumDikunjungi.length > 0) {
    let bestIndex = 0;
    let bestDistance = Infinity;
    for (let i = 0; i < belumDikunjungi.length; i++) {
      const distance = haversineKm(
        current.latitude,
        current.longitude,
        belumDikunjungi[i].latitude,
        belumDikunjungi[i].longitude
      );
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    }
    const [next] = belumDikunjungi.splice(bestIndex, 1);
    langkah.push({ titik: next, urutan, jarakDariSebelumnyaKm: bestDistance });
    totalJarakKm += bestDistance;
    current = { latitude: next.latitude, longitude: next.longitude };
    urutan += 1;
  }

  return { langkah, totalJarakKm };
}
