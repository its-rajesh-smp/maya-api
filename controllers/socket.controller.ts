import { generateAiResponse } from "@services/ai.service";
import {
  generateSpeechToText,
  generateTextToSpeech,
} from "@services/google.service";
import { Socket } from "socket.io";

class SocketController {
  socket: Socket;

  constructor(_socket: Socket) {
    this.socket = _socket;
  }

  initialize() {
    this.socket.on("start", this.onStart);
    this.socket.on("userAudioInput", this.onUserAudioInput);
  }

  onStart = async (data: any) => {
    const { context } = data;
    this.socket.emit("status", "thinking");
    const { content, updatedContext } = await generateAiResponse(
      "Hello",
      context
    );
    this.socket.emit("save-context", updatedContext);
    const audio = await generateTextToSpeech(content.toString());
    this.socket.emit("voice", audio);
  };

  onUserAudioInput = async (userInput: Buffer, data: any) => {
    const { context } = data;
    this.socket.emit("status", "thinking");
    const text = await generateSpeechToText(userInput);
    if (!text) {
      return;
    }
    const { content, updatedContext } = await generateAiResponse(text, context);
    this.socket.emit("save-context", updatedContext);
    const audio = await generateTextToSpeech(content.toString());
    this.socket.emit("voice", audio);
  };
}

export default SocketController;
