import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useChat, type Message } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Bot, User } from "lucide-react"

// --- 1️⃣  Stable sample history ---------------------------------------------
const defaultHistory: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hello! I'm your AI assistant. How can I help you today?",
    createdAt: new Date(),
  },
  {
    id: "2",
    role: "user",
    content: "Can you help me understand how to use this chat interface?",
    createdAt: new Date(),
  },
  {
    id: "3",
    role: "assistant",
    content: "Of course! Just type in the box below and press Send (or Enter).",
    createdAt: new Date(),
  },
]
// ---------------------------------------------------------------------------

interface ChatComponentProps {
  className?: string
  title?: string
}

export default function ChatComponent({ className = "", title = "Chat Assistant" }: ChatComponentProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [debugMode, setDebugMode] = useState(true)

  const { messages, input, handleInputChange, handleSubmit, status, append } = useChat({
    id: "main-chat",
    initialMessages: defaultHistory,
    onFinish: async (message) => {
      // Add debug message after each assistant response
      if (debugMode && message.role === "assistant") {
        setTimeout(() => {
          append({
            role: "assistant",
            content: `[DEBUG] Message processed at ${new Date().toLocaleTimeString()}. Total messages: ${messages.length + 1}`,
          })
        }, 500)
      }
    },
  })

  const isLoading = status === "submitted" || status === "streaming"

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Also scroll when loading state changes
  useEffect(() => {
    if (isLoading) {
      scrollToBottom()
    }
  }, [isLoading])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim()) {
      handleSubmit(e)

      // Add debug message after user message
      if (debugMode) {
        setTimeout(() => {
          append({
            role: "assistant",
            content: `[DEBUG] User message received: "${input.trim()}" at ${new Date().toLocaleTimeString()}`,
          })
        }, 100)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (input.trim()) handleSubmit(e as any)
    }
  }

  return (
    <Card className={`flex flex-col h-[600px] ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {title}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDebugMode(!debugMode)}
            className={debugMode ? "bg-green-100 text-green-700" : ""}
          >
            Debug: {debugMode ? "ON" : "OFF"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="h-full overflow-y-auto px-4">
          <div className="space-y-4 py-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    m.role === "user"
                      ? "bg-blue-600 text-white"
                      : m.content.startsWith("[DEBUG]")
                        ? "bg-yellow-50 text-yellow-800 border border-yellow-200 font-mono text-xs"
                        : "bg-gray-100 text-gray-900 border"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                </div>

                {m.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
                <div className="bg-gray-100 text-gray-900 border rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Invisible div to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <form onSubmit={onSubmit} className="flex w-full gap-2">
          <Textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 min-h-[44px] max-h-32 resize-none"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="h-11 w-11"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
