// components/WalletConnectionButtons.tsx
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useWallet, useWalletList } from "@meshsdk/react";
import { useUser } from "@/contexts/UserContext";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { resolvePaymentKeyHash } from "@meshsdk/core";

interface WalletConnectionButtonsProps {
  showVerificationStatus?: boolean;
  onVerificationComplete?: () => void;
}

const WalletConnectionButtons: React.FC<WalletConnectionButtonsProps> = ({
  showVerificationStatus = true,
  onVerificationComplete,
}) => {
  const { connected, connecting, connect, disconnect, error, wallet } =
    useWallet();
  const wallets = useWalletList();
  const {
    verificationStatus,
    verifyUser,
    resetVerification,
    setVerificationError,
  } = useUser();

  // Track which wallet we've already tried to verify
  const triedVerificationRef = useRef<string | null>(null);

  // Handle wallet connection
  const handleWalletConnect = async (walletName: string) => {
    try {
      // Reset the tried verification flag when connecting a new wallet
      triedVerificationRef.current = null;
      setVerificationError(null);
      await connect(walletName);
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  // Reset verification and tried flag when wallet disconnects
  useEffect(() => {
    if (!connected) {
      // Use setTimeout to prevent immediate state changes that cause loops
      const timeoutId = setTimeout(() => {
        resetVerification();
        triedVerificationRef.current = null;
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [connected, resetVerification]);

  // Verify user when wallet becomes connected (only once per wallet)
  useEffect(() => {
    const verify = async () => {
      if (
        connected &&
        wallet &&
        showVerificationStatus &&
        !verificationStatus.isVerified &&
        !verificationStatus.isVerifying
      ) {
        try {
          const address = await wallet.getChangeAddress();
          if (!address) return;

          // Create a unique identifier for this wallet
          const keyHash = resolvePaymentKeyHash(address);

          // If we've already tried to verify this wallet, don't try again
          if (triedVerificationRef.current === keyHash) {
            return;
          }

          // Mark this wallet as tried
          triedVerificationRef.current = keyHash;

          // Clear any previous errors before attempting verification
          setVerificationError(null);

          await verifyUser(address);
          onVerificationComplete?.();
        } catch (error) {
          console.error("Failed to verify wallet:", error);
          // Don't set error here - let verifyUser handle it
        }
      }
    };

    verify();
  }, [
    connected,
    wallet,
    showVerificationStatus,
    verificationStatus.isVerified,
    verificationStatus.isVerifying,
    verifyUser,
    onVerificationComplete,
    setVerificationError,
  ]);

  // Show verification loading state
  if (connected && verificationStatus.isVerifying && showVerificationStatus) {
    return (
      <div className="flex items-center justify-center space-x-2 p-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-slate-600">Verifying wallet...</span>
      </div>
    );
  }

  // Show successful verification
  if (connected && verificationStatus.isVerified && showVerificationStatus) {
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
          onClick={() => {
            disconnect();
            triedVerificationRef.current = null;
          }}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Disconnect Wallet
        </Button>
      </div>
    );
  }

  // Show simple connected state (without verification)
  if (connected && !showVerificationStatus) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <p className="text-sm font-medium text-green-800">Wallet Connected</p>
        </div>
        <div className="text-xs text-green-700 mb-3">
          <p>
            <strong>Status:</strong> Ready for signing
          </p>
        </div>
        <Button
          onClick={() => {
            disconnect();
            triedVerificationRef.current = null;
          }}
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
      {wallets.map((walletOption) => (
        <Button
          key={walletOption.name}
          onClick={() => handleWalletConnect(walletOption.name)}
          variant="outline"
          className="w-full flex items-center justify-center space-x-2"
          disabled={connecting}
        >
          <img
            src={walletOption.icon}
            alt={walletOption.name}
            className="w-5 h-5"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span>Connect {walletOption.name}</span>
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
          <div className="flex space-x-2 mt-2">
            {verificationStatus.verificationError && (
              <Button
                onClick={async () => {
                  if (wallet) {
                    try {
                      // Reset the tried flag to allow retry
                      triedVerificationRef.current = null;
                      setVerificationError(null);

                      const address = await wallet.getChangeAddress();
                      if (address) {
                        const keyHash = resolvePaymentKeyHash(address);
                        triedVerificationRef.current = keyHash;
                        await verifyUser(address);
                      }
                    } catch (error) {
                      console.error("Failed to retry verification:", error);
                    }
                  }
                }}
                variant="outline"
                size="sm"
              >
                Retry Verification
              </Button>
            )}
            <Button
              onClick={() => {
                disconnect();
                triedVerificationRef.current = null;
                setVerificationError(null);
              }}
              variant="outline"
              size="sm"
            >
              Try Different Wallet
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnectionButtons;
