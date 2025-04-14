import textToSpeech from "@google-cloud/text-to-speech";
import speechToText from "@google-cloud/speech";

export const generateTextToSpeech = async (text: string) => {
  const ttsClient = new textToSpeech.v1.TextToSpeechClient();
  const [response] = await ttsClient.synthesizeSpeech({
    input: { text },
    voice: {
      languageCode: "hi-IN",
      name: "hi-IN-Chirp3-HD-Aoede",
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
  const speechClient = new speechToText.v1.SpeechClient();

  const response = await speechClient.recognize({
    audio: { content: audio },
    config: {
      encoding: "LINEAR16",
      sampleRateHertz: 16000,
      languageCode: "en-US",
      enableAutomaticPunctuation: true,
      model: "latest_long",
      alternativeLanguageCodes: ["hi-IN"],
      useEnhanced: true,
    },
  });

  const result =
    response[0]?.results?.[0]?.alternatives?.[0]?.transcript ?? null;
  console.log(result);
  return result;
};
