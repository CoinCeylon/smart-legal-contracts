import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import ContractSigningModal from "./ContractSigningModal";

const ContractSigningDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // At the top of your component file
  // Test with a publicly available PDF
  const TEST_PDF_URL = "./sh.pdf";

  // Sample contract data
  const sampleContract = {
    id: "1",
    name: "Employment Agreement - Sarah Johnson",
    type: "Employment Agreement",
    description:
      "Standard employment agreement outlining terms of employment, compensation, benefits, and responsibilities.",
    createdAt: "2024-01-20",
    dueDate: "2024-02-05",
    status: "pending" as const,
    pdfUrl: TEST_PDF_URL, // Path to the PDF file
    creator: {
      name: "John Doe",
      email: "john.doe@company.com",
    },
    signers: [
      {
        id: "1",
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        status: "pending" as const,
      },
      {
        id: "2",
        name: "HR Manager",
        email: "hr@company.com",
        status: "signed" as const,
        signedAt: "2024-01-21",
      },
    ],
    latestTransactionHash: "", // Add a default or mock value here
  };

  return (
    <div className="p-6">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Contract Signing Demo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Click the button below to open the contract signing modal and see
            how it works.
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="w-full">
            Open Contract for Signing
          </Button>
        </CardContent>
      </Card>

      <ContractSigningModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contract={sampleContract}
        currentUserEmail="sarah.johnson@email.com"
      />
    </div>
  );
};

export default ContractSigningDemo;
