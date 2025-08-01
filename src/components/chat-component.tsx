import type React from "react"
import { useEffect, useRef } from "react"
import { useDebouncedCallback } from "use-debounce"
import { useChat, type Message } from "@ai-sdk/react"
import { useParleyStore} from "@/lib/store";
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Bot, User } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {Relationship} from "@/lib/types";
import { useEntityStore } from "@/lib/entityStore";

interface ChatComponentProps {
  className?: string
  title?: string
  chatSessionId: number;
  relationship?: Relationship;
  onMessageFinish?: (message: Message, fullMessages: Message[]) => void;
}

export default function ChatComponent({ className = "", title = "Chat Assistant", chatSessionId, relationship, onMessageFinish }: ChatComponentProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { chatMessages, setChatMessages, chatInput, setChatInput, worldDescription, aiStyle, chatModel } = useParleyStore();
  const { selectedChatCharacter, selectedChatPersona} = useEntityStore();
  const messagesRef = useRef<Message[]>([]);

  const debounceMessages = useDebouncedCallback(
    (messages: Message[]) => setChatMessages(messages),
    300
  );
  const debounceInput = useDebouncedCallback(
    (input: string) => setChatInput(input),
    300
  );

  // Clean up debounce callbacks on unmount
  useEffect(() => {
    return () => {
      debounceMessages.cancel();
      debounceInput.cancel();
    };
  }, [debounceMessages, debounceInput]);

  const { messages, input, handleInputChange, handleSubmit, status, setMessages, setInput } = useChat({
    id: (selectedChatCharacter && selectedChatPersona) ? `main-chat-${chatSessionId}` : undefined,
    body: {
      character: selectedChatCharacter,
      persona: selectedChatPersona,
      relationship: relationship,
      worldDescription: worldDescription,
      aiStyle: aiStyle,
      chatModel: chatModel,
    },
    initialMessages: chatMessages,
    initialInput: chatInput,
    onFinish: (message) => {
      if (onMessageFinish) {
        const fullHistory = [...messagesRef.current]; // Manual append
        onMessageFinish(message, fullHistory);
      }
    },
  });

  useEffect(() => {
    messagesRef.current = messages;
    debounceMessages(messages);
  }, [messages, debounceMessages]);

  useEffect(() => {
    debounceInput(input);
  }, [input, debounceInput]);

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
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (input.trim()) handleSubmit(e as any)
    }
  }

  return (
    <Card className={`flex flex-col h-[600px] w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {selectedChatCharacter ? (
              <Avatar className="h-16 w-16">
                <AvatarImage src={selectedChatCharacter.basicInfo.avatar} alt={selectedChatCharacter.basicInfo.name} />
                <AvatarFallback>{selectedChatCharacter.basicInfo.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ) : (
              <Bot className="h-5 w-5" />
            )}
            {selectedChatCharacter ? selectedChatCharacter.basicInfo.name : title}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="h-full overflow-y-auto px-4">
          <div className="space-y-4 py-4">
            {messages.map((m) => {
              return (
              <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && selectedChatCharacter ? (
                  <Avatar className="flex-shrink-0 h-8 w-8">
                    <AvatarImage src={selectedChatCharacter.basicInfo.avatar} alt={selectedChatCharacter.basicInfo.name} />
                    <AvatarFallback>{selectedChatCharacter.basicInfo.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ) : m.role === "assistant" ? (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                ) : null}

                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    m.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900 border"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                </div>
                </div>

                {m.role === "user" && selectedChatPersona ? (
                  <Avatar className="flex-shrink-0 h-8 w-8">
                    <AvatarImage src={selectedChatPersona.basicInfo.avatar} alt={selectedChatPersona.basicInfo.name} />
                    <AvatarFallback>{selectedChatPersona.basicInfo.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ) : m.role === "user" ? (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                ) : null}
              </div>
            )})}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                {selectedChatCharacter ? (
                  <Avatar className="flex-shrink-0 h-8 w-8">
                    <AvatarImage src={selectedChatCharacter.basicInfo.avatar} alt={selectedChatCharacter.basicInfo.name} />
                    <AvatarFallback>{selectedChatCharacter.basicInfo.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                )}
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
