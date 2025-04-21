import SocketController from "@controllers/socket.controller";
import { tool } from "@langchain/core/tools";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import dotenv from "dotenv";
import { getJsInterviewPrompt } from "prompts/interview/js-interview.prompt";
import { z } from "zod";

dotenv.config();

const endInterview = tool(
  async () => {
    SocketController.getSocket()?.emit("interview-over");
    return { status: true, message: "Interview is over." };
  },
  {
    name: "endInterview",
    description: "Call to end the interview.",
  }
);

const markQuestionAnswered = tool(
  async ({ question, userResponse }) => {
    console.log("Marking question as answered...........");
    return JSON.stringify({ question, userResponse });
  },
  {
    name: "markQuestionAnswered",
    description: "Call to mark a question as asked by AI and answered by user.",
    schema: z.object({
      question: z.string().describe("The question that was asked by AI"),
      userResponse: z
        .string()
        .describe("The answer to the question given by the user"),
    }),
    responseFormat: "json",
  }
);

const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  temperature: 0.0,
  maxRetries: 2,
  apiKey: process.env.GOOGLE_API_KEY,
});

const agent = createReactAgent({
  llm: model,
  tools: [endInterview, markQuestionAnswered],
});

const getLLM = async (messages: any = []) => {
  const systemPrompt = getJsInterviewPrompt();
  const result = await agent.invoke({
    messages: [{ role: "system", content: systemPrompt }, ...messages],
  });
  return result.messages;
};

export const generateAiResponse = async (
  input: string,
  context: { role: string; content: string }[]
) => {
  const updatedContext = [...context, { role: "user", content: input }];
  const responseMessages = await getLLM(updatedContext);

  const lastMessage = responseMessages[responseMessages.length - 1];
  console.log(lastMessage.content);

  return {
    content: lastMessage.content,
    updatedContext: [
      ...updatedContext,
      { role: "ai", content: lastMessage.content },
    ],
  };
};
