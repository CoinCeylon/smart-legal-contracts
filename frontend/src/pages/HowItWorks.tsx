import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Mail,
  Wallet,
  FileText,
  Users,
  Shield,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Navigation */}

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            How Lawra Works
          </h1>
          <p className="text-xl text-slate-600 mb-4 max-w-3xl mx-auto">
            From registration to contract execution, our streamlined process
            makes legal document management simple and secure
          </p>
        </div>
      </section>

      {/* Process Steps */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-16">
            {/* Step 1 */}
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-emerald-600 font-bold text-lg">
                      1
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Register & Verify
                  </h2>
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-4">
                  Create Your Account
                </h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Start by registering with your email and password. Verify your
                  email address to activate your account. This creates your
                  secure profile within the Lawra ecosystem.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-emerald-600">
                    <Mail className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">
                      Email Registration
                    </span>
                  </div>
                  <div className="flex items-center text-emerald-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">
                      Email Verification
                    </span>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2">
                <Card className="border-slate-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50">
                    <CardTitle className="text-slate-800">
                      Account Setup
                    </CardTitle>
                    <CardDescription>
                      Quick and secure registration process
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center text-slate-700">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                        Enter email and password
                      </div>
                      <div className="flex items-center text-slate-700">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                        Verify email address
                      </div>
                      <div className="flex items-center text-slate-700">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                        Complete profile setup
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
              <div className="lg:w-1/2">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-bold text-lg">2</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Connect Wallet
                  </h2>
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-4">
                  Blockchain Integration
                </h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Connect your Cardano wallet to unlock full contract
                  functionality. Complete a one-time verification transaction to
                  confirm wallet ownership and enable blockchain features.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-blue-600">
                    <Wallet className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">
                      Wallet Connection
                    </span>
                  </div>
                  <div className="flex items-center text-blue-600">
                    <Shield className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">
                      Verification Transaction
                    </span>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2">
                <Card className="border-slate-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardTitle className="text-slate-800">
                      Wallet Integration
                    </CardTitle>
                    <CardDescription>
                      Secure Cardano blockchain connection
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center text-slate-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        Connect Cardano wallet
                      </div>
                      <div className="flex items-center text-slate-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        Complete verification transaction
                      </div>
                      <div className="flex items-center text-slate-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        Unlock contract features
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-purple-600 font-bold text-lg">3</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Create Contracts
                  </h2>
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-4">
                  AI-Powered Document Creation
                </h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Upload PDF documents or create contracts from scratch using
                  our AI Legal Assistant. Get intelligent suggestions, use
                  templates, and receive legal guidance throughout the process.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-purple-600">
                    <FileText className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">PDF Upload</span>
                  </div>
                  <div className="flex items-center text-purple-600">
                    <span className="text-sm font-medium">AI Assistant</span>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2">
                <Card className="border-slate-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardTitle className="text-slate-800">
                      Document Management
                    </CardTitle>
                    <CardDescription>
                      AI-powered contract creation and editing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center text-slate-700">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        Upload or create documents
                      </div>
                      <div className="flex items-center text-slate-700">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        Use AI legal assistance
                      </div>
                      <div className="flex items-center text-slate-700">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        Generate blockchain hash
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
              <div className="lg:w-1/2">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-600 font-bold text-lg">4</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Invite & Execute
                  </h2>
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-4">
                  Multi-Signature Workflow
                </h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Invite signers via email or wallet address. Track signature
                  progress in real-time, receive notifications, and manage the
                  entire contract lifecycle from your dashboard.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-green-600">
                    <Users className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Multi-Signature</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <span className="text-sm font-medium">
                      Real-time Tracking
                    </span>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2">
                <Card className="border-slate-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardTitle className="text-slate-800">
                      Contract Execution
                    </CardTitle>
                    <CardDescription>
                      Collaborative signing and management
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center text-slate-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        Invite signers by email/wallet
                      </div>
                      <div className="flex items-center text-slate-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        Track signing progress
                      </div>
                      <div className="flex items-center text-slate-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        Complete contract execution
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-r from-slate-800 to-slate-700">
        <div className="text-center">
          <h3 className="text-3xl font-bold text-white mb-6">
             Watch our short demo to explore our core features
          </h3>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
             Discover how Lawra simplifies legal workflows with smart contracts, AI assistance, and blockchain-secured agreements. 
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:from-blue-700 hover:to-blue-800">
              Get Started Now
            </button>
            <button className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:from-emerald-700 hover:to-emerald-800">
              Watch Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
