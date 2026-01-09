import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { useChat, type Message } from "@ai-sdk/react"
import { useParleyStore } from "@/lib/store";
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Bot, User } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Relationship } from "@/lib/types";
import { useEntityStore } from "@/lib/entityStore";

interface ChatComponentProps {
  className?: string
  title?: string
  chatSessionId: number;
  relationship?: Relationship;
}

export default function ChatComponent({ className = "", title = "Chat Assistant", chatSessionId, relationship }: ChatComponentProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { chatMessages, setChatMessages, chatInput, setChatInput, worldDescription, aiStyle, chatModel, systemPromptTemplate } = useParleyStore();
  const { selectedChatCharacter, selectedChatPersona, selectedChatLocation } = useEntityStore();
  const messagesRef = useRef<Message[]>([]);

  // Local state for 'Actor' functionality
  const [isAssessing, setIsAssessing] = useState(false);
  const [internalRelationship, setInternalRelationship] = useState<Relationship | undefined>(relationship);

  // Sync internal relationship when prop changes or auto-initialize if missing
  useEffect(() => {
    if (relationship) {
      setInternalRelationship(relationship);
    } else if (selectedChatCharacter && selectedChatPersona) {
      // Check if relationship exists in the character object (it might have been updated elsewhere)
      const existingRel = selectedChatCharacter.relationships.find(
        r => r.characterId === selectedChatCharacter.id && r.personaId === selectedChatPersona.id
      );

      if (existingRel) {
        setInternalRelationship(existingRel);
      } else {
        // Auto-create default relationship
        console.log("Relationship missing - creating default 'Unknown' relationship");
        const defaultRelationship: Relationship = {
          characterId: selectedChatCharacter.id,
          personaId: selectedChatPersona.id,
          satisfaction: 50,
          commitment: 50,
          intimacy: 50,
          trust: 50,
          passion: 50,
          description: `The Character does not know the Persona.`,
          chat_summaries: []
        };

        setInternalRelationship(defaultRelationship);

        // Update the character in the global store to persist this new relationship
        // We need to fetch the fresh character to avoid overwriting other changes
        // But for this component's scope, we dispatch the update.
        // NOTE: In a real app we might want an API call here, but store update works for client-side persistence in session
        const updatedCharacter = {
          ...selectedChatCharacter,
          relationships: [...selectedChatCharacter.relationships, defaultRelationship]
        };
        useEntityStore.getState().updateCharacter(updatedCharacter);
      }
    }
  }, [relationship, selectedChatCharacter, selectedChatPersona]);

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

  const { messages, input, handleInputChange, handleSubmit, status, setMessages, setInput, stop } = useChat({
    id: (selectedChatCharacter && selectedChatPersona) ? `main-chat-${chatSessionId}` : undefined,
    body: {
      character: selectedChatCharacter,
      persona: selectedChatPersona,
      relationship: internalRelationship,
      worldDescription: worldDescription,
      aiStyle: aiStyle,
      chatModel: chatModel,
      systemPromptTemplate: systemPromptTemplate,
      locationDescription: selectedChatLocation?.description
    },
    initialMessages: chatMessages,
    initialInput: chatInput,
  });

  // Emergency Brake Monitoring
  useEffect(() => {
    // Check if the stream or message list has an assessment trigger
    const monitorAssessment = () => {
      // Only check the latest message from assistant
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || lastMessage.role !== 'assistant') return;

      const hasTrigger = lastMessage.content.includes('[EVENT: TRIGGER_ASSESSMENT]');

      if (hasTrigger) {
        if (status === 'streaming') {
          stop(); // Stop generation immediately
        }
        // Trigger assessment if not already assessing
        if (!isAssessing) {
          handleEmergencyAssessment();
        }
      }
    };

    monitorAssessment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, status]);

  const handleEmergencyAssessment = async () => {
    // Double check to prevent multiple calls
    if (isAssessing || !selectedChatCharacter || !selectedChatPersona || !internalRelationship) return;

    setIsAssessing(true);

    try {
      const response = await fetch('/api/engine/process-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatHistory: messages,
          character: selectedChatCharacter,
          persona: selectedChatPersona,
          currentRelationship: internalRelationship,
          modelName: chatModel
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.delta) {
          const newRel = {
            ...internalRelationship,
            satisfaction: Math.max(0, Math.min(100, internalRelationship.satisfaction + (data.delta.satisfaction || 0))),
            commitment: Math.max(0, Math.min(100, internalRelationship.commitment + (data.delta.commitment || 0))),
            intimacy: Math.max(0, Math.min(100, internalRelationship.intimacy + (data.delta.intimacy || 0))),
            trust: Math.max(0, Math.min(100, internalRelationship.trust + (data.delta.trust || 0))),
            passion: Math.max(0, Math.min(100, internalRelationship.passion + (data.delta.passion || 0))),
          };
          setInternalRelationship(newRel);
        }
      }
    } catch (e) {
      console.error("Emergency Assessment Failed", e);
    } finally {
      setIsAssessing(false);
    }
  };

  useEffect(() => {
    messagesRef.current = messages;
    debounceMessages(messages);
  }, [messages, debounceMessages]);

  useEffect(() => {
    debounceInput(input);
  }, [input, debounceInput]);

  const isLoading = status === "submitted" || status === "streaming" || isAssessing

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
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 type-h4">
            {selectedChatCharacter ? (
              <Avatar className="h-10 w-10 border border-border shadow-sm">
                <AvatarImage src={selectedChatCharacter.basicInfo.avatar} alt={selectedChatCharacter.basicInfo.name} />
                <AvatarFallback className="bg-muted text-muted-foreground">{selectedChatCharacter.basicInfo.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
            )}
            {selectedChatCharacter ? selectedChatCharacter.basicInfo.name : title}
          </CardTitle>
          {isAssessing && (
            <span className="type-ui-label text-amber-600 animate-pulse flex items-center">
              ⚠ Assessing Behavior...
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden bg-background/50">
        <div className="h-full overflow-y-auto px-4">
          <div className="space-y-4 py-4">
            {messages.map((m) => {
              return (
                <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && selectedChatCharacter ? (
                    <Avatar className="flex-shrink-0 h-8 w-8 border border-border shadow-sm">
                      <AvatarImage src={selectedChatCharacter.basicInfo.avatar} alt={selectedChatCharacter.basicInfo.name} />
                      <AvatarFallback className="bg-muted text-muted-foreground">{selectedChatCharacter.basicInfo.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ) : m.role === "assistant" ? (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  ) : null}

                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 shadow-sm ${m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-foreground border border-border"
                      }`}
                  >
                    <div className="type-body-base whitespace-pre-wrap">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    </div>
                  </div>

                  {m.role === "user" && selectedChatPersona ? (
                    <Avatar className="flex-shrink-0 h-8 w-8 border border-border shadow-sm">
                      <AvatarImage src={selectedChatPersona.basicInfo.avatar} alt={selectedChatPersona.basicInfo.name} />
                      <AvatarFallback className="bg-muted text-muted-foreground">{selectedChatPersona.basicInfo.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ) : m.role === "user" ? (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  ) : null}
                </div>
              )
            })}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                {selectedChatCharacter ? (
                  <Avatar className="flex-shrink-0 h-8 w-8 border border-border shadow-sm">
                    <AvatarImage src={selectedChatCharacter.basicInfo.avatar} alt={selectedChatCharacter.basicInfo.name} />
                    <AvatarFallback className="bg-muted text-muted-foreground">{selectedChatCharacter.basicInfo.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className="bg-muted/50 text-foreground border border-border rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
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
