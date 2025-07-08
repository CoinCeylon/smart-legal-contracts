use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use aiken/primitive/string
use cardano/transaction.{OutputReference, Transaction}
use cardano/script_context.{ScriptContext}

pub type ContractDatum {
  document_hash: ByteArray,
  required_signers: List<VerificationKeyHash>,
  signatures_collected: List<VerificationKeyHash>,
  threshold: Int,
  contract_creator: VerificationKeyHash,
}

pub type ContractRedeemer {
  action: ByteArray,
  signer: VerificationKeyHash,
}

validator legal_contract {
  spend(
    datum: Option<ContractDatum>,
    redeemer: ContractRedeemer,
    _own_ref: OutputReference,
    self: Transaction,
  ) {
    // Add trace for debugging
    trace @"action": string.from_bytearray(redeemer.action)
    
    expect Some(ContractDatum { 
      document_hash, 
      required_signers, 
      signatures_collected, 
      threshold,
      contract_creator 
    }) = datum
    
    // Check if action is "sign_contract"
    let is_signing_action = redeemer.action == "sign_contract"
    
    // Check if signer is authorized
    let is_authorized_signer = list.has(required_signers, redeemer.signer)
    
    // Check if signer hasn't already signed
    let hasnt_signed_before = !list.has(signatures_collected, redeemer.signer)
    
    // Check if transaction is signed by the signer
    let is_properly_signed = list.has(self.extra_signatories, redeemer.signer)

    // Check if threshold is valid (Threshold must be at least 1)
    let is_valid_threshold = threshold >= 1
    
    // Use trace-if-false operator for debugging
    is_signing_action? && is_authorized_signer? && hasnt_signed_before? && is_properly_signed? && is_valid_threshold?
  }

   else(_ctx: ScriptContext) {
    fail @"unsupported purpose"
  }
}

// Test function
test legal_contract_sign_success() {
  let owner_key_hash = #"00000000000000000000000000000000000000000000000000000000"
  let signer_key_hash = #"11111111111111111111111111111111111111111111111111111111"
  
  let datum = ContractDatum {
    document_hash: "contract_document_hash",
    required_signers: [signer_key_hash],
    signatures_collected: [],
    threshold: 1,
    contract_creator: owner_key_hash,
  }
  
  let redeemer = ContractRedeemer {
    action: "sign_contract",
    signer: signer_key_hash,
  }
  
  let placeholder_utxo = OutputReference { 
    transaction_id: #"", 
    output_index: 0 
  }
  
  legal_contract.spend(
    Some(datum),
    redeemer,
    placeholder_utxo,
    Transaction { 
      ..transaction.placeholder, 
      extra_signatories: [signer_key_hash] 
    },
  )
}

test legal_contract_unauthorized_signer() {
  let owner_key_hash = #"00000000000000000000000000000000000000000000000000000000"
  let authorized_signer = #"11111111111111111111111111111111111111111111111111111111"
  let unauthorized_signer = #"22222222222222222222222222222222222222222222222222222222"
  
  let datum = ContractDatum {
    document_hash: "contract_document_hash",
    required_signers: [authorized_signer],
    signatures_collected: [],
    threshold: 1,
    contract_creator: owner_key_hash,
  }
  
  let redeemer = ContractRedeemer {
    action: "sign_contract",
    signer: unauthorized_signer,
  }
  
  let placeholder_utxo = OutputReference { 
    transaction_id: #"", 
    output_index: 0 
  }
  
  // This should fail because unauthorized_signer is not in required_signers
  !legal_contract.spend(
    Some(datum),
    redeemer,
    placeholder_utxo,
    Transaction { 
      ..transaction.placeholder, 
      extra_signatories: [unauthorized_signer] 
    },
  )
}

test legal_contract_double_signing() {
  let owner_key_hash = #"00000000000000000000000000000000000000000000000000000000"
  let signer_key_hash = #"11111111111111111111111111111111111111111111111111111111"
  
  let datum = ContractDatum {
    document_hash: "contract_document_hash",
    required_signers: [signer_key_hash],
    signatures_collected: [signer_key_hash], // Already signed
    threshold: 1,
    contract_creator: owner_key_hash,
  }
  
  let redeemer = ContractRedeemer {
    action: "sign_contract",
    signer: signer_key_hash,
  }
  
  let placeholder_utxo = OutputReference { 
    transaction_id: #"", 
    output_index: 0 
  }
  
  // This should fail because signer has already signed
  !legal_contract.spend(
    Some(datum),
    redeemer,
    placeholder_utxo,
    Transaction { 
      ..transaction.placeholder, 
      extra_signatories: [signer_key_hash] 
    },
  )
}

test legal_contract_wrong_action() {
  let owner_key_hash = #"00000000000000000000000000000000000000000000000000000000"
  let signer_key_hash = #"11111111111111111111111111111111111111111111111111111111"
  
  let datum = ContractDatum {
    document_hash: "contract_document_hash",
    required_signers: [signer_key_hash],
    signatures_collected: [],
    threshold: 1,
    contract_creator: owner_key_hash,
  }
  
  let redeemer = ContractRedeemer {
    action: "wrong_action", // Wrong action
    signer: signer_key_hash,
  }
  
  let placeholder_utxo = OutputReference { 
    transaction_id: #"", 
    output_index: 0 
  }
  
  // This should fail because action is not "sign_contract"
  !legal_contract.spend(
    Some(datum),
    redeemer,
    placeholder_utxo,
    Transaction { 
      ..transaction.placeholder, 
      extra_signatories: [signer_key_hash] 
    },
  )
}
