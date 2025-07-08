import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet, useWalletList } from "@meshsdk/react";
import { Transaction } from "@meshsdk/core";
import { useUser } from "@/contexts/UserContext";

interface InitialTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete: (walletAddress: string) => void;
  isRequired?: boolean;
}

// Updated WalletConnectionButtons component (no auto-verification)
function WalletConnectionButtons() {
  const { connected, connecting, connect, disconnect, error, wallet } =
    useWallet();
  const wallets = useWalletList();

  const handleWalletConnect = async (walletName: string) => {
    try {
      await connect(walletName);
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  // Show successful connection (without verification)
  if (connected) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <p className="text-sm font-medium text-green-800">Wallet Connected</p>
        </div>
        <div className="text-xs text-green-700 mb-3">
          <p>
            <strong>Status:</strong> Ready for transaction
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
      <div className="flex items-center justify-center space-x-2 p-4">
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
              <ExternalLink className="w-3 h-3 ml-2" />
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
              <ExternalLink className="w-3 h-3 ml-2" />
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

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Error:</strong>{" "}
            {typeof error === "object" && error && "message" in error
              ? (error as { message: string }).message
              : String(error)}
          </p>
        </div>
      )}
    </div>
  );
}

const InitialTransactionModal: React.FC<InitialTransactionModalProps> = ({
  isOpen,
  onClose,
  onVerificationComplete,
  isRequired = false,
}) => {
  const [paymentStep, setPaymentStep] = useState<
    "connect" | "payment" | "processing" | "complete" | "error"
  >("connect");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState("");

  const { toast } = useToast();
  const { wallet, connected } = useWallet();
  const { initialEnable } = useUser();

  // System wallet address for receiving payments
  const SYSTEM_WALLET_ADDRESS =
    "addr_test1qq8m0zz74jp0p6sc4002gcwrjyw636yvpn6qfwxnl8sadjmxhcdy2c6p2eg8fka4daf4uj9flrxyt28exy23h4ah0y5sd8ve80";
  const VERIFICATION_FEE = "5000000"; // 5 ADA in lovelace

  // Move to payment step when wallet is connected (no verification needed)
  useEffect(() => {
    if (connected && paymentStep === "connect") {
      setPaymentStep("payment");
    }
  }, [connected, paymentStep]);

  // Reset modal state when closed
  useEffect(() => {
    if (!isOpen) {
      setPaymentStep("connect");
      setIsProcessing(false);
      setTransactionHash("");
      setWalletAddress("");
      setError("");
    }
  }, [isOpen]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Transaction hash copied to clipboard",
    });
  };

  const handlePayment = async () => {
    if (!wallet || !connected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setPaymentStep("processing");
    setError("");

    try {
      // Get wallet address
      const address = await wallet.getChangeAddress();
      setWalletAddress(address);

      console.log("Creating transaction...");

      // Create transaction
      const tx = new Transaction({ initiator: wallet });
      tx.sendLovelace(SYSTEM_WALLET_ADDRESS, VERIFICATION_FEE);

      // Build and sign transaction
      console.log("Building transaction...");
      const unsignedTx = await tx.build();

      console.log("Signing transaction...");
      const signedTx = await wallet.signTx(unsignedTx);

      console.log("Submitting transaction...");
      const txHash = await wallet.submitTx(signedTx);

      console.log("Transaction submitted:", txHash);
      setTransactionHash(txHash);

      // Wait for confirmation
      console.log("Waiting for confirmation...");
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Call initial-enable API (NOT verify-user)
      console.log("Calling initial-enable API...");
      await initialEnable(address, txHash);

      setPaymentStep("complete");
      toast({
        title: "Payment Successful!",
        description: "Your account has been activated successfully",
      });

      onVerificationComplete(address);
    } catch (error) {
      console.error("Payment failed:", error);
      setError(error instanceof Error ? error.message : "Payment failed");
      setPaymentStep("error");
      toast({
        title: "Payment Failed",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (isRequired && paymentStep !== "complete") {
      toast({
        title: "Payment Required",
        description: "You must complete the initial payment to continue",
        variant: "destructive",
      });
      return;
    }
    onClose();
  };

  const handleRetry = () => {
    setError("");
    setPaymentStep("payment");
  };

  return (
    <Dialog open={isOpen} onOpenChange={isRequired ? undefined : handleClose}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={
          isRequired ? (e) => e.preventDefault() : undefined
        }
      >
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-slate-600" />
            <span>Initial Payment Required</span>
          </DialogTitle>
          <DialogDescription>
            {isRequired
              ? "Complete the initial payment to enable your account"
              : "Make a one-time payment to unlock all features"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Connect Wallet Step */}
          {paymentStep === "connect" && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-800 mb-2">
                  Initial Payment
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    One-time account activation
                  </span>
                  <Badge variant="outline" className="font-mono">
                    5 ADA
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  This payment activates your account and enables contract
                  creation
                </p>
              </div>

              <WalletConnectionButtons />

              {!isRequired && (
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="w-full"
                  >
                    Skip for Now
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Payment Step */}
          {paymentStep === "payment" && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                  <Wallet className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="font-medium">Send Initial Payment</h3>
                <p className="text-sm text-slate-600">
                  Click below to send <strong>5 ADA</strong> to activate your
                  account
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <Label className="text-xs text-slate-500">
                  Payment will be sent to
                </Label>
                <div className="font-mono text-xs bg-white p-2 rounded border mt-1 break-all">
                  {SYSTEM_WALLET_ADDRESS}
                </div>
                <div className="mt-2">
                  <Label className="text-xs text-slate-500">
                    From your wallet
                  </Label>
                  <div className="font-mono text-xs text-slate-700 break-all">
                    {walletAddress || "Will be determined after connection"}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setPaymentStep("connect")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  Send Payment
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {paymentStep === "processing" && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <div>
                <h3 className="font-medium">Processing Payment</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Please wait while we process your transaction and activate
                  your account...
                </p>
              </div>
              {transactionHash && (
                <div className="bg-slate-50 p-3 rounded">
                  <Label className="text-xs text-slate-500">
                    Transaction Hash
                  </Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="font-mono text-xs text-slate-700 break-all flex-1">
                      {transactionHash}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(transactionHash)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Step */}
          {paymentStep === "error" && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium text-red-800">Payment Failed</h3>
                <p className="text-sm text-slate-600 mt-1">
                  {error || "An error occurred while processing your payment"}
                </p>
              </div>
              {transactionHash && (
                <div className="bg-slate-50 p-3 rounded">
                  <Label className="text-xs text-slate-500">
                    Transaction Hash
                  </Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="font-mono text-xs text-slate-700 break-all flex-1">
                      {transactionHash}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(transactionHash)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setPaymentStep("connect")}
                  className="flex-1"
                >
                  Start Over
                </Button>
                <Button onClick={handleRetry} className="flex-1">
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Complete Step */}
          {paymentStep === "complete" && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-green-800">
                  Account Activated!
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Your account has been successfully activated. You can now
                  create and sign contracts.
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <div className="font-mono text-sm text-green-800 break-all">
                  {walletAddress}
                </div>
              </div>
              {transactionHash && (
                <div className="bg-slate-50 p-3 rounded">
                  <Label className="text-xs text-slate-500">
                    Transaction Hash
                  </Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="font-mono text-xs text-slate-700 break-all flex-1">
                      {transactionHash}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(transactionHash)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
              <Button onClick={handleClose} className="w-full">
                Continue to Dashboard
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InitialTransactionModal;
