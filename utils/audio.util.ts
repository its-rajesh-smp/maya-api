import fs from "fs";
import path from "path";

export function savePcmAsWav(pcmBuffer: Buffer, filename: string) {
  const sampleRate = 16000;
  const numChannels = 1;
  const bitsPerSample = 16;

  function createWavHeader(dataLength: number) {
    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const buffer = Buffer.alloc(44);

    buffer.write("RIFF", 0);
    buffer.writeUInt32LE(36 + dataLength, 4);
    buffer.write("WAVE", 8);
    buffer.write("fmt ", 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20); // PCM
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(bitsPerSample, 34);
    buffer.write("data", 36);
    buffer.writeUInt32LE(dataLength, 40);

    return buffer;
  }

  const header = createWavHeader(pcmBuffer.length);
  const wavBuffer = Buffer.concat([header, pcmBuffer]);

  const dirPath = path.join(__dirname, "audio");
  const fullPath = path.join(dirPath, filename);

  // ✅ Make sure the audio directory exists
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(fullPath, wavBuffer);
  console.log("Saved audio to:", fullPath);
}
