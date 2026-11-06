const MAX_EDGE = 2000;

export async function prepareOcrImage(file: Blob): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const longest = Math.max(bitmap.width, bitmap.height);
  const scale = longest > MAX_EDGE ? MAX_EDGE / longest : longest < 900 ? Math.min(2, 1400 / longest) : 1;
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    bitmap.close();
    throw new Error("canvas");
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const frame = context.getImageData(0, 0, width, height);
  const pixels = frame.data;
  for (let index = 0; index < pixels.length; index += 4) {
    const gray = pixels[index] * 0.299 + pixels[index + 1] * 0.587 + pixels[index + 2] * 0.114;
    const contrasted = Math.max(0, Math.min(255, (gray - 128) * 1.28 + 128));
    pixels[index] = contrasted;
    pixels[index + 1] = contrasted;
    pixels[index + 2] = contrasted;
  }
  context.putImageData(frame, 0, 0);
  return canvas.toDataURL("image/png");
}
