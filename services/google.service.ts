import speechToText from "@google-cloud/speech";
import textToSpeech from "@google-cloud/text-to-speech";
import { savePcmAsWav } from "utils/audio.util";

export const generateTextToSpeech = async (text: string) => {
  const ttsClient = new textToSpeech.v1.TextToSpeechClient();
  const [response] = await ttsClient.synthesizeSpeech({
    input: { text },
    voice: {
      languageCode: "en-US",
      name: "en-US-Chirp3-HD-Achernar",
    },
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate: 1.0,
      effectsProfileId: ["headphone-class-device"],
      pitch: 0.0,
    },
  });
  return response.audioContent;
};

export const generateSpeechToText = async (audio: Buffer) => {
  savePcmAsWav(audio, "test.wav");
  const speechClient = new speechToText.v1.SpeechClient();

  const response = await speechClient.recognize({
    audio: { content: audio },
    config: {
      encoding: "LINEAR16",
      sampleRateHertz: 16000,
      languageCode: "en-US",
      enableAutomaticPunctuation: true,
      alternativeLanguageCodes: [],
      useEnhanced: true,
    },
  });
  const result =
    response[0]?.results?.[0]?.alternatives?.[0]?.transcript ?? null;
  console.log(result);
  return result;
};
