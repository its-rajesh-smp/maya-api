import { SpeechClient } from "@google-cloud/speech";
import textToSpeech from "@google-cloud/text-to-speech";
import * as stream from "stream";
import { writeNoteOnOverallReport } from "utils/generate-report.util";
import { formatTextForVoiceConversion } from "utils/voice.util";

export const generateTextToSpeech = async (text: string) => {
  const ttsClient = new textToSpeech.v1.TextToSpeechClient();
  const formattedText: string = formatTextForVoiceConversion(text);

  // Create a passthrough stream
  const audioStream = new stream.PassThrough();

  // Start the synthesis
  const request = {
    input: { text: formattedText },
    voice: {
      languageCode: "hi-IN",
      name: "hi-IN-Chirp3-HD-Puck",
    },
    audioConfig: {
      audioEncoding: "MP3" as const,
      speakingRate: 1.0,
      effectsProfileId: ["headphone-class-device"],
      pitch: 0.0,
    },
  };

  // For streaming, you might need to use a different approach
  const [response] = await ttsClient.synthesizeSpeech(request);
  audioStream.end(response.audioContent);

  writeNoteOnOverallReport(`Text To Speech Bill: ${text.length} characters`);
  return audioStream;
};

export const generateSpeechToText = async (audio: Buffer) => {
  const speechClient = new SpeechClient();

  const recognizeStream = speechClient.streamingRecognize({
    config: {
      encoding: "LINEAR16",
      sampleRateHertz: 16000,
      languageCode: "en-US",
      alternativeLanguageCodes: [],
      enableAutomaticPunctuation: true,
      useEnhanced: true,
    },
    interimResults: false, // final results only
  });

  return new Promise<string>((resolve, reject) => {
    let finalTranscript = "";

    recognizeStream.on("data", (data) => {
      writeNoteOnOverallReport(
        `Speech To Text Bill : ${data?.totalBilledTime?.seconds} second`
      );
      const transcript = data.results?.[0]?.alternatives?.[0]?.transcript;
      if (transcript) {
        finalTranscript += transcript + " ";
      }
    });

    recognizeStream.on("end", () => {
      console.log(finalTranscript);
      resolve(finalTranscript.trim());
    });
    recognizeStream.on("error", (err) => reject(err));

    // Pipe your audio buffer into the stream
    const audioStream = new stream.PassThrough();
    audioStream.end(audio); // send the buffer
    audioStream.pipe(recognizeStream);
  });
};
