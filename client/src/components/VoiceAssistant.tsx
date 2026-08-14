import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Volume2, MessageCircle, AlertCircle, Send, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [textInput, setTextInput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const recognitionRef = useRef<any>(null);
  const lastSubmittedQuestionRef = useRef<string>("");

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female')) || 
                          voices.find(v => v.lang.startsWith('en'));
    
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const chatMutation = useMutation({
    mutationFn: async (question: string) => {
      const res = await apiRequest("POST", "/api/chat", { question });
      return await res.json() as { response: string };
    },
    onSuccess: (data, question) => {
      setError(null);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
      speakText(data.response);
    },
    onError: (err: Error) => {
      console.error("Chat failed:", err);
      const fallbackError = "I'm sorry, I encountered an error while trying to think of an answer. Please try asking again.";
      setError(err.message || fallbackError);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: fallbackError,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
      speakText(fallbackError);
    }
  });

  const submitQuestion = (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || chatMutation.isPending) return;

    if (lastSubmittedQuestionRef.current === trimmed && chatMutation.isPending) {
      return;
    }
    lastSubmittedQuestionRef.current = trimmed;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setCurrentQuestion("");
    setTextInput("");
    chatMutation.mutate(trimmed);
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result) => result.transcript)
            .join("");
          setCurrentQuestion(transcript);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          
          if (event.error === 'not-allowed') {
            setError("Microphone access denied. Please grant permission in your browser.");
          } else if (event.error !== 'no-speech') {
            setError(`Recognition error: ${event.error}`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setError("Your browser does not support Web Speech API. You can still type your questions below.");
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore cleanup error
        }
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    };
  }, []);

  const handleVoiceToggle = () => {
    setError(null);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);

    if (isListening) {
      setIsListening(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (currentQuestion.trim()) {
        submitQuestion(currentQuestion);
      }
    } else {
      if (!recognitionRef.current) {
        setError("Speech recognition is not supported in this browser. Please type your message below.");
        return;
      }
      
      setCurrentQuestion("");
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Failed to start recognition:", e);
      }
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      submitQuestion(textInput);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <MessageCircle className="w-6 h-6 text-primary" />
            Voice Memory Assistant
          </CardTitle>
          <p className="text-muted-foreground">
            Ask me anything about your recent activities, family, and schedule
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Voice Visualization / Status Panel */}
          <div className="relative bg-muted rounded-xl p-6 flex items-center justify-center min-h-[160px]">
            <div className="text-center space-y-3">
              {isListening ? (
                <div className="space-y-3">
                  <div className="relative inline-block">
                    <Mic className="w-14 h-14 text-primary mx-auto" />
                    <div className="absolute -inset-3 border-2 border-primary rounded-full animate-ping opacity-20"></div>
                  </div>
                  <p className="text-lg font-medium text-primary">Listening...</p>
                  <p className="text-sm text-muted-foreground max-w-[280px] mx-auto truncate">
                    {currentQuestion ? `"${currentQuestion}"` : "Speak clearly..."}
                  </p>
                </div>
              ) : chatMutation.isPending ? (
                <div className="space-y-3">
                  <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                  <p className="text-lg font-medium">Thinking...</p>
                  <p className="text-sm text-muted-foreground">Searching your memory records</p>
                </div>
              ) : isSpeaking ? (
                <div className="space-y-3">
                  <div className="relative inline-block">
                    <Volume2 className="w-14 h-14 text-chart-2 mx-auto" />
                    <div className="absolute -inset-2 border-2 border-chart-2 rounded-full animate-pulse opacity-50"></div>
                  </div>
                  <p className="text-lg font-medium text-chart-2">Speaking answer...</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      window.speechSynthesis.cancel();
                      setIsSpeaking(false);
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Stop Audio
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <MicOff className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-base font-medium">Ready to Listen or Chat</p>
                  <p className="text-xs text-muted-foreground">Tap the microphone or type below</p>
                </div>
              )}
            </div>
          </div>

          {/* Voice Mic Toggle Button */}
          <div className="flex justify-center">
            <Button
              variant={isListening ? "destructive" : "default"}
              size="lg"
              onClick={handleVoiceToggle}
              disabled={chatMutation.isPending}
              data-testid={isListening ? "button-stop-listening" : "button-start-listening"}
              className="px-8 py-6 text-lg w-full max-w-sm"
            >
              {isListening ? (
                <>
                  <MicOff className="w-6 h-6 mr-2" />
                  Stop & Send
                </>
              ) : (
                <>
                  <Mic className="w-6 h-6 mr-2" />
                  Start Listening
                </>
              )}
            </Button>
          </div>

          {/* Text Input Form */}
          <form onSubmit={handleTextSubmit} className="flex gap-2">
            <Input
              placeholder="Or type your question here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={chatMutation.isPending || isListening}
              className="flex-1"
              data-testid="input-chat-question"
            />
            <Button 
              type="submit" 
              disabled={!textInput.trim() || chatMutation.isPending || isListening}
              data-testid="button-send-chat"
            >
              {chatMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>

          {/* Conversation History / Messages */}
          {messages.length > 0 && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold text-sm text-muted-foreground">Recent Conversation</h4>
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-lg space-y-1 ${
                      msg.role === "user"
                        ? "bg-primary/10 border border-primary/20 ml-8"
                        : "bg-chart-2/10 border border-chart-2/20 mr-8"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-semibold">
                        {msg.role === "user" ? "You" : "Memory Assistant"}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="text-base leading-relaxed">{msg.text}</p>
                    {msg.role === "assistant" && (
                      <div className="pt-2 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => speakText(msg.text)}
                          className="h-8 text-xs text-chart-2 hover:bg-chart-2/10"
                        >
                          <Volume2 className="w-3.5 h-3.5 mr-1" />
                          Replay Audio
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prompt Suggestions */}
          {messages.length === 0 && !isListening && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-3 text-center text-sm">Try asking:</h4>
              <div className="grid gap-2 text-sm">
                {[
                  "What did I eat for breakfast?",
                  "Who visited me yesterday?",
                  "What did the doctor say at my appointment?"
                ].map((promptText) => (
                  <div
                    key={promptText}
                    className="bg-background rounded-md p-3 border cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => submitQuestion(promptText)}
                  >
                    "{promptText}"
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}