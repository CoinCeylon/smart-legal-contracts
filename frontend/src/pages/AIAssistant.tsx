import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  MessageSquare,
  Send,
  User,
  Bot,
  Shield,
  ArrowLeft,
  BotIcon,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const AIAssistant = () => {
  const [legalMessages, setLegalMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Hello! I'm your AI Legal Assistant. I can help you with contract templates, legal guidance, document review, and drafting assistance. How can I help you today?",
      timestamp: new Date(),
    },
  ]);

  const [cardanoMessages, setCardanoMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Hi! I'm your Cardano Helper. I can assist you with blockchain transactions, wallet connections, smart contract deployment, and technical blockchain questions. What would you like to know?",
      timestamp: new Date(),
    },
  ]);

  const [legalInput, setLegalInput] = useState("");
  const [cardanoInput, setCardanoInput] = useState("");
  const [isCardanoLoading, setIsCardanoLoading] = useState(false);
  const [isLegalLoading, setIsLegalLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("legal");
  const [domain, setDomain] = useState("property");

  const handleLegalSend = async () => {
    const trimmedInput = legalInput.trim();
    if (!trimmedInput) return;

    const userMessage = {
      id: Date.now(),
      type: "user" as const,
      content: trimmedInput,
      timestamp: new Date(),
    };

    setLegalMessages((prev) => [...prev, userMessage]);
    setLegalInput("");
    setIsLegalLoading(true);

    try {
      const response = await fetch(
        "https://unihack-container-app.bravebeach-45fb38c2.centralus.azurecontainerapps.io/legalquery/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Secret-token": "unihack25",
          },
          body: JSON.stringify({
            thread_id: 0, // replace this with a unique ID
            domain: domain, //  domain needed
            user_input: trimmedInput,
            lang: "en",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to get legal response");

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        type: "bot" as const,
        content: data.answer,
        timestamp: new Date(),
      };

      setLegalMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Legal Assistant Error:", error);

      setLegalMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          type: "bot" as const,
          content:
            "Sorry, something went wrong while fetching the legal advice. Please try again later.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLegalLoading(false);
    }
  };

  const handleCardanoSend = async () => {
    const trimmedInput = cardanoInput.trim();
    if (!trimmedInput) return;

    const userMessage = {
      id: Date.now(),
      type: "user" as const,
      content: trimmedInput,
      timestamp: new Date(),
    };

    setCardanoMessages((prev) => [...prev, userMessage]);
    setCardanoInput("");
    setIsCardanoLoading(true);

    try {
      const response = await fetch(
        "https://unihack-container-app.bravebeach-45fb38c2.centralus.azurecontainerapps.io/query/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Secret-token": "unihack25",
          },
          body: JSON.stringify({
            thread_id: 0, // Replace with dynamic user_id
            user_input: trimmedInput,
            lang: "en",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to get response from AI");

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        type: "bot" as const,
        content: data.answer,
        timestamp: new Date(data.date_created),
      };

      setCardanoMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Chatbot API error:", err);
      setCardanoMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          type: "bot" as const,
          content:
            "Sorry, something went wrong while fetching the response. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsCardanoLoading(false);
    }
  };

  const renderMessages = (
    messages: typeof legalMessages,
    isLoading: boolean = false,
    activeTab: string
  ) => {
    const [showScrollButton, setShowScrollButton] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages update
    useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
      <div className="relative">
        {/* Scrollable messages container */}
        <div
          ref={scrollContainerRef}
          onScroll={(e) => {
            const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
            setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
          }}
          className={`space-y-4 overflow-y-auto p-4 ${
    activeTab === "legal" ? "bg-emerald-50" : "bg-blue-50"
  } rounded-lg h-[calc(100vh-23rem)]`} 
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-start space-x-2 max-w-xs lg:max-w-2xl ${
                  message.type === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === "user"
                      ? `${
                          activeTab === "legal"
                            ? "bg-emerald-600"
                            : "bg-blue-600"
                        } text-white`
                      : "bg-slate-600 text-white"
                  }`}
                >
                  {message.type === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <BotIcon className="w-8 h-4" />
                  )}
                </div>
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.type === "user"
                      ? `${
                          activeTab === "legal"
                            ? "bg-emerald-600"
                            : "bg-blue-600"
                        } text-white`
                      : "bg-white text-slate-800 border border-slate-200"
                  }`}
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                  <p
                    className={`text-xs mt-1 ${
                      message.type === "user"
                        ? "text-slate-200"
                        : "text-slate-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start px-2 mt-1">
              <div className="flex items-center space-x-1 text-slate-500 text-md font-medium">
                <span>AI is typing</span>
                <span className="flex space-x-1 animate-pulse">
                  <span className="w-1 h-1 bg-slate-400 rounded-full" />
                  <span className="w-1 h-1 bg-slate-400 rounded-full" />
                  <span className="w-1 h-1 bg-slate-400 rounded-full" />
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Floating Scroll-to-Bottom Button */}
        {showScrollButton && (
          <button
            onClick={() =>
              bottomRef.current?.scrollIntoView({ behavior: "smooth" })
            }
            className="absolute bottom-4 right-4 bg-slate-600 hover:bg-slate-700 text-white p-2 rounded-full shadow-lg"
          >
            <ArrowRight className="w-5 h-5 rotate-90" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${
        activeTab === "legal"
          ? "from-emerald-400 via-emerald-100 to-emerald-200"
          : "from-blue-400 via-blue-100 to-blue-200"
      } `}
    >
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 mr-6"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center 
                    ${
                      activeTab === "cardano" ? "bg-blue-600" : "bg-emerald-600"
                    }`}
                >
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-800">
                  AI Assistant -{" "}
                  {activeTab === "cardano" ? "Cardano Helper" : "Legal"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger
              value="legal"
              className={
                `flex items-center space-x-2 group` +
                (activeTab === "legal"
                  ? " text-emerald-600 font-semibold"
                  : " text-slate-500")
              }
              style={{
                color: activeTab === "legal" ? "#059669" : "#64748b",
                fontWeight: activeTab === "legal" ? 600 : 400,
              }}
            >
              <FileText className="w-4 h-4" />
              <span>Legal Assistant</span>
            </TabsTrigger>

            <TabsTrigger
              value="cardano"
              className={
                `flex items-center space-x-2 group` +
                (activeTab === "cardano"
                  ? " text-blue-600 font-semibold"
                  : " text-slate-500")
              }
              style={{
                color: activeTab === "cardano" ? "#2563eb" : "#64748b",
                fontWeight: activeTab === "cardano" ? 600 : 400,
              }}
            >
              <Shield className="w-4 h-4" />
              <span>Cardano Helper</span>
            </TabsTrigger>
          </TabsList>

          {/* Legal Tab */}
          <TabsContent value="legal">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-3">
                <Card className="border-emerald-200 ">
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center text-slate-800">
                        <Bot className="w-8 h-8 mr-2 text-emerald-600" />
                        Legal Assistant Chat
                      </CardTitle>
                      <CardDescription>
                        Get help with contract templates, legal guidance, and
                        document review
                      </CardDescription>
                    </div>

                    {/* Domain Select Dropdown */}
                    <div>
                      <label className="text-sm font-medium text-slate-600 mr-2">
                        Domain:
                      </label>
                      <select
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="px-3 py-1.5 border border-emerald-300 rounded-md text-sm bg-white text-emerald-700 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                      >
                        <option value="property">Property</option>
                        <option value="civil">Civil</option>
                        <option value="corporate">Corporate</option>
                      </select>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {renderMessages(legalMessages, isLegalLoading, activeTab)}
                    <div className="flex space-x-2 mt-4">
                      <Input
                        placeholder="Ask about contracts, legal terms, or document review..."
                        value={legalInput}
                        onChange={(e) => setLegalInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleLegalSend()
                        }
                        className="flex-1 border-emerald-200 hover:border-emerald-300 "
                      />
                      <Button
                        onClick={handleLegalSend}
                        className="bg-emerald-600 hover:bg-emerald-700"
                        disabled={!legalInput.trim() || isLegalLoading}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Cardano Tab */}
          <TabsContent value="cardano">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-3">
                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-slate-800">
                      <Bot className="w-8 h-8 mr-2 text-blue-600" />
                      Cardano Helper Chat
                    </CardTitle>
                    <CardDescription>
                      Get technical support for Cardano related blockchain
                      transactions and wallet management
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderMessages(
                      cardanoMessages,
                      isCardanoLoading,
                      activeTab
                    )}
                    <div className="flex space-x-2 mt-4 border-blue-00">
                      <Input
                        placeholder="Ask about wallets, transactions, or blockchain technology..."
                        value={cardanoInput}
                        onChange={(e) => setCardanoInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleCardanoSend()
                        }
                        className="flex-1 border-blue-200 hover:border-blue-300 "
                        disabled={isCardanoLoading}
                      />
                      <Button
                        onClick={handleCardanoSend}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={!cardanoInput.trim() || isCardanoLoading}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIAssistant;
