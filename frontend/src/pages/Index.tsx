import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  Shield,
  FileText,
  Users,
  CheckCircle,
  Activity,
  Check,
  Code,
  Copy,
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const mainFeatures = [
  {
    step: "01",
    icon: FileText,
    title: "AI Contract Creation",
    description:
      "Describe your needs and our AI generates legally compliant contracts instantly",
    details: [
      "Smart legal templates",
      "AI-powered drafting",
      "Compliance validation",
    ],
    color: "blue",
    delay: "0ms",
  },
  {
    step: "02",
    icon: Users,
    title: "Wallet-Based Signing",
    description:
      "Multiple parties sign securely using their Cardano wallet addresses",
    details: [
      "Multi-party coordination",
      "Wallet verification",
      "Email notifications",
    ],
    color: "emerald",
    delay: "200ms",
  },
  {
    step: "03",
    icon: Activity,
    title: "Real-Time Tracking",
    description:
      "Monitor contract status with live blockchain updates and notifications",
    details: [
      "Live status updates",
      "Progress tracking",
      "Instant notifications",
    ],
    color: "slate",
    delay: "400ms",
  },
];

const Index = () => {
  const codeRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [typedCode, setTypedCode] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const contractCode = `pub type ContractDatum {
  document_hash: ByteArray,
  required_signers: List<VerificationKeyHash>,
  signatures_collected: List<VerificationKeyHash>,
  threshold: Int,
  contract_creator: VerificationKeyHash,
}

pub type ContractRedeemer {
  action: ByteArray,
  signer: VerificationKeyHash,
}

validator legal_contract {
  spend(
    datum: Option<ContractDatum>,
    redeemer: ContractRedeemer,
    _own_ref: OutputReference,
    self: Transaction,
  ) {
    // Add trace for debugging
    trace @"action": string.from_bytearray(redeemer.action)
    
    expect Some(ContractDatum { 
      document_hash, 
      required_signers, 
      signatures_collected, 
      threshold,
      contract_creator 
    }) = datum
    
    // Check if action is "sign_contract"
    let is_signing_action = redeemer.action == "sign_contract"
    
    // Check if signer is authorized
    let is_authorized_signer = list.has(required_signers, redeemer.signer)
    
    // Check if signer hasn't already signed
    let hasnt_signed_before = !list.has(signatures_collected, redeemer.signer)
    
    // Check if transaction is signed by the signer
    let is_properly_signed = list.has(self.extra_signatories, redeemer.signer)

    // Check if threshold is valid (Threshold must be at least 1)
    let is_valid_threshold = threshold >= 1
    
    // Use trace-if-false operator for debugging
    is_signing_action? && is_authorized_signer? && hasnt_signed_before? && is_properly_signed? && is_valid_threshold?
  }

   else(_ctx: ScriptContext) {
    fail @"unsupported purpose"
  }
}`;

  useEffect(() => {
    if (currentIndex < contractCode.length) {
      if (codeRef.current) {
        codeRef.current.scrollTop = codeRef.current.scrollHeight;
      }
      const timeout = setTimeout(() => {
        setTypedCode(contractCode.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 20); // Adjust typing speed here
      return () => clearTimeout(timeout);
    } else {
      setIsTypingComplete(true);
    }
  }, [currentIndex, contractCode, typedCode]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(contractCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Navigation */}

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-24 pb-32 bg-gradient-to-br from-white via-sky-50 to-emerald-50 transition-all duration-500 group">
        {/* Background blob effect */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-emerald-200 opacity-30 rounded-full filter blur-3xl animate-pulse-slow group-hover:scale-105 transition-transform duration-700"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-sky-300 opacity-20 rounded-full filter blur-2xl animate-spin-slow group-hover:scale-110 transition-transform duration-700"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-100 rounded-full text-emerald-800 text-sm font-medium mb-8 shadow">
              <Shield className="w-4 h-4 mr-2" />
              Blockchain-Secured Legal Contracts
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6 leading-tight drop-shadow-sm">
              AI-Powered Legal Contract
              <span className="text-emerald-600"> Management</span>
            </h1>

            <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Streamline your legal workflow with blockchain security, AI
              assistance, and multi-signature capabilities. Create, manage, and
              execute contracts with unprecedented trust and efficiency.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/how-it-works">
                <Button
                  size="lg"
                  className="bg-slate-700 hover:bg-slate-800 text-white px-8 py-3 text-lg shadow-md"
                >
                  How It Works
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-100 px-8 py-3 text-lg shadow-sm"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Why Choose <span className="text-blue-600">Lawra?</span>
            </h2>

            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Combining traditional legal expertise with cutting-edge blockchain
              technology
            </p>
          </div>

          <div className="relative mb-20">
            {/* Connecting Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-emerald-600 to-slate-600 transform -translate-y-1/2 z-0"></div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
              {mainFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="group relative"
                  style={{ animationDelay: feature.delay }}
                >
                  {/* Step Card */}
                  <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-6 border border-gray-100">
                    {/* Step Number */}
                    <div
                      className={`absolute -top-4 left-8 w-12 h-12 bg-gradient-to-r ${
                        feature.color === "blue"
                          ? "from-blue-600 to-blue-700"
                          : feature.color === "emerald"
                          ? "from-emerald-600 to-emerald-700"
                          : "from-slate-600 to-slate-700"
                      } rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      {feature.step}
                    </div>

                    {/* Icon */}
                    <div
                      className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 ${
                        feature.color === "blue"
                          ? "bg-blue-50 group-hover:bg-blue-100"
                          : feature.color === "emerald"
                          ? "bg-emerald-50 group-hover:bg-emerald-100"
                          : "bg-slate-50 group-hover:bg-slate-100"
                      }`}
                    >
                      <feature.icon
                        className={`w-10 h-10 ${
                          feature.color === "blue"
                            ? "text-blue-600"
                            : feature.color === "emerald"
                            ? "text-emerald-600"
                            : "text-slate-600"
                        }`}
                      />
                    </div>

                    {/* Content */}
                    <h3
                      className={`text-2xl font-bold text-foreground mb-4 text-center 
                    ${
                      feature.color === "blue"
                        ? "group-hover:text-blue-600"
                        : feature.color === "emerald"
                        ? "group-hover:text-emerald-600"
                        : "group-hover:text-slate-600"
                    } transition-colors duration-300`}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-center mb-6 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Feature Details */}
                    <div className="space-y-2">
                      {feature.details.map((detail, detailIndex) => (
                        <div
                          key={detailIndex}
                          className="flex items-center text-sm text-muted-foreground"
                        >
                          <Check
                            className={`w-4 h-4 mr-3 ${
                              feature.color === "blue"
                                ? "text-blue-600"
                                : feature.color === "emerald"
                                ? "text-emerald-600"
                                : "text-slate-600"
                            }`}
                          />
                          {detail}
                        </div>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div
                      className={`mt-6 h-2 bg-gray-100 rounded-full overflow-hidden`}
                    >
                      <div
                        className={`h-full bg-gradient-to-r ${
                          feature.color === "blue"
                            ? "from-blue-600 to-blue-700"
                            : feature.color === "emerald"
                            ? "from-emerald-600 to-emerald-700"
                            : "from-slate-600 to-slate-700"
                        } rounded-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out`}
                      ></div>
                    </div>
                  </div>

                  {/* Arrow */}
                  {index < mainFeatures.length - 1 && (
                    <div className="hidden lg:flex absolute -right-6 top-1/2 transform -translate-y-1/2 z-20">
                      <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-100 group-hover:scale-110 transition-transform duration-300">
                        <ArrowRight className="w-6 h-6 text-emerald-600" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Smart Contract Preview Section */}
          <section className="px-4 sm:px-6 lg:px-8 pt-12 pb-8">
            <div className="max-w-7xl mx-auto text-center">
              <div className="inline-flex items-center px-4 py-2 bg-emerald-100 rounded-full text-emerald-800 text-sm font-medium mb-8">
                <Code className="w-4 h-4 mr-2" />
                Cardano Smart Contract
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6 leading-tight">
                Our <span className="text-emerald-600">Smart Contract</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                Built on Cardano blockchain for maximum security and
                transparency. Every contract execution is verifiable and
                immutable.
              </p>
            </div>
          </section>
          <section className="px-4 sm:px-6 lg:px-8 pb-16">
            <div className="max-w-6xl mx-auto">
              <Card className="border-slate-200 shadow-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl font-bold flex items-center">
                      <Code className="w-6 h-6 mr-3" />
                      Legal Contract Validator
                    </CardTitle>
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-white/20 text-white hover:bg-white/10"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div
                    ref={codeRef}
                    className="bg-slate-900 text-green-400 font-mono text-sm overflow-y-auto h-[30rem]"
                  >
                    <pre className="p-6 whitespace-pre-wrap">
                      <code>
                        {typedCode}
                        {!isTypingComplete && (
                          <span className="animate-pulse bg-green-400 w-2 h-5 inline-block ml-1"></span>
                        )}
                      </code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Logo and Project Description */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                  <img src={logo} alt="Lawra Logo" className="w-10 h-10" />
                </div>
                <span className="text-2xl font-semibold">Lawra</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                Lawra is an AI-powered platform that simplifies legal contract
                management through blockchain security and intelligent
                validation.
              </p>
            </div>

            {/* Navigation Links */}
            <div className="flex md:justify-end">
              <ul className="flex flex-col md:flex-row gap-4 md:gap-8 text-slate-400 text-sm">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/how-it-works"
                    className="hover:text-white transition-colors"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    to="/features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-700 mt-10 pt-6 text-center text-slate-500 text-sm">
            &copy; 2025 Lawra. All rights reserved. | By Team Vertex
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
