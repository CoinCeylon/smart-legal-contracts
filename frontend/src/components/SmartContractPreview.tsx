
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SmartContractPreview = () => {
  const contractSnippet = `pub type ContractDatum {
  document_hash: ByteArray,
  required_signers: List<VerificationKeyHash>,
  signatures_collected: List<VerificationKeyHash>,
  threshold: Int,
  contract_creator: VerificationKeyHash,
}

validator legal_contract {
  spend(datum, redeemer, _own_ref, self) {
    // Contract validation logic
    is_signing_action? && is_authorized_signer? 
    && hasnt_signed_before? && is_properly_signed?
  }
}`;

  return (
    <Card className="border-slate-200 hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <CardTitle className="text-lg font-bold flex items-center">
          <Code className="w-5 h-5 mr-2" />
          Smart Contract Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="bg-slate-900 text-green-400 font-mono text-xs overflow-hidden">
          <pre className="p-4 whitespace-pre-wrap">
            <code>{contractSnippet}</code>
          </pre>
        </div>
        <div className="p-4 bg-white">
          <p className="text-slate-600 text-sm mb-4">
            Our Cardano smart contract ensures secure multi-signature validation for legal documents
          </p>
          <Link to="/smart-contract">
            <Button className="w-full bg-slate-600 hover:bg-slate-700 text-white">
              View Full Contract
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartContractPreview;
