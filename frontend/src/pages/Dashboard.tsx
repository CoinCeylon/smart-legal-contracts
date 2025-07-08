import React, { useState, useEffect } from "react";
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
  FileText,
  Users,
  Shield,
  Bell,
  Plus,
  MessageSquare,
  Loader2,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import ContractSigningDemo from "@/components/ContractSigningDemo";
import { useUser } from "@/contexts/UserContext";
import WalletVerificationModal from "@/components/InitialTransactionModal";
import ContractSigningModal from "@/components/ContractSigningModal";
import Navbar from "@/components/Navbar";

// Types for API response
interface ApiContract {
  id: number;
  name: string;
  description: string;
  type: string;
  transactionHash: string;
  createdBy: number;
  status: "draft" | "pending" | "signed" | "completed";
  createdAt: string;
  updatedAt: string;
  creator: {
    id: number;
    name: string;
    email: string;
    walletAddress: string;
  };
  signers: Array<{
    id: number;
    contractId: number;
    userId: number;
    status: "pending" | "signed";
    signedAt: string | null;
    parentTransactionHash: string | null;
    transactionHash: string | null;
    createdAt: string;
    updatedAt: string;
    user: {
      id: number;
      name: string;
      email: string;
      walletAddress: string;
    };
  }>;
}

interface ContractsResponse {
  message: string;
  contracts: ApiContract[];
}

// Type for the modal contract data
interface ContractModalData {
  id: string;
  name: string;
  type: string;
  description?: string;
  createdAt: string;
  dueDate?: string;
  status: "draft" | "created" | "pending" | "signed";
  signers: Array<{
    id: string;
    name: string;
    email: string;
    status: "pending" | "signed";
    signedAt?: string;
  }>;
  pdfUrl: string;
  creator: {
    name: string;
    email: string;
  };
  latestTransactionHash: string;
}

