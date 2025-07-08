import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Send, MessageSquare, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AIAssistantModalProps {
  open: boolean;
  onClose: () => void;
  context: string;
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  open,
  onClose,
  context,
}) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your AI legal assistant. I can help you with Sri Lankan legal context, document creation, and contract guidance. What would you like to know?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const commonQuestions = [
    "What are the requirements for a valid contract in Sri Lanka?",
    "How do I create an employment agreement under Sri Lankan law?",
    "What clauses should I include in a service agreement?",
    "What are the legal requirements for digital signatures?",
    "How to handle dispute resolution in contracts?",
  ];

  const handleSendMessage = async () => {
    // Close the modal and navigate to AI assistant page
    onClose();
    navigate("/ai-assistant");
  };

  const handleQuestionClick = (question: string) => {
    setInputMessage(question);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Bot className="w-5 h-5 mr-2" />
            AI Legal Assistant
          </DialogTitle>
          <DialogDescription>
            Get help with Sri Lankan legal context and document creation
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-[400px]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-slate-50 rounded-lg">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isUser ? "justify-end" : "justify-start"
                }`}
              >
                <Card
                  className={`max-w-[80%] ${
                    message.isUser ? "bg-slate-600 text-white" : "bg-white"
                  }`}
                >
                  <CardContent className="p-3">
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-2 ${
                        message.isUser ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <Card className="bg-white">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600"></div>
                      <p className="text-sm text-slate-600">
                        AI is thinking...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Common Questions */}
          {messages.length === 1 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                <Sparkles className="w-4 h-4 mr-1" />
                Common Questions
              </h4>
              <div className="space-y-2">
                {commonQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start h-auto p-2 whitespace-normal"
                    onClick={() => handleQuestionClick(question)}
                  >
                    <MessageSquare className="w-3 h-3 mr-2 flex-shrink-0 mt-0.5" />
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="mt-4 flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about Sri Lankan legal context..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIAssistantModal;
