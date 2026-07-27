import fs from "node:fs";

const OGG_CAPTURE = "OggS";
const UNKNOWN_GRANULE = 0xffffffffffffffffn;

/**
 * Reads an Ogg/Vorbis file without external binaries and returns its duration.
 * The duration is the final valid granule position divided by the Vorbis sample rate.
 */
export function readOggVorbisDuration(filePath) {
  const data = fs.readFileSync(filePath);
  let offset = 0;
  let packetParts = [];
  let firstPacket = null;
  let lastGranule = null;

  while (offset + 27 <= data.length) {
    if (data.toString("ascii", offset, offset + 4) !== OGG_CAPTURE) {
      throw new Error(`Cabecera OggS inválida en byte ${offset}`);
    }

    const version = data[offset + 4];
    if (version !== 0) throw new Error(`Versión Ogg no soportada: ${version}`);

    const granule = data.readBigUInt64LE(offset + 6);
    if (granule !== UNKNOWN_GRANULE) lastGranule = granule;

    const segmentCount = data[offset + 26];
    const tableStart = offset + 27;
    const tableEnd = tableStart + segmentCount;
    if (tableEnd > data.length) throw new Error("Tabla de segmentos Ogg truncada");

    let pageBodyLength = 0;
    for (let i = tableStart; i < tableEnd; i += 1) pageBodyLength += data[i];
    const bodyStart = tableEnd;
    const bodyEnd = bodyStart + pageBodyLength;
    if (bodyEnd > data.length) throw new Error("Página Ogg truncada");

    let cursor = bodyStart;
    for (let i = 0; i < segmentCount; i += 1) {
      const length = data[tableStart + i];
      packetParts.push(data.subarray(cursor, cursor + length));
      cursor += length;
      if (length < 255) {
        if (!firstPacket) firstPacket = Buffer.concat(packetParts);
        packetParts = [];
      }
    }

    offset = bodyEnd;
  }

  if (!firstPacket || firstPacket.length < 16) throw new Error("Cabecera Vorbis ausente o truncada");
  if (firstPacket[0] !== 1 || firstPacket.toString("ascii", 1, 7) !== "vorbis") {
    throw new Error("El primer paquete no es una cabecera de identificación Vorbis");
  }

  const sampleRate = firstPacket.readUInt32LE(12);
  if (!sampleRate) throw new Error("Frecuencia de muestreo Vorbis inválida");
  if (lastGranule === null) throw new Error("No se encontró una posición granular válida");

  const duration = Number(lastGranule) / sampleRate;
  if (!Number.isFinite(duration) || duration <= 0) throw new Error("Duración Ogg/Vorbis inválida");

  return {
    duration,
    sampleRate,
    totalSamples: lastGranule,
  };
}
