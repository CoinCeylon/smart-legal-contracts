// components/WalletVerificationGuard.tsx
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useWallet } from "@meshsdk/react";
import { useUser } from "@/contexts/UserContext";
import WalletConnectionButtons from "./WalletConnectionButtons";

interface WalletVerificationGuardProps {
  children: React.ReactNode;
  requireVerification?: boolean;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonLink?: string;
}

const WalletVerificationGuard: React.FC<WalletVerificationGuardProps> = ({
  children,
  requireVerification = true,
  showBackButton = true,
  backButtonText = "Dashboard",
  backButtonLink = "/dashboard",
}) => {
  const { connected } = useWallet();
  const { verificationStatus } = useUser();

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
              Connect your wallet to access this feature
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 mb-6">
                Please connect your wallet to continue.
              </p>

              <WalletConnectionButtons
                showVerificationStatus={requireVerification}
              />

              {showBackButton && (
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-center space-x-4">
                    <Link to={backButtonLink}>
                      <Button variant="outline" size="sm">
                        {backButtonText}
                      </Button>
                    </Link>
                    <Link to="/how-it-works">
                      <Button variant="ghost" size="sm">
                        How It Works
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show verification required screen if connected but not verified (when verification is required)
  if (connected && requireVerification && !verificationStatus.isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-amber-600" />
              Verification Required
            </CardTitle>
            <CardDescription>
              Your wallet must be verified to access this feature
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
                    your wallet to continue.
                  </p>

                  {verificationStatus.verificationError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                      <p className="text-sm text-red-800">
                        <strong>Verification Error:</strong>{" "}
                        {verificationStatus.verificationError}
                      </p>
                    </div>
                  )}

                  <WalletConnectionButtons showVerificationStatus={true} />
                </div>
              )}

              {showBackButton && (
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-center space-x-4">
                    <Link to={backButtonLink}>
                      <Button variant="outline" size="sm">
                        {backButtonText}
                      </Button>
                    </Link>
                    <Link to="/how-it-works">
                      <Button variant="ghost" size="sm">
                        How It Works
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If all conditions are met, render the children
  return <>{children}</>;
};

export default WalletVerificationGuard;
