import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Plus,
  Users,
  Search,
  Loader2,
  UserPlus,
  Copy,
  Wallet,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { Badge } from "./ui/badge";
import { toast } from "@/hooks/use-toast";

interface Signer {
  id: string;
  email: string;
  walletAddress: string;
  isRegistered: boolean;
}

interface SignerSelectorProps {
  onAddSigner: (signer: Signer) => void;
  isAddSignerDisabled?: boolean;
}

interface ApiUser {
  id: number;
  name: string;
  email: string;
  walletAddress: string;
  enabled: boolean;
  createdAt: string;
}

const SignerSelector: React.FC<SignerSelectorProps> = ({
  onAddSigner,
  isAddSignerDisabled,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"registered" | "manual">(
    "registered"
  );
  const [selectedUser, setSelectedUser] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualWallet, setManualWallet] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // API-related state
  const [registeredUsers, setRegisteredUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authenticatedFetch } = useUser(); // Get from context
  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authenticatedFetch(
        `${import.meta.env.VITE_API_APP_BACKEND_URL}/api/v1/users`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const users = await response.json();
      const enabledUsers = users.filter((user) => user.enabled);
      setRegisteredUsers(enabledUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Fetch users when dialog opens and registered mode is selected
  useEffect(() => {
    if (open && selectedMode === "registered") {
      fetchUsers();
    }
  }, [open, selectedMode]);

  const handleAddRegisteredUser = () => {
    const user = registeredUsers.find((u) => u.id.toString() === selectedUser);
    if (user) {
      onAddSigner({
        id: `signer-${Date.now()}`,
        email: user.email,
        walletAddress: user.walletAddress,
        isRegistered: true,
      });
      setSelectedUser("");
      setOpen(false);
    }
  };

  const handleAddManualUser = () => {
    if (manualEmail && manualWallet) {
      onAddSigner({
        id: `signer-${Date.now()}`,
        email: manualEmail,
        walletAddress: manualWallet,
        isRegistered: false,
      });
      setManualEmail("");
      setManualWallet("");
      setOpen(false);
    }
  };

  const handleRetryFetch = () => {
    fetchUsers();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={isAddSignerDisabled}>
          <Plus className="w-4 h-4 mr-2" />
          Add Signer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Add Contract Signer
          </DialogTitle>
          <DialogDescription>
            Select a registered user or add a new signer manually
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mode Selection */}
          <div>
            <Label>Add Signer Method</Label>
            <Select
              value={selectedMode}
              onValueChange={(value: "registered" | "manual") =>
                setSelectedMode(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="registered">
                  Select Registered User
                </SelectItem>
                <SelectItem value="manual">Add Manually</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedMode === "registered" && (
            <div className="space-y-4">
              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-sm text-slate-600">
                    Loading users...
                  </span>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 mb-2">
                    Failed to load users: {error}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetryFetch}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Retry
                  </Button>
                </div>
              )}

              {/* User Selection */}
              {!loading && !error && (
                <>
                  <div>
                    <Label>Search Registered Users</Label>
                    <div className="relative">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setSearchOpen(!searchOpen)}
                        disabled={registeredUsers.length === 0}
                      >
                        <Search className="w-4 h-4 mr-2" />
                        {selectedUser
                          ? registeredUsers.find(
                              (u) => u.id.toString() === selectedUser
                            )?.email
                          : registeredUsers.length === 0
                          ? "No users available"
                          : "Search by email or wallet address..."}
                      </Button>
                      {searchOpen && registeredUsers.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-52 overflow-y-auto scrollbar-hide bg-white border rounded-md shadow-lg">
                          <Command className="rounded-md border shadow-md">
                            <CommandInput
                              placeholder="Search by email or wallet address..."
                              className="h-10"
                            />
                            <CommandList>
                              <CommandEmpty>No users found.</CommandEmpty>
                              <CommandGroup>
                                {registeredUsers.map((user) => (
                                  <CommandItem
                                    key={user.id}
                                    value={`${user.email} ${user.name} ${user.walletAddress}`}
                                    onSelect={() => {
                                      setSelectedUser(user.id.toString());
                                      setSearchOpen(false);
                                    }}
                                    className="flex flex-col items-start p-3 cursor-pointer hover:bg-slate-50"
                                  >
                                    <div className="w-full">
                                      <div className="flex items-center justify-between mb-1">
                                        <p className="font-medium text-slate-900">
                                          {user.email}
                                        </p>
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {user.enabled
                                            ? "Verified"
                                            : "Unverified"}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-slate-600 mb-1">
                                        {user.name}
                                      </p>
                                      <div className="flex items-center space-x-2">
                                        <Wallet className="w-3 h-3 text-slate-400" />
                                        <p className="text-xs text-slate-500 font-mono truncate max-w-[200px]">
                                          {user.walletAddress}
                                        </p>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(
                                              user.walletAddress
                                            );
                                            toast({
                                              title: "Copied!",
                                              description:
                                                "Wallet address copied to clipboard",
                                            });
                                          }}
                                        >
                                          <Copy className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={handleAddRegisteredUser}
                    disabled={!selectedUser}
                    className="w-full"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Selected User
                  </Button>
                </>
              )}
            </div>
          )}

          {selectedMode === "manual" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="manualEmail">Email Address</Label>
                <Input
                  id="manualEmail"
                  type="email"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="manualWallet">Wallet Address</Label>
                <Input
                  id="manualWallet"
                  value={manualWallet}
                  onChange={(e) => setManualWallet(e.target.value)}
                  placeholder="Enter Cardano wallet address"
                />
              </div>
              <Button
                onClick={handleAddManualUser}
                disabled={!manualEmail || !manualWallet}
                className="w-full"
              >
                Add Signer
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignerSelector;
