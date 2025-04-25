import { writeNoteOnOverallReport } from "./generate-report.util";

export function generateConversationTranscript(conversationLog: any[]) {
  writeNoteOnOverallReport("");
  writeNoteOnOverallReport("");
  writeNoteOnOverallReport("");
  writeNoteOnOverallReport("");
  writeNoteOnOverallReport("");
  writeNoteOnOverallReport("CONVERSATION TRANSCRIPT");

  conversationLog.forEach((entry) => {
    const messageType = entry.id[2]; // "HumanMessage", "AIMessage", etc.
    const role = messageType.toLowerCase().replace("message", ""); // "human", "ai"
    let content = entry.kwargs.content;

    // Handle non-string content (e.g., tool calls)
    if (typeof content !== "string") {
      content = JSON.stringify(content); // or skip with `continue`
    }

    // Skip system/tool messages if needed
    if (role === "system" || role === "tool") return;

    writeNoteOnOverallReport(`${role.toUpperCase()} --> ${content}`);
  });
}
