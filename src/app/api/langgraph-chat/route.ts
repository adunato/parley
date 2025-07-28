import { NextRequest, NextResponse } from "next/server";
import { langGraphApp } from "@/lib/langgraph";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";

export async function POST(req: NextRequest) {
  try {
    const { chatHistory, currentInput, characterContext, storyState } = await req.json();

    const initialState = {
      chatHistory: chatHistory.map((msg: any) => {
        if (msg.type === "human") return new HumanMessage(msg.content);
        // Add other message types as needed
        return msg; // Return as is if type is not recognized
      }),
      currentInput,
      characterContext,
      storyState,
    };

    // Invoke the LangGraph application
    const finalState = await langGraphApp.invoke(initialState);

    return NextResponse.json({ response: finalState.chatHistory[finalState.chatHistory.length - 1].content });
  } catch (error) {
    console.error("Error in LangGraph chat API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
