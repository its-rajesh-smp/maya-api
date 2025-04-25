import { generateAiResponse } from "@services/ai.service";
import {
  generateSpeechToText,
  generateTextToSpeech,
} from "@services/google.service";
import { Socket } from "socket.io";
import { generateConversationTranscript } from "utils/generateContextFromMessages.util";

class SocketController {
  socket: Socket;
  static gSocket: Socket;

  constructor(_socket: Socket) {
    this.socket = _socket;
  }

  initialize() {
    this.socket.on("start", this.onStart);
    this.socket.on("userAudioInput", this.onUserAudioInput);
    this.socket.on("userTextInput", this.onTextMessage);
  }

  static getSocket() {
    return SocketController.gSocket;
  }

  onStart = async (data: any) => {
    const { context } = data;
    this.socket.emit("status", "ai-thinking");
    const { content, updatedContext } = await generateAiResponse(
      "Hello",
      context
    );
    this.socket.emit("save-context", updatedContext);

    // Get the audio stream
    const audioStream = await generateTextToSpeech(content.toString());

    // Pipe the stream to the client
    audioStream.on("data", (chunk) => {
      this.socket.emit("status", "ai-speaking");
      this.socket.emit("voice-chunk", chunk);
    });
  };

  onUserAudioInput = async (userInput: Buffer, data: any) => {
    const { context } = data;
    this.socket.emit("status", "ai-thinking");
    const text = await generateSpeechToText(userInput);

    if (!text) {
      return;
    }
    const { content, updatedContext } = await generateAiResponse(text, context);
    this.socket.emit("save-context", updatedContext);

    // Get the audio stream
    const audioStream = await generateTextToSpeech(content.toString());

    // Pipe the stream to the client
    audioStream.on("data", (chunk) => {
      this.socket.emit("status", "ai-speaking");
      this.socket.emit("voice-chunk", chunk);
    });
  };

  onTextMessage = async (data: any) => {
    const { context, message } = data;
    generateConversationTranscript(JSON.parse(context));
  };
}

export default SocketController;
