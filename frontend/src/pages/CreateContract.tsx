import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Upload,
  Trash2,
  Users,
  Bot,
  Shield,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useWallet, useWalletList } from "@meshsdk/react";
import ContractTemplates from "@/components/ContractTemplates";
import AIAssistantModal from "@/components/AIAssistantModal";
import SignerSelector from "@/components/SignerSelector";
import { LegalContractService } from "@/lib/contract";
import { useUser } from "@/contexts/UserContext";
import { Textarea } from "@/components/ui/textarea";
import { getscript } from "@/lib/loadScripts";
import { ErrorAlert, SuccessAlert } from "@/components/AlertSystem";

interface Signer {
  id: string;
  email: string;
  walletAddress: string;
  isRegistered: boolean;
}

// Separate WalletConnectionButtons component
function WalletConnectionButtons() {
  const { connected, connecting, connect, disconnect, error, wallet } =
    useWallet();
  const wallets = useWalletList();
  const {
    verificationStatus,
    verifyUser,
    resetVerification,
    setVerificationError,
  } = useUser();

  // Handle wallet connection
  const handleWalletConnect = async (walletName: string) => {
    try {
      await connect(walletName);
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  // Verify user when wallet becomes connected
  useEffect(() => {
    const verify = async () => {
      if (
        connected &&
        wallet &&
        !verificationStatus.isVerified &&
        !verificationStatus.isVerifying &&
        !verificationStatus.verificationError // ✅ ADD THIS CHECK
      ) {
        try {
          const address = await wallet.getChangeAddress();
          if (address) {
            await verifyUser(address);
          }
        } catch (error) {
          console.error("Failed to get wallet address:", error);
          setVerificationError("Failed to get wallet address");
        }
      }
    };

    verify();
  }, [
    connected,
    wallet,
    verificationStatus.isVerified,
    verificationStatus.isVerifying,
    verificationStatus.verificationError, // ✅ ADD THIS DEPENDENCY
  ]);

  // Reset verification when wallet disconnects
  useEffect(() => {
    if (!connected) {
      resetVerification();
    }
  }, [connected]);

  // Show verification loading state
  if (connected && verificationStatus.isVerifying) {
    return (
      <div className="flex items-center justify-center space-x-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-slate-600">Verifying wallet...</span>
      </div>
    );
  }

  // Show successful verification
  if (connected && verificationStatus.isVerified) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <p className="text-sm font-medium text-green-800">
            Wallet Connected & Verified
          </p>
        </div>
        <div className="text-xs text-green-700 mb-3">
          <p>
            <strong>Verification Status:</strong> Verified
          </p>
          <p>
            <strong>Last Verified:</strong>{" "}
            {verificationStatus.lastVerifiedAt
              ? new Date(verificationStatus.lastVerifiedAt).toLocaleString()
              : "Just now"}
          </p>
        </div>
        <Button
          onClick={disconnect}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Disconnect Wallet
        </Button>
      </div>
    );
  }

  if (connecting) {
    return (
      <div className="flex items-center justify-center space-x-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-slate-600">Connecting...</span>
      </div>
    );
  }

  if (wallets.length === 0) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <p className="text-sm font-medium text-amber-800">No Wallets Found</p>
        </div>
        <p className="text-xs text-amber-700 mb-3">
          Please install a Cardano wallet extension to continue.
        </p>
        <div className="space-y-2">
          <a
            href="https://namiwallet.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button variant="outline" size="sm" className="w-full">
              Install Nami Wallet
            </Button>
          </a>
          <a
            href="https://eternl.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button variant="outline" size="sm" className="w-full">
              Install Eternl Wallet
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600 mb-3">
        Choose your preferred wallet:
      </p>
      {wallets.map((wallet) => (
        <Button
          key={wallet.name}
          onClick={() => handleWalletConnect(wallet.name)}
          variant="outline"
          className="w-full flex items-center justify-center space-x-2"
          disabled={connecting}
        >
          <img
            src={wallet.icon}
            alt={wallet.name}
            className="w-5 h-5"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span>Connect {wallet.name}</span>
        </Button>
      ))}

      {(error || verificationStatus.verificationError) && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Error:</strong>{" "}
            {verificationStatus.verificationError ||
              (typeof error === "object" && error && "message" in error
                ? (error as { message: string }).message
                : String(error))}
          </p>
          {verificationStatus.verificationError && (
            <Button
              onClick={async () => {
                if (wallet) {
                  try {
                    const address = await wallet.getChangeAddress();
                    if (address) {
                      await verifyUser(address);
                    }
                  } catch (error) {
                    console.error("Failed to retry verification:", error);
                  }
                }
              }}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Retry Verification
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

const CreateContract = () => {
  const { connected, wallet } = useWallet();
  const { verificationStatus, user } = useUser();
  const [contractName, setContractName] = useState("");
  const [contractType, setContractType] = useState("");
  const [signers, setSigners] = useState<Signer[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [documentHash, setDocumentHash] = useState("");
  const [contractDescription, setContractDescription] = useState("");
  const [threshold, setThreshold] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { authenticatedFetch } = useUser();
  const { scriptAddr } = getscript();
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);

  const contractService = new LegalContractService();

  const contractTypes = [
    "Employment Agreement",
    "Service Agreement",
    "Non-Disclosure Agreement",
    "Partnership Agreement",
    "Lease Agreement",
    "Purchase Agreement",
    "Loan Agreement",
    "Consulting Agreement",
    "License Agreement",
    "Other",
  ];

  const saveContractToDatabase = async (
    transactionHash: string,
    walletAddress: string
  ) => {
    try {
      // Create signers array with email and walletAddress objects
      const signersArray = signers.map((signer) => ({
        email: signer.email,
        walletAddress: signer.walletAddress,
      }));
      const formData = new FormData();

      // Add form fields
      formData.append("name", contractName);
      formData.append("description", contractDescription);
      formData.append("type", contractType);
      formData.append("signers", JSON.stringify(signersArray));
      formData.append("transactionHash", transactionHash);
      formData.append("walletAddress", walletAddress);
      //formData.append("contractAddress", scriptAddr);

      // Add the PDF document
      if (uploadedFile) {
        formData.append("document", uploadedFile);
      }

      // Use authenticatedFetch instead of direct fetch
      const response = await authenticatedFetch(
        `${import.meta.env.VITE_API_APP_BACKEND_URL}/api/v1/contracts`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Contract saved to database:", result);

      return result;
    } catch (error) {
      console.error("Error saving contract to database:", error);
      throw error;
    }
  };

  // Generate document hash from uploaded file
  const generateDocumentHash = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      return hashHex;
    } catch (error) {
      console.error("Error generating document hash:", error);
      throw new Error("Failed to generate document hash");
    }
  };

  // Updated handleFileUpload function
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          alert("File size must be less than 10MB");
          return;
        }

        setUploadedFile(file);
        try {
          const hash = await generateDocumentHash(file);
          setDocumentHash(hash);
        } catch (error) {
          console.error("Error generating document hash:", error);
          alert("Error processing file. Please try again.");
        }
      } else {
        alert("Please upload a PDF file only.");
      }
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf") {
        if (file.size > 10 * 1024 * 1024) {
          alert("File size must be less than 10MB");
          return;
        }

        setUploadedFile(file);
        try {
          const hash = await generateDocumentHash(file);
          setDocumentHash(hash);
        } catch (error) {
          console.error("Error generating document hash:", error);
          alert("Error processing file. Please try again.");
        }
      } else {
        alert("Please upload a PDF file only.");
      }
    }
  };

  // Click handler for the entire upload area
  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  const addSigner = (signer: Signer) => {
    // Check for duplicate signers
    const existingSigner = signers.find(
      (s) =>
        s.email === signer.email || s.walletAddress === signer.walletAddress
    );

    if (existingSigner) {
      alert("This signer has already been added.");
      return;
    }

    setSigners([...signers, signer]);
  };

  const removeSigner = (id: string) => {
    setSigners(signers.filter((s) => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("clicked submit");

    // Reset errors
    setErrors([]);
    setSuccessMessage("");
    setShowSuccess(false);
    // Validation
    const validationErrors: string[] = [];

    if (!wallet || !connected) {
      validationErrors.push("Please connect your wallet first.");
    }

    if (!verificationStatus.isVerified) {
      validationErrors.push(
        "Please verify your wallet before creating contracts."
      );
    }

    if (!contractName.trim()) {
      validationErrors.push("Contract name is required.");
    }

    if (!contractType) {
      validationErrors.push("Contract type is required.");
    }

    if (!uploadedFile) {
      validationErrors.push("Please upload a PDF document.");
    }

    if (signers.length < 1) {
      validationErrors.push("Please add at least one signer.");
    }

    if (threshold < 1 || threshold > signers.length) {
      validationErrors.push("Invalid signature threshold.");
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      // Get wallet address
      const changeAddress = await wallet!.getChangeAddress();
      console.log("Wallet address:", changeAddress);

      // Prepare signer addresses
      const requiredSigners = signers
        .map((signer) => signer.walletAddress)
        .filter((addr) => addr.trim());

      console.log("Required signers:", requiredSigners);

      // Validate contract data
      const validation = contractService.validateContractData(
        documentHash,
        requiredSigners,
        threshold
      );

      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      // Create contract on blockchain
      const hash = await contractService.createContract(
        wallet!,
        documentHash,
        requiredSigners,
        threshold
      );

      setTxHash(hash);

      // Store contract data in database
      await saveContractToDatabase(hash, changeAddress);
      // ✅ Show success message instead of alert
      setSuccessMessage(
        `Contract "${contractName}" created successfully! Transaction Hash: ${hash.substring(
          0,
          16
        )}...`
      );
      setShowSuccess(true);

      // Reset form after a delay to let user see the success message
      setTimeout(() => {
        setContractName("");
        setContractType("");
        setSigners([]);
        setUploadedFile(null);
        setDocumentHash("");
        setThreshold(1);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Optionally hide success message after form reset
        // setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error creating contract:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setErrors([`Error creating contract: ${errorMessage}`]);
    } finally {
      setLoading(false);
    }
  };

  // Show wallet connection screen if not connected
  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Wallet Required
            </CardTitle>
            <CardDescription>
              Connect your wallet to create blockchain contracts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 mb-6">
                Please connect your wallet to create legal contracts on the
                blockchain.
              </p>

              <WalletConnectionButtons />

              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-center space-x-4">
                  <Link to="/dashboard">
                    <Button variant="outline" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/how-it-works">
                    <Button variant="ghost" size="sm">
                      How It Works
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show verification required screen if connected but not verified
  if (connected && !verificationStatus.isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-amber-600" />
              Verification Required
            </CardTitle>
            <CardDescription>
              Your wallet must be verified to create contracts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>

              {verificationStatus.isVerifying ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="text-slate-600">
                      Verifying your wallet...
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    Please wait while we verify your wallet with our backend.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-600 mb-4">
                    Your wallet is connected but not verified. Please verify
                    your wallet to create contracts.
                  </p>

                  {verificationStatus.verificationError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                      <p className="text-sm text-red-800">
                        <strong>Verification Error:</strong>{" "}
                        {verificationStatus.verificationError}
                      </p>
                    </div>
                  )}

                  <WalletConnectionButtons />
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-center space-x-4">
                  <Link to="/dashboard">
                    <Button variant="outline" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/how-it-works">
                    <Button variant="ghost" size="sm">
                      How It Works
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main contract creation interface - only shown to verified users
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Navigation */}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6">
            <SuccessAlert
              title="Contract Created Successfully!"
              description={successMessage}
              className="animate-in slide-in-from-top-2 duration-300"
            />
          </div>
        )}

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mb-6 space-y-2">
            {errors.map((error, index) => (
              <ErrorAlert
                key={index}
                title="Validation Error"
                description={error}
                className="animate-in slide-in-from-top-2 duration-300"
              />
            ))}
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Create Legal Contract
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload your legal document, add signers, and create a secure
            blockchain-backed contract
          </p>
        </div>

        {/* Verification Status Banner */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                ✓ Wallet Verified - You can create contracts
              </p>
              <p className="text-xs text-green-600">
                Last verified:{" "}
                {verificationStatus.lastVerifiedAt
                  ? new Date(verificationStatus.lastVerifiedAt).toLocaleString()
                  : "Just now"}
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center mb-2">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <h3 className="text-sm font-medium text-red-800">
                Please fix the following errors:
              </h3>
            </div>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Success Message */}
        {txHash && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center mb-2">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-sm font-medium text-green-800">
                Contract Created Successfully!
              </h3>
            </div>
            <p className="text-sm text-green-700 mb-2">
              <strong>Transaction Hash:</strong>
            </p>
            <code className="text-xs bg-green-100 p-2 rounded block break-all text-green-800">
              {txHash}
            </code>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Contract Details
                </CardTitle>
                <CardDescription>
                  Fill in the basic information about your legal contract
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Contract Name */}
                  <div>
                    <Label htmlFor="contractName">Contract Name *</Label>
                    <Input
                      id="contractName"
                      value={contractName}
                      onChange={(e) => setContractName(e.target.value)}
                      placeholder="Enter contract name"
                      required
                    />
                  </div>
                  {/* Contract Type */}
                  <div>
                    <Label htmlFor="contractType">Contract Type *</Label>
                    <Select
                      value={contractType}
                      onValueChange={setContractType}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select contract type" />
                      </SelectTrigger>
                      <SelectContent>
                        {contractTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Contract Description */}
                  <div>
                    <Label htmlFor="contractDescription">
                      Contract Description
                    </Label>
                    <Textarea
                      id="contractDescription"
                      value={contractDescription}
                      onChange={(e) => setContractDescription(e.target.value)}
                      placeholder="Enter a brief description of the contract"
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                  {/* Signers Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Label className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          Contract Signers *
                        </Label>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {signers.length} Added
                        </span>
                      </div>
                      <SignerSelector
                        onAddSigner={addSigner}
                        isAddSignerDisabled={false}
                      />
                    </div>

                    {/* Instruction Message */}
                    <div className="flex items-center space-x-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <p className="text-sm text-amber-800">
                        <strong>Required:</strong> Add at least one signer to
                        create the contract. You can add unlimited signers as
                        needed.
                      </p>
                    </div>

                    {signers.length > 0 ? (
                      <div className="space-y-3">
                        {signers.map((signer, index) => (
                          <div
                            key={signer.id}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm font-medium text-slate-600">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-slate-800">
                                  {signer.email}
                                </p>
                                <p className="text-sm text-slate-600 break-all">
                                  {signer.walletAddress}
                                </p>
                                {signer.isRegistered && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                    Registered User
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSigner(signer.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-lg">
                        <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-600 mb-2">
                          No signers added yet
                        </p>
                        <p className="text-sm text-slate-500">
                          Click "Add Signer" to start adding contract signers
                        </p>
                      </div>
                    )}
                  </div>
                  {/* File Upload */}
                  <div>
                    <Label htmlFor="fileUpload">
                      Upload Legal Document (PDF) *
                    </Label>
                    <div
                      className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-all duration-200 cursor-pointer ${
                        isDragOver
                          ? "border-blue-400 bg-blue-50"
                          : uploadedFile
                          ? "border-green-400 bg-green-50"
                          : "border-slate-300 hover:border-slate-400"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={handleUploadAreaClick}
                    >
                      <div className="space-y-1 text-center pointer-events-none">
                        {uploadedFile ? (
                          <>
                            <div className="mx-auto h-12 w-12 text-green-500 mb-3">
                              <CheckCircle className="w-full h-full" />
                            </div>
                            <p className="text-sm text-green-600 font-medium">
                              ✓ Uploaded: {uploadedFile.name}
                            </p>
                            <p className="text-xs text-green-500">
                              File size:{" "}
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <p className="text-xs text-slate-500 mt-2">
                              Click to replace or drag a new file
                            </p>
                          </>
                        ) : (
                          <>
                            <Upload
                              className={`mx-auto h-12 w-12 ${
                                isDragOver ? "text-blue-500" : "text-slate-400"
                              }`}
                            />
                            <div className="text-sm text-slate-600">
                              <p className="font-medium">
                                {isDragOver
                                  ? "Drop your PDF file here"
                                  : "Click to upload or drag and drop"}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                PDF files up to 10MB
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Hidden file input */}
                      <input
                        title="File Upload"
                        ref={fileInputRef}
                        id="fileUpload"
                        name="fileUpload"
                        type="file"
                        accept=".pdf"
                        className="sr-only"
                        onChange={handleFileUpload}
                      />
                    </div>

                    {/* Document Hash Display */}
                    {documentHash && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm font-medium text-slate-800 mb-1">
                          Document Hash (SHA-256):
                        </p>
                        <code className="text-xs bg-slate-100 p-2 rounded block break-all text-slate-600">
                          {documentHash}
                        </code>
                      </div>
                    )}

                    {/* Additional file actions when file is uploaded */}
                    {uploadedFile && (
                      <div className="mt-3 flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {uploadedFile.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                              • PDF Document
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedFile(null);
                            setDocumentHash("");
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-slate-600 hover:bg-slate-700 text-white"
                    disabled={
                      loading ||
                      !verificationStatus.isVerified ||
                      signers.length < 1 ||
                      !contractName.trim() ||
                      !contractType ||
                      !uploadedFile
                    }
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Contract...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Create Contract
                        {signers.length > 0 && (
                          <span className="ml-2 text-xs opacity-75">
                            ({signers.length} signers)
                          </span>
                        )}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileText className="w-5 h-5 mr-2" />
                  Contract Templates
                </CardTitle>
                <CardDescription>
                  Use pre-built templates for common legal agreements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setShowTemplates(true)}
                  className="w-full"
                  variant="outline"
                >
                  Browse Templates
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Bot className="w-5 h-5 mr-2" />
                  AI Legal Assistant
                </CardTitle>
                <CardDescription>
                  Get help with Sri Lankan legal context and document creation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setShowAIAssistant(true)}
                  className="w-full"
                  variant="outline"
                >
                  Get AI Help
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
                <CardDescription>
                  Learn how to create and manage legal contracts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/how-it-works">
                  <Button variant="outline" className="w-full">
                    How It Works
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modals */}
        <ContractTemplates
          open={showTemplates}
          onClose={() => setShowTemplates(false)}
          onSelectTemplate={(template) => {
            setContractName(template.name);
            setContractType(template.type);
            setShowTemplates(false);
          }}
        />

        <AIAssistantModal
          open={showAIAssistant}
          onClose={() => setShowAIAssistant(false)}
          context="contract-creation"
        />
      </div>
    </div>
  );
};

export default CreateContract;