const Dashboard = () => {
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedContract, setSelectedContract] =
    useState<ContractModalData | null>(null);
  const [contracts, setContracts] = useState<ApiContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, authenticatedFetch } = useUser();

  // Fetch contracts from API
  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authenticatedFetch(
        `${import.meta.env.VITE_API_APP_BACKEND_URL}/api/v1/contracts/users`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch contracts: ${response.status}`);
      }

      const data: ContractsResponse = await response.json();
      setContracts(data.contracts);
    } catch (err) {
      console.error("Error fetching contracts:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch contracts"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch individual contract details
  const fetchContractDetails = async (contractId: number) => {
    try {
      const response = await authenticatedFetch(
        `${
          import.meta.env.VITE_API_APP_BACKEND_URL
        }/api/v1/contracts/${contractId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch contract details: ${response.status}`);
      }

      const contractData = await response.json();

      // Transform API data to modal format
      const modalData: ContractModalData = {
        id: contractData.contract.id.toString(),
        name: contractData.contract.name,
        type: contractData.contract.type,
        description: contractData.contract.description,
        createdAt: contractData.contract.createdAt,
        dueDate: contractData.contract.dueDate,
        status: contractData.contract.status,
        signers: contractData.contract.signers.map((signer: any) => ({
          id: signer.id.toString(),
          name: signer.user.name,
          email: signer.user.email,
          status: signer.status,
          signedAt: signer.signedAt,
        })),

        pdfUrl: `${
          import.meta.env.VITE_API_APP_BACKEND_URL
        }/api/v1/contracts/${contractId}/document`,
        creator: {
          name: contractData.contract.creator.name,
          email: contractData.contract.creator.email,
        },
        latestTransactionHash:
          contractData.contract.latestTransactionHash ?? "",
      };

      setSelectedContract(modalData);
      setShowContractModal(true);
    } catch (err) {
      console.error("Error fetching contract details:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch contract details"
      );
    }
  };

  // Handle contract view
  const handleViewContract = (contractId: number) => {
    fetchContractDetails(contractId);
  };

  // Fetch contracts on component mount
  useEffect(() => {
    fetchContracts();
  }, []);

  const handleVerificationComplete = (walletAddress: string) => {
    console.log("Verification completed for:", walletAddress);
    setShowVerificationModal(false);
  };

  // Show modal if user is not enabled
  const shouldShowModal = user && !user.enabled;

  // Calculate stats from API data
  const calculateStats = () => {
    const totalContracts = contracts.length;
    const pendingSignatures = contracts.filter((contract) =>
      contract.signers.some((signer) => signer.status === "pending")
    ).length;
    const completed = contracts.filter(
      (contract) =>
        contract.status === "completed" ||
        (contract.signers.length > 0 &&
          contract.signers.every((signer) => signer.status === "signed"))
    ).length;
    const drafts = contracts.filter(
      (contract) => contract.status === "draft"
    ).length;

    return {
      totalContracts,
      pendingSignatures,
      completed,
      drafts,
    };
  };

  const stats = calculateStats();

  const statsData = [
    {
      title: "Total Contracts",
      value: stats.totalContracts.toString(),
      change: `${contracts.length} contracts`,
      color: "bg-blue-500",
    },
    {
      title: "Pending Signatures",
      value: stats.pendingSignatures.toString(),
      change:
        stats.pendingSignatures > 0 ? "Needs attention" : "All up to date",
      color: "bg-yellow-500",
    },
    {
      title: "Completed",
      value: stats.completed.toString(),
      change: "Successfully signed",
      color: "bg-green-500",
    },
    {
      title: "Drafts",
      value: stats.drafts.toString(),
      change: "Ready to send",
      color: "bg-purple-500",
    },
  ];

  // Get recent contracts (latest 4)
  const recentContracts = contracts
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 4);

  const getStatusColor = (contract: ApiContract) => {
    if (contract.status === "completed") {
      return "bg-green-100 text-green-800";
    }

    const hasSignedSigners = contract.signers.some(
      (signer) => signer.status === "signed"
    );
    const hasPendingSigners = contract.signers.some(
      (signer) => signer.status === "pending"
    );

    if (hasSignedSigners && hasPendingSigners) {
      return "bg-yellow-100 text-yellow-800";
    } else if (hasPendingSigners) {
      return "bg-yellow-100 text-yellow-800";
    } else if (contract.status === "draft") {
      return "bg-gray-100 text-gray-800";
    }

    return "bg-gray-100 text-gray-800";
  };

  const getStatusText = (contract: ApiContract) => {
    if (contract.status === "completed") return "completed";

    const signedCount = contract.signers.filter(
      (signer) => signer.status === "signed"
    ).length;
    const totalSigners = contract.signers.length;

    if (totalSigners === 0) return "draft";
    if (signedCount === totalSigners) return "completed";
    if (signedCount > 0) return "partial";

    return "pending";
  };

  const isUrgent = (contract: ApiContract) => {
    const createdDate = new Date(contract.createdAt);
    const daysSinceCreated =
      (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    return (
      contract.signers.some((signer) => signer.status === "pending") &&
      daysSinceCreated > 7
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-600" />
              <p className="text-slate-600">Loading your contracts...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
          <p className="text-slate-600">
            Welcome back! Here's an overview of your contract activity.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">Error: {error}</p>
            <Button
              onClick={fetchContracts}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <Card
              key={index}
              className="border-slate-200 hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-slate-800">
                      {stat.value}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{stat.change}</p>
                  </div>
                  <div
                    className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
                  >
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Contracts */}
          <div className="lg:col-span-2">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-800">
                  Recent Contracts
                </CardTitle>
                <CardDescription>
                  Your latest contract activity and status updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentContracts.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 mb-2">No contracts yet</p>
                    <p className="text-sm text-slate-500 mb-4">
                      Create your first contract to get started
                    </p>
                    <Link to="/create-contract">
                      <Button className="bg-slate-600 hover:bg-slate-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Contract
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentContracts.map((contract) => (
                      <div
                        key={contract.id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-800 flex items-center">
                              {contract.name}
                              {isUrgent(contract) && (
                                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                  Urgent
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-slate-600">
                              {
                                contract.signers.filter(
                                  (s) => s.status === "signed"
                                ).length
                              }
                              /{contract.signers.length} signatures
                              {contract.signers.length === 0 && " • Draft"}
                            </p>
                            <p className="text-xs text-slate-500">
                              Created{" "}
                              {new Date(
                                contract.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(contract)}>
                            {getStatusText(contract)}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewContract(contract.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Notifications */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-800">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 flex flex-col">
                <Link to="/create-contract" className="w-full">
                  <Button className="w-full justify-start bg-slate-600 hover:bg-slate-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Contract
                  </Button>
                </Link>
                <Link to="/ai-assistant" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    AI Legal Assistant
                  </Button>
                </Link>
                <Link to="/profile" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Wallet Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-800">
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contracts.slice(0, 3).map((contract, index) => (
                    <div
                      key={contract.id}
                      className="flex items-start space-x-3"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          index === 0
                            ? "bg-blue-500"
                            : index === 1
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                      ></div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          Contract{" "}
                          {getStatusText(contract) === "draft"
                            ? "Created"
                            : "Updated"}
                        </p>
                        <p className="text-xs text-slate-600">
                          {contract.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(contract.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {contracts.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">
                      No recent activity
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <WalletVerificationModal
        isOpen={showVerificationModal || shouldShowModal}
        onClose={() => setShowVerificationModal(false)}
        onVerificationComplete={handleVerificationComplete}
        isRequired={shouldShowModal}
      />

      <ContractSigningModal
        isOpen={showContractModal}
        onClose={() => {
          setShowContractModal(false);
          setSelectedContract(null);
          // Refresh contracts after modal closes to get updated data
          fetchContracts();
        }}
        contract={selectedContract}
        currentUserEmail={user?.email || ""}
      />
    </div>
  );
};

export default Dashboard;
