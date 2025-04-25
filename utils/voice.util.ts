import emojiRegex from "emoji-regex";

export const formatTextForVoiceConversion = (text: string) => {
  const regex = emojiRegex();
  return text
    .replace(regex, "") // Remove emojis
    .replace(/[`\*]/g, "") // Remove backticks and asterisks
    .replace(/\s*\n\s*/g, " ") // Remove line breaks and trim surrounding whitespace
    .replace(/\s+/g, " ") // Normalize multiple spaces to a single space
    .trim(); // Trim any leading/trailing space
};
