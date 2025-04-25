import { tool } from "@langchain/core/tools";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import dotenv from "dotenv";
import { getJsInterviewPrompt } from "prompts/interview/js-interview.prompt";
import { writeNoteOnOverallReport } from "utils/generate-report.util";
import { z } from "zod";

dotenv.config();

// 1. endInterview tool
const endInterview = tool(
  async (input: string) => {
    console.log("ENDING");
    return {
      success: true,
      message: input || "Interview completed normally",
    };
  },
  {
    name: "endInterview",
    description: "Call to end the interview",
    schema: z.string(),
  }
);

// 2. markQuestionAnswered tool
const markQuestionAnswered = tool(
  async ({ question, userResponse }) => {
    console.log("MARK QUESTION");
    console.log(question);
    console.log(userResponse);
    return {
      success: true,
      recordedAt: new Date().toISOString(),
    };
  },
  {
    name: "markQuestionAnswered",
    description: "Call to mark a question along with it's followup questions.",
    schema: z.object({
      question: z.string(),
      userResponse: z.string(),
    }),
  }
);

// 2. saveOverallFeedback tool
const saveOverallFeedback = tool(
  async ({ overallFeedback }) => {
    console.log("OVERALL FEEDBACK");
    console.log(overallFeedback);
    return {
      success: true,
      recordedAt: new Date().toISOString(),
    };
  },
  {
    name: "giveOverallFeedback",
    description: "Call to save the overall AI feedback after interview end.",
    schema: z.object({
      overallFeedback: z.string(),
    }),
  }
);

const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-pro",
  temperature: 0.2,
  maxRetries: 6,
  apiKey: process.env.GOOGLE_API_KEY,
  maxOutputTokens: 1000,
  cache: true,
});

const agent = createReactAgent({
  llm: model,
  tools: [endInterview, markQuestionAnswered, saveOverallFeedback],
});

const getLLM = async (messages: any = []) => {
  const result = await agent.invoke({
    messages: [...messages],
  });
  return result.messages;
};

export const generateAiResponse = async (input: string, context: any) => {
  const systemPrompt = getJsInterviewPrompt();

  const updatedContext = [
    ...(context
      ? JSON.parse(context)
      : [{ role: "system", content: systemPrompt }]),
    {
      role: "human",
      content: input,
    },
  ];

  const responseMessages = await getLLM(updatedContext);
  const lastMessage = responseMessages[responseMessages.length - 1];
  // console.log(lastMessage);
  writeNoteOnOverallReport(
    `Input Token  : ${lastMessage.response_metadata.tokenUsage.promptTokens}, Output Token : ${lastMessage.response_metadata.tokenUsage.completionTokens}`
  );
  return {
    content: lastMessage.content,
    updatedContext: JSON.stringify(responseMessages),
  };
};
