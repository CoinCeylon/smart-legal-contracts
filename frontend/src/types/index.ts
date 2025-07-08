export interface ContractDatum {
  document_hash: string;
  required_signers: string[];
  signatures_collected: string[];
  threshold: number;
  contract_creator: string;
}

export interface ContractRedeemer {
  action: string;
  signer: string;
}
