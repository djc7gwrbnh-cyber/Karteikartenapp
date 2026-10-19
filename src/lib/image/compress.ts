// Bildverarbeitung im Browser: laden, drehen, zuschneiden, verkleinern, komprimieren.

/** Größere Fotos werden schon beim Laden verkleinert (Speicher, Canvas-Grenzen von iOS). */
const WORK_MAX_EDGE = 3200;
export const MAX_EDGE = 1600;
const QUALITY = 0.82;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function fitSize(w: number, h: number, maxEdge: number): { w: number; h: number } {
  const scale = Math.min(1, maxEdge / Math.max(w, h));
  return { w: Math.max(1, Math.round(w * scale)), h: Math.max(1, Math.round(h * scale)) };
}

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function decode(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Bild konnte nicht gelesen werden'));
    };
    img.src = url;
  });
}

/** Lädt eine Bilddatei als Arbeits-Canvas (Ausrichtung laut EXIF wird vom Browser übernommen). */
export async function loadWorkingImage(file: Blob): Promise<HTMLCanvasElement> {
  const img = await decode(file);
  const { w, h } = fitSize(img.naturalWidth, img.naturalHeight, WORK_MAX_EDGE);
  const c = canvas(w, h);
  c.getContext('2d')!.drawImage(img, 0, 0, w, h);
  return c;
}

/** Dreht um 90° im Uhrzeigersinn. */
export function rotate90(source: HTMLCanvasElement): HTMLCanvasElement {
  const c = canvas(source.height, source.width);
  const ctx = c.getContext('2d')!;
  ctx.translate(c.width, 0);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(source, 0, 0);
  return c;
}

function toBlob(c: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => c.toBlob(resolve, type, QUALITY));
}

/** Schneidet zu, verkleinert auf max. 1600 px und komprimiert (WebP wenn möglich, sonst JPEG). */
export async function cropAndCompress(source: HTMLCanvasElement, crop: Rect): Promise<{ blob: Blob; width: number; height: number }> {
  const { w, h } = fitSize(crop.w, crop.h, MAX_EDGE);
  const c = canvas(w, h);
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, crop.x, crop.y, crop.w, crop.h, 0, 0, w, h);
  let blob = await toBlob(c, 'image/webp');
  if (!blob || blob.type !== 'image/webp') blob = await toBlob(c, 'image/jpeg');
  if (!blob) throw new Error('Bild konnte nicht gespeichert werden');
  return { blob, width: w, height: h };
}

/** Begrenzt ein Zuschnitt-Rechteck auf das Bild und eine Mindestgröße. */
export function clampRect(r: Rect, maxW: number, maxH: number, min: number): Rect {
  const w = Math.min(maxW, Math.max(min, r.w));
  const h = Math.min(maxH, Math.max(min, r.h));
  const x = Math.min(maxW - w, Math.max(0, r.x));
  const y = Math.min(maxH - h, Math.max(0, r.y));
  return { x, y, w, h };
}
