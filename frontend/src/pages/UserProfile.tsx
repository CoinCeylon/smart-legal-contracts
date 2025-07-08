import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Wallet,
  FileText,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  Copy,
  Settings,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useWallet } from "@meshsdk/react";
import { useToast } from "@/hooks/use-toast";
import ContractSigningModal from "@/components/ContractSigningModal";
import WalletConnectionButtons from "@/components/WalletConnectionButtons";

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
    user: {
      id: number;
      name: string;
      email: string;
      walletAddress: string;
    };
  }>;
  latestTransactionHash?: string;
}

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
  latestTransactionHash: string;
  creator: {
    name: string;
    email: string;
  };
}

const UserProfile = () => {
  const { user, authenticatedFetch, verificationStatus } = useUser();
  const { wallet, connected } = useWallet();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("overview");
  const [contracts, setContracts] = useState<ApiContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContract, setSelectedContract] =
    useState<ContractModalData | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);

  const baseUrl = import.meta.env.VITE_API_APP_BACKEND_URL;

  // Fetch contracts from API
  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authenticatedFetch(
        `${baseUrl}/api/v1/contracts/users`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch contracts: ${response.status}`);
      }

      const data = await response.json();
      setContracts(data.contracts || []);
    } catch (err) {
      console.error("Error fetching contracts:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch contracts"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch individual contract details for modal
  const fetchContractDetails = async (contractId: number) => {
    try {
      const response = await authenticatedFetch(
        `${baseUrl}/api/v1/contracts/${contractId}`
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
        pdfUrl: `${baseUrl}/api/v1/contracts/${contractId}/document`,
        creator: {
          name: contractData.contract.creator.name,
          email: contractData.contract.creator.email,
        },
        latestTransactionHash:
          contractData.contract.latestTransactionHash || "",
      };

      setSelectedContract(modalData);
      setShowContractModal(true);
    } catch (err) {
      console.error("Error fetching contract details:", err);
      toast({
        title: "Error",
        description: "Failed to fetch contract details",
        variant: "destructive",
      });
    }
  };

  // Handle contract view
  const handleViewContract = (contractId: number) => {
    fetchContractDetails(contractId);
  };

  // Copy wallet address to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Wallet address copied to clipboard",
    });
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            User not found
          </h1>
          <Link to="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Filter contracts by status
  const draftContracts = contracts.filter((c) => c.status === "draft");
  const createdContracts = contracts.filter((c) => c.status === "pending");
  const pendingContracts = contracts.filter((c) =>
    c.signers.some((signer) => signer.status === "pending")
  );
  const signedContracts = contracts.filter(
    (c) =>
      c.status === "completed" ||
      c.signers.every((signer) => signer.status === "signed")
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "signed":
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Edit className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "signed":
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getContractStatus = (contract: ApiContract) => {
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

  const ContractTable = ({
    contracts,
    title,
  }: {
    contracts: ApiContract[];
    title: string;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge variant="outline">{contracts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-600" />
            <p className="text-slate-600">Loading contracts...</p>
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No {title.toLowerCase()} found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => {
                const status = getContractStatus(contract);
                const signedCount = contract.signers.filter(
                  (s) => s.status === "signed"
                ).length;

                return (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">
                      {contract.name}
                    </TableCell>
                    <TableCell>{contract.type}</TableCell>
                    <TableCell>
                      {new Date(contract.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(status)}>
                          {getStatusIcon(status)}
                          <span className="ml-1 capitalize">{status}</span>
                        </Badge>
                        <span className="text-sm text-slate-600">
                          {signedCount}/{contract.signers.length}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewContract(contract.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {contract.status === "draft" && (
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-2xl font-bold bg-slate-600 text-white">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-800">
                      {user.name}
                    </h1>
                    <p className="text-slate-600 mb-2">{user.email}</p>
                    {user.company && (
                      <p className="text-slate-600 mb-1">
                        <strong>Company:</strong> {user.company}
                      </p>
                    )}
                    <div className="flex items-center space-x-4">
                      <p className="text-sm text-slate-500">
                        Member since{" "}
                        {user.joinedAt
                          ? new Date(user.joinedAt).toLocaleDateString()
                          : "Unknown"}
                      </p>
                      {user.enabled && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchContracts}
                    disabled={loading}
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${
                        loading ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </Button>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Contracts
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contracts.length}</div>
              <p className="text-xs text-muted-foreground">
                Across all statuses
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Signatures
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingContracts.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting signatures
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{signedContracts.length}</div>
              <p className="text-xs text-muted-foreground">Fully signed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{draftContracts.length}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Email
                    </label>
                    <p className="text-slate-800">{user.email}</p>
                  </div>
                  {user.walletAddress && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Wallet Address
                      </label>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">
                          {user.walletAddress.substring(0, 20)}...
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(user.walletAddress!)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {user.phone && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Phone
                      </label>
                      <p className="text-slate-800">{user.phone}</p>
                    </div>
                  )}
                  {user.address && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Address
                      </label>
                      <p className="text-slate-800">{user.address}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wallet className="w-5 h-5 mr-2" />
                    Wallet Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Connection Status
                    </label>
                    <div className="flex items-center mt-1">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          connected ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <span className="text-slate-800">
                        {connected ? "Connected" : "Disconnected"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">
                      Verification Status
                    </label>
                    <div className="flex items-center mt-1">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          verificationStatus.isVerified
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                      />
                      <span className="text-slate-800">
                        {verificationStatus.isVerified
                          ? "Verified"
                          : "Not Verified"}
                      </span>
                    </div>
                  </div>
                  {user.enabled && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Account Status
                      </label>
                      <div className="flex items-center mt-1">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-slate-800">Enabled</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest contract activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-600" />
                    <p className="text-slate-600">Loading recent activity...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contracts.slice(0, 5).map((contract) => {
                      const status = getContractStatus(contract);
                      return (
                        <div
                          key={contract.id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          onClick={() => handleViewContract(contract.id)}
                        >
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(status)}
                            <div>
                              <p className="font-medium text-slate-800">
                                {contract.name}
                              </p>
                              <p className="text-sm text-slate-600">
                                {contract.type}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(status)}>
                              {status}
                            </Badge>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(
                                contract.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {contracts.length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No recent activity</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drafts">
            <ContractTable contracts={draftContracts} title="Draft Contracts" />
          </TabsContent>

          <TabsContent value="active">
            <div className="space-y-6">
              <ContractTable
                contracts={createdContracts}
                title="Created Contracts"
              />
              <ContractTable
                contracts={pendingContracts}
                title="Pending Signatures"
              />
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <ContractTable
              contracts={signedContracts}
              title="Completed Contracts"
            />
          </TabsContent>

          <TabsContent value="wallet">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="w-5 h-5 mr-2" />
                  Wallet Details
                </CardTitle>
                <CardDescription>
                  Manage your blockchain wallet connection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {user.walletAddress && (
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Wallet Address
                        </label>
                        <div className="flex items-center space-x-2 mt-1">
                          <code className="bg-slate-100 px-3 py-1 rounded text-sm font-mono break-all">
                            {user.walletAddress}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(user.walletAddress!)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Verification Status
                      </label>
                      <div className="flex items-center mt-1">
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${
                            verificationStatus.isVerified
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }`}
                        />
                        <span className="text-slate-800 font-medium">
                          {verificationStatus.isVerified
                            ? "Verified"
                            : "Not Verified"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Account Status
                      </label>
                      <div className="flex items-center mt-1">
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${
                            user.enabled ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <span className="text-slate-800 font-medium">
                          {user.enabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                    <div className="pt-4">
                      <WalletConnectionButtons />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Contract Signing Modal */}
      <ContractSigningModal
        isOpen={showContractModal}
        onClose={() => {
          setShowContractModal(false);
          setSelectedContract(null);
          fetchContracts(); // Refresh contracts after modal closes
        }}
        contract={selectedContract}
        currentUserEmail={user?.email || ""}
      />
    </div>
  );
};

export default UserProfile;
