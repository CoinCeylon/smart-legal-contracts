import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Download,
  Pen,
  Loader2,
  Shield,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { useWallet } from "@meshsdk/react";
import { LegalContractService } from "@/lib/contract";
import WalletConnectionButtons from "./WalletConnectionButtons";

interface Signer {
  id: string;
  name: string;
  email: string;
  status: "pending" | "signed";
  signedAt?: string;
}

interface ContractData {
  id: string;
  name: string;
  type: string;
  description?: string;
  createdAt: string;
  dueDate?: string;
  status: "draft" | "created" | "pending" | "signed";
  signers: Signer[];
  pdfUrl: string;
  latestTransactionHash: string;
  creator: {
    name: string;
    email: string;
  };
}

interface ContractSigningModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: ContractData | null;
  currentUserEmail: string;
}

export const ContractSigningModal: React.FC<ContractSigningModalProps> = ({
  isOpen,
  onClose,
  contract,
  currentUserEmail,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showWalletConnection, setShowWalletConnection] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const { toast } = useToast();
  const { authenticatedFetch, verificationStatus } = useUser();
  const { wallet, connected } = useWallet();

  // Initialize contract service
  const contractService = new LegalContractService();

  if (!contract) return null;

  const currentUserSigner = contract.signers.find(
    (s) => s.email === currentUserEmail
  );
  const canSign = currentUserSigner && currentUserSigner.status === "pending";
  const hasUserSigned =
    currentUserSigner && currentUserSigner.status === "signed";

  // Check if wallet verification is needed for signing
  const needsWalletForSigning =
    canSign &&
    contract.latestTransactionHash &&
    (!connected || !verificationStatus.isVerified);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "created":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "signed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSign = async () => {
    if (!canSign) return;

    // Check wallet connection and verification for blockchain contracts
    if (contract.latestTransactionHash) {
      if (!connected || !wallet) {
        setShowWalletConnection(true);
        return;
      }

      if (!verificationStatus.isVerified) {
        toast({
          title: "Verification Required",
          description:
            "Your wallet must be verified to sign blockchain contracts.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      let blockchainTxHash = "";

      // Step 1: Sign on blockchain if contract has a transaction hash
      if (contract.latestTransactionHash) {
        toast({
          title: "Blockchain Signing",
          description: "Signing contract on Cardano blockchain...",
        });

        try {
          blockchainTxHash = await contractService.signContract(
            contract.latestTransactionHash,
            wallet
          );

          console.log("✅ Blockchain signature successful:", blockchainTxHash);

          toast({
            title: "Blockchain Signature Complete",
            description: "Contract signed on blockchain. Updating database...",
          });
        } catch (blockchainError) {
          console.error("❌ Blockchain signing failed:", blockchainError);

          if (blockchainError instanceof Error) {
            if (blockchainError.message.includes("not authorized")) {
              toast({
                title: "Not Authorized",
                description:
                  "Your wallet is not authorized to sign this contract.",
                variant: "destructive",
              });
              return;
            } else if (blockchainError.message.includes("already signed")) {
              toast({
                title: "Already Signed",
                description:
                  "You have already signed this contract on the blockchain.",
                variant: "destructive",
              });
              return;
            }
          }

          throw new Error(`Blockchain signing failed: ${blockchainError}`);
        }
      }

      // Step 2: Update database with signature
      const response = await authenticatedFetch(
        `${import.meta.env.VITE_API_APP_BACKEND_URL}/api/v1/contracts/${
          contract.id
        }/sign`,
        {
          method: "PUT",
          body: JSON.stringify({
            transactionHash: blockchainTxHash,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Database update failed: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Database update successful:", result);

      toast({
        title: "Contract Signed Successfully",
        description: contract.latestTransactionHash
          ? "Your signature has been recorded on blockchain and database. All parties have been notified."
          : "Your signature has been recorded. All parties have been notified.",
      });

      onClose();
    } catch (error) {
      console.error("❌ Signing error:", error);

      let errorMessage =
        "There was an error signing the contract. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Signing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloadLoading(true);
    try {
      console.log("Downloading PDF from:", contract.pdfUrl);
      const response = await authenticatedFetch(contract.pdfUrl);

      if (!response.ok) {
        throw new Error(`Failed to download PDF: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${contract.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "The contract PDF is being downloaded.",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download the contract PDF.",
        variant: "destructive",
      });
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center space-x-2 min-w-0">
                <FileText className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{contract.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getStatusColor(contract.status)}>
                  {contract.status}
                </Badge>
                {contract.latestTransactionHash && (
                  <Badge variant="outline" className="text-xs">
                    Blockchain
                  </Badge>
                )}
              </div>
            </DialogTitle>
            <DialogDescription className="text-sm">
              Review contract details and download the document
              {contract.latestTransactionHash &&
                " to sign on Cardano blockchain"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 pr-2">
            {/* Contract Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">
                  Contract Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-start space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium">Created</p>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        {new Date(contract.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 text-sm">
                    <Users className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium">Signers</p>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        {
                          contract.signers.filter((s) => s.status === "signed")
                            .length
                        }{" "}
                        of {contract.signers.length} signed
                      </p>
                    </div>
                  </div>

                  {contract.dueDate && (
                    <div className="flex items-start space-x-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium">Due Date</p>
                        <p className="text-gray-600 text-xs sm:text-sm">
                          {new Date(contract.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {contract.latestTransactionHash && (
                    <div className="flex items-start space-x-2 text-sm">
                      <FileText className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium">Creator</p>
                        <p className="text-gray-600 font-mono text-xs break-all">
                          {contract.latestTransactionHash}
                        </p>
                      </div>
                    </div>
                  )}

                  {contract.creator && (
                    <div className="flex items-start space-x-2 text-sm">
                      <FileText className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium">Creator</p>
                        <p className="text-gray-600 font-mono text-xs break-all">
                          {contract.creator.name} ({contract.creator.email})
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {contract.description && (
                  <div className="pt-2 border-t">
                    <p className="font-medium text-sm mb-1">Description</p>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                      {contract.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Document Download Section */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4 sm:pt-6">
                <div className="text-center space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">
                      Contract Document
                    </h3>
                    <p className="text-xs sm:text-sm text-blue-700 mb-3 sm:mb-4 px-2">
                      Download the contract document to review before signing
                    </p>
                    <Button
                      onClick={handleDownload}
                      disabled={downloadLoading}
                      className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm"
                      size="sm"
                    >
                      {downloadLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Signing Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">
                  Signing Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-40 sm:max-h-48">
                  <div className="space-y-2 sm:space-y-3">
                    {contract.signers.map((signer) => (
                      <div
                        key={signer.id}
                        className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="min-w-0 flex-1 mr-2">
                          <p className="font-medium text-xs sm:text-sm truncate">
                            {signer.name}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {signer.email}
                          </p>
                          {signer.signedAt && (
                            <p className="text-xs text-gray-500">
                              Signed{" "}
                              {new Date(signer.signedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                          {signer.status === "signed" ? (
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                          )}
                          <Badge
                            variant={
                              signer.status === "signed"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {signer.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Wallet Connection Status for Blockchain Contracts */}
            {canSign && contract.latestTransactionHash && (
              <Card
                className={
                  connected && verificationStatus.isVerified
                    ? "border-green-200 bg-green-50"
                    : "border-yellow-200 bg-yellow-50"
                }
              >
                <CardContent className="pt-4 sm:pt-6">
                  <div
                    className={`flex items-start space-x-2 ${
                      connected && verificationStatus.isVerified
                        ? "text-green-800"
                        : "text-yellow-800"
                    }`}
                  >
                    {connected && verificationStatus.isVerified ? (
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base">
                        {connected && verificationStatus.isVerified
                          ? "Ready to Sign"
                          : "Wallet Required"}
                      </p>
                      <p
                        className={`text-xs sm:text-sm mt-1 ${
                          connected && verificationStatus.isVerified
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {connected && verificationStatus.isVerified
                          ? "Wallet connected and verified for blockchain signing"
                          : "Connect and verify your Cardano wallet to sign"}
                      </p>
                    </div>
                  </div>
                  {needsWalletForSigning && (
                    <Button
                      onClick={() => setShowWalletConnection(true)}
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full text-sm"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Connect Wallet
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* User Signed Status */}
            {hasUserSigned && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-start space-x-2 text-green-800">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base">
                        You have signed this contract
                      </p>
                      {currentUserSigner?.signedAt && (
                        <p className="text-xs sm:text-sm text-green-600 mt-1">
                          Signed on{" "}
                          {new Date(
                            currentUserSigner.signedAt
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator className="my-2 sm:my-4" />

          <DialogFooter className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
            <div className="flex items-center justify-center sm:justify-start">
              {hasUserSigned && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-medium">
                    Contract Signed
                  </span>
                </div>
              )}
            </div>

            <div className="flex space-x-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 sm:flex-none text-sm"
                size="sm"
              >
                Close
              </Button>
              {canSign && (
                <Button
                  onClick={handleSign}
                  disabled={isLoading || needsWalletForSigning}
                  className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none text-sm"
                  size="sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Signing...
                    </>
                  ) : (
                    <>
                      <Pen className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">
                        {contract.latestTransactionHash
                          ? "Sign on Blockchain"
                          : "Sign Contract"}
                      </span>
                      <span className="sm:hidden">Sign</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Wallet Connection Dialog */}
      <Dialog
        open={showWalletConnection}
        onOpenChange={setShowWalletConnection}
      >
        <DialogContent className="sm:max-w-md w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-sm sm:text-base">
              <Shield className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>Connect Wallet to Sign</span>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              This contract requires a verified Cardano wallet to sign on the
              blockchain.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <WalletConnectionButtons
              showVerificationStatus={true}
              onVerificationComplete={() => setShowWalletConnection(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContractSigningModal;
