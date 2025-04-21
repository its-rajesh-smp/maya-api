import fs from "fs";
import path from "path";

export const getJsInterviewPrompt = () => {
  return fs.readFileSync(
    path.join(__dirname, "./js-interview.prompt.txt"),
    "utf-8"
  );
};
