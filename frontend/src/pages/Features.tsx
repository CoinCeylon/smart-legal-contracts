import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Zap,
  Users,
  Globe,
  Clock,
  CheckCircle,
  FileText,
  Smartphone,
  Lock,
  TrendingUp,
  ArrowRight,
  Star,
  Scale,
  Home,
  Building2,
  Check,
  Activity,
  Bot,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
const civilLawImage = "/images/civil-law.jpg";
const propertyLawImage = "/images/property-law.jpg";
const corporateLawImage = "/images/corporate-law.jpg";

const Features = () => {
  const mainFeatures = [
    {
      icon: Shield,
      title: "Blockchain Security",
      description:
        "Your contracts are secured by Cardano blockchain technology, ensuring immutable and tamper-proof agreements.",
      color: "bg-blue-500",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Sign and execute contracts in seconds, not days. Our streamlined process eliminates paperwork delays.",
      color: "bg-yellow-500",
    },
    {
      icon: Users,
      title: "Multi-Party Signing",
      description:
        "Seamlessly coordinate signatures from multiple parties with real-time notifications and tracking.",
      color: "bg-green-500",
    },
    {
      icon: Globe,
      title: "Global Accessibility",
      description:
        "Sign contracts from anywhere in the world, on any device. No geographical limitations.",
      color: "bg-purple-500",
    },
    {
      icon: Clock,
      title: "Real-Time Tracking",
      description:
        "Monitor contract status, signature progress, and receive instant notifications for every update.",
      color: "bg-orange-500",
    },
    {
      icon: FileText,
      title: "Smart Templates",
      description:
        "Choose from our library of legal templates or create custom contracts with AI assistance.",
      color: "bg-indigo-500",
    },
  ];

  const benefits = [
    {
      stat: "3x",
      label: "Faster Processing",
      title: "Accelerated Workflows",
      description:
        "Multi-party signing and automated notifications speed up contract completion",
    },
    {
      stat: "50+",
      label: "Contract Types",
      title: "Versatile Platform",
      description:
        "Support for various legal documents from NDAs to complex business agreements",
    },
    {
      stat: "Real-time",
      label: "Status Updates",
      title: "Live Tracking",
      description:
        "Monitor signing progress and receive instant notifications for all parties",
    },
    {
      stat: "100%",
      label: "Decentralized",
      title: "No Single Point of Failure",
      description:
        "Distributed across thousands of Cardano nodes worldwide, ensuring your contracts are always accessible and secure",
    },
  ];

  const useCases = [
    {
      title: "Business Agreements",
      description:
        "Partnership agreements, service contracts, and vendor agreements",
      icon: TrendingUp,
    },
    {
      title: "Employment Contracts",
      description:
        "Hire new employees with secure, legally binding employment agreements",
      icon: Users,
    },
    {
      title: "NDAs & Confidentiality",
      description:
        "Protect sensitive information with non-disclosure agreements",
      icon: Lock,
    },
    {
      title: "Real Estate",
      description:
        "Property agreements, lease contracts, and purchase agreements",
      icon: FileText,
    },
  ];

  const industries = [
    {
      icon: Scale,
      title: "Civil Law",
      description:
        "Personal disputes, family matters, and individual legal agreements",
      image: civilLawImage,
      applications: [
        "Divorce agreements",
        "Personal injury claims",
        "Property disputes",
        "Family contracts",
      ],
      color: "blue",
      bgGradient: "from-blue-500/10 to-blue-600/20",
    },
    {
      icon: Home,
      title: "Property Law",
      description:
        "Real estate transactions, property management, and land agreements",
      image: propertyLawImage,
      applications: [
        "Property sales",
        "Lease agreements",
        "Rental contracts",
        "Property management",
      ],
      color: "emerald",
      bgGradient: "from-emerald-500/10 to-emerald-600/20",
    },
    {
      icon: Building2,
      title: "Corporate Law",
      description:
        "Business contracts, partnerships, and commercial legal documents",
      image: corporateLawImage,
      applications: [
        "Partnership agreements",
        "Business contracts",
        "Commercial leases",
        "Corporate governance",
      ],
      color: "slate",
      bgGradient: "from-slate-500/10 to-slate-600/20",
    },
  ];

  const services = [
    {
      id: 1,
      icon: FileText,
      title: "Create Agreements",
      description:
        "Design custom contracts with our intuitive builder or choose from professional templates",
      features: [
        "Smart contract templates",
        "Custom clause builder",
        "Legal compliance checks",
        "Multi-language support",
      ],
      gradient: "from-blue-600 to-blue-700",
      bgGradient: "from-blue-50 to-blue-100/50",
      iconBg: "bg-blue-600",
      accentColor: "text-blue-600",
    },
    {
      id: 2,
      icon: Users,
      title: "Multi-Party Signing",
      description:
        "Coordinate signatures from multiple parties with wallet-based authentication",
      features: [
        "Cardano wallet integration",
        "Sequential signing workflows",
        "Parallel signature collection",
        "Identity verification",
      ],
      gradient: "from-emerald-600 to-emerald-700",
      bgGradient: "from-emerald-50 to-emerald-100/50",
      iconBg: "bg-emerald-600",
      accentColor: "text-emerald-600",
    },
    {
      id: 3,
      icon: Activity,
      title: "Real-Time Tracking",
      description:
        "Monitor all signed parties and contract status with comprehensive dashboard",
      features: [
        "Live signature tracking",
        "Party status overview",
        "Completion notifications",
        "Audit trail access",
      ],
      gradient: "from-slate-600 to-slate-700",
      bgGradient: "from-slate-50 to-slate-100/50",
      iconBg: "bg-slate-600",
      accentColor: "text-slate-600",
    },
    {
      id: 4,
      icon: Bot,
      title: "AI-Powered Support",
      description:
        "Get instant help with our intelligent chatbots for contract and Cardano support",
      features: [
        "Contract information bot",
        "Cardano blockchain support",
        "Legal guidance assistant",
        "24/7 availability",
      ],
      gradient: "from-blue-600 via-emerald-600 to-slate-600",
      bgGradient: "from-blue-50 via-emerald-50 to-slate-50",
      iconBg: "bg-gradient-to-r from-blue-600 to-emerald-600",
      accentColor: "text-blue-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
            The Future of
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-600">
              {" "}
              Digital Contracts
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Experience lightning-fast, blockchain-secured contract signing
            that's trusted by thousands of businesses worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://blockchain-educator.shehansuraweera.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              <Button
                size="lg"
                className="bg-slate-600 hover:bg-slate-700 text-white px-8 py-4 text-lg"
              >
                Visit Blockchain Educator
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
            <Link to="/how-it-works">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Features */}

      <section className="py-20 px-4 sm:px-6 lg:px-16 bg-white">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6 leading-tight">
            Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-600">
              Core
            </span>{" "}
            Services
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive contract management solutions powered by Cardano
            blockchain technology
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="group relative bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-slate-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background Gradient – now solid slate */}
              <div className="absolute inset-0 bg-slate-600 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>

              {/* Content */}
              <div className="relative z-10">
                {/* Icon and Title */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-slate-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-800 group-hover:text-slate-900 transition-colors duration-300">
                      {service.title}
                    </h3>
                    <div className="h-1 w-16 bg-slate-600 mt-2 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-600 mb-6 leading-relaxed text-lg">
                  {service.description}
                </p>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  {service.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-center gap-3 group-hover:translate-x-2 transition-transform duration-300"
                      style={{ transitionDelay: `${featureIndex * 100}ms` }}
                    >
                      <div className="w-2 h-2 bg-slate-600 rounded-full flex-shrink-0" />
                      <span className="text-slate-700 font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Stats */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Blockchain-Powered Contract Results
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Join forward-thinking businesses leveraging Cardano blockchain for
              secure, transparent, and efficient legal contract management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">
                  {benefit.stat}
                </div>
                <div className="text-sm text-blue-300 mb-3">
                  {benefit.label}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-slate-300">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section
        id="industries"
        className="py-20 bg-gradient-to-br from-slate-50 to-white overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-300 text-white rounded-full text-sm font-semibold mb-8">
              <Scale className="w-5 h-5 mr-2" />
              Legal Domains We Serve
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Perfect for Every{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-600 bg-clip-text text-transparent">
                Legal Domain
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Specialized contract solutions for Civil, Property, and Corporate
              legal matters
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {industries.map((industry, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-6 border border-gray-100"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${industry.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                ></div>

                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={industry.image}
                    alt={industry.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                  {/* Icon Overlay */}
                  <div
                    className={`absolute top-4 right-4 w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 ${
                      industry.color === "blue"
                        ? "bg-blue-600/90"
                        : industry.color === "emerald"
                        ? "bg-emerald-600/90"
                        : "bg-slate-600/90"
                    } group-hover:scale-110 transition-transform duration-300`}
                  >
                    <industry.icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Content Section */}
                <div className="relative z-10 p-8">
                  <h3
                    className={`text-2xl font-bold mb-4 group-hover:${
                      industry.color === "blue"
                        ? "text-blue-600"
                        : industry.color === "emerald"
                        ? "text-emerald-600"
                        : "text-slate-600"
                    } transition-colors duration-300`}
                  >
                    {industry.title}
                  </h3>

                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {industry.description}
                  </p>

                  {/* Applications List */}
                  <div className="space-y-3">
                    {industry.applications.map((app, appIndex) => (
                      <div key={appIndex} className="flex items-center text-sm">
                        <Check
                          className={`w-4 h-4 mr-3 ${
                            industry.color === "blue"
                              ? "text-blue-600"
                              : industry.color === "emerald"
                              ? "text-emerald-600"
                              : "text-slate-600"
                          }`}
                        />
                        <span className="text-muted-foreground">{app}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-800 to-slate-900">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-4xl font-bold mb-4">
              What is the importance of us?
            </CardTitle>
            <CardDescription className="text-blue-100 text-lg max-w-3xl mx-auto">
              Built on Cardano blockchain with cutting-edge AI technology for
              unmatched security and efficiency.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Fully Peer-to-Peer",
                desc: "No intermediaries required",
              },
              {
                title: "AI-Powered",
                desc: "Smart contract drafting & validation",
              },
              {
                title: "Blockchain Secured",
                desc: "Tamper-proof on-chain storage",
              },
              {
                title: "Globally First",
                desc: "AI assistant for Cardano blockchain",
              },
            ].map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <div className="w-6 h-6 bg-white rounded-full"></div>
                </div>
                <h4 className="font-bold text-lg mb-2 text-emerald-300">
                  {benefit.title}
                </h4>
                <p className="text-blue-100 text-sm">{benefit.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Features;
