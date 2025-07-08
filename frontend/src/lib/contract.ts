import { deserializeAddress, mConStr0, stringToHex } from "@meshsdk/core";
import type { Asset, UTxO } from "@meshsdk/core";
import * as cbor from "cbor";
import { getscript, getTxBuilder, getUtxoByTxHash } from "./loadScripts";
import { ContractDatum } from "@/types";

export class LegalContractService {
  // Create a new legal contract
  async createContract(
    wallet: any,
    documentHash: string,
    requiredSigners: string[],
    threshold: number
  ): Promise<string> {
    try {
      console.log("🚀 Starting createContract");
      console.log("Document Hash:", documentHash);
      console.log("Required Signers:", requiredSigners);
      console.log("Threshold:", threshold);

      // Input validation
      if (!documentHash || typeof documentHash !== "string") {
        throw new Error("Invalid document hash");
      }
      if (!Array.isArray(requiredSigners) || requiredSigners.length === 0) {
        throw new Error("Required signers must be a non-empty array");
      }
      if (threshold <= 0 || threshold > requiredSigners.length) {
        throw new Error("Invalid threshold value");
      }

      // Assets to lock into the contract
      const assets: Asset[] = [
        {
          unit: "lovelace",
          quantity: "2000000",
        },
      ];

      // Get UTxOs and wallet address
      const utxos = await wallet.getUtxos();
      const walletAddress = await wallet.getChangeAddress();
      const { scriptAddr } = getscript(); // ✅ Fixed function name

      // Get wallet's key hash (contract_creator)
      const creatorKeyHash = deserializeAddress(walletAddress).pubKeyHash;

      // Convert required signers to key hashes
      const signerKeyHashes = requiredSigners.map(
        (address) => deserializeAddress(address).pubKeyHash
      );

      // Convert document hash to hex if it's not already
      const documentHashHex = documentHash.startsWith("0x")
        ? documentHash.slice(2)
        : stringToHex(documentHash);

      // Build datum matching Aiken ContractDatum structure
      const datum = mConStr0([
        documentHashHex, // document_hash as ByteArray (hex string)
        signerKeyHashes, // required_signers as List<VerificationKeyHash>
        [], // signatures_collected (empty initially)
        threshold, // threshold as Int
        creatorKeyHash, // contract_creator as VerificationKeyHash
      ]);

      // Build transaction with MeshTxBuilder
      const txBuilder = getTxBuilder();
      await txBuilder
        .txOut(scriptAddr, assets) // Send assets to script address
        .txOutInlineDatumValue(datum) // ✅ Creates inline datum(datum) // ✅ Use properly structured datum
        .changeAddress(walletAddress) // Send change back to wallet
        .selectUtxosFrom(utxos)
        .complete();

      // Sign and submit transaction
      const unsignedTx = txBuilder.txHex;
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);

      console.log(`Contract created with tx hash: ${txHash}`);
      return txHash;
    } catch (error) {
      console.error("Error creating contract:", error);
      throw error;
    }
  }

  // Sign an existing contract
  async signContract(txHash: string, wallet: any): Promise<string> {
    try {
      console.log("🚀 Starting signContract");

      // Get wallet data
      const utxos = await wallet.getUtxos();
      const walletAddress = await wallet.getChangeAddress();
      const collateralList = await wallet.getCollateral();

      if (!collateralList?.length) {
        throw new Error("No collateral UTxO found.");
      }
      const collateral = collateralList[0];

      const { scriptCbor, scriptAddr } = getscript(); // ✅ Fixed function name

      console.log("📜 Script CBOR:", scriptCbor);
      console.log("🏠 Script address:", scriptAddr);

      // Get signer's key hash
      const signerHash = deserializeAddress(walletAddress).pubKeyHash;
      console.log("🔑 Signer hash:", signerHash);

      // Get the contract UTxO
      const scriptUtxo = await getUtxoByTxHash(txHash);
      if (!scriptUtxo) {
        throw new Error("Contract UTxO not found");
      }

      console.log("📦 Script UTxO found:", scriptUtxo);
      // Parse current datum from the UTxO
      const currentDatum = this.parseDatum(scriptUtxo);
      console.log("📖 Current datum:", currentDatum);

      // Validate signer authorization
      console.log("🔍 Checking if signer is authorized...");
      console.log("Required signers:", currentDatum.required_signers);
      console.log("Signer hash:", signerHash);

      if (!currentDatum.required_signers.includes(signerHash)) {
        throw new Error(
          `Your wallet (${signerHash}) is not authorized to sign this contract. Required signers: ${currentDatum.required_signers.join(
            ", "
          )}`
        );
      }

      console.log("✅ Signer is authorized");

      if (currentDatum.signatures_collected.includes(signerHash)) {
        throw new Error("You have already signed this contract");
      }

      console.log("✅ Signer hasn't signed before");

      // Create updated datum with new signature
      const updatedSignatures = [
        ...currentDatum.signatures_collected,
        signerHash,
      ];
      console.log("📝 Updated signatures:", updatedSignatures);

      const newDatum = mConStr0([
        currentDatum.document_hash,
        currentDatum.required_signers,
        updatedSignatures, // ✅ Updated signatures list
        currentDatum.threshold,
        currentDatum.contract_creator,
      ]);

      console.log("📄 New datum created");

      // Create redeemer matching your Aiken ContractRedeemer structure
      const redeemer = mConStr0([
        stringToHex("sign_contract"), // action as ByteArray
        signerHash, // signer as VerificationKeyHash
      ]);

      console.log("🔧 Redeemer created");

      // Build transaction
      console.log("🏗️ Building transaction...");
      const txBuilder = getTxBuilder();

      try {
        await txBuilder
          .spendingPlutusScript("V3")
          .txIn(
            scriptUtxo.input.txHash,
            scriptUtxo.input.outputIndex,
            scriptUtxo.output.amount,
            scriptUtxo.output.address
          )
          .txInScript(scriptCbor)
          .txInRedeemerValue(redeemer)
          .txInInlineDatumPresent()
          .txOut(scriptAddr, scriptUtxo.output.amount) // ✅ Continue contract
          .txOutInlineDatumValue(newDatum) // ✅ Updated datum (use inline)
          .requiredSignerHash(signerHash) // ✅ Required for extra_signatories
          .changeAddress(walletAddress)
          .txInCollateral(
            collateral.input.txHash,
            collateral.input.outputIndex,
            collateral.output.amount,
            collateral.output.address
          )
          .selectUtxosFrom(utxos)
          .complete();

        console.log("✅ Transaction built successfully");
      } catch (buildError) {
        console.error("❌ Transaction build error:", buildError);
        const errorMessage =
          buildError &&
          typeof buildError === "object" &&
          "message" in buildError
            ? (buildError as any).message
            : String(buildError);
        throw new Error(`Failed to build transaction: ${errorMessage}`);
      }

      // Sign and submit
      console.log("✍️ Signing transaction...");
      const unsignedTx = txBuilder.txHex;

      try {
        const signedTx = await wallet.signTx(unsignedTx);
        console.log("✅ Transaction signed");

        console.log("📤 Submitting transaction...");
        const newTxHash = await wallet.submitTx(signedTx);

        console.log(`✅ Contract signed at Tx ID: ${newTxHash}`);
        return newTxHash;
      } catch (submitError) {
        console.error("❌ Transaction submission error:", submitError);

        // Enhanced error handling for submission errors
        if (submitError && typeof submitError === "object") {
          if ("code" in submitError && submitError.code === 2) {
            const info = (submitError as any).info;
            console.error("Transaction validation failed:", info);
          }
          if ("message" in submitError) {
            throw new Error(`Transaction failed: ${submitError.message}`);
          }
        }

        throw new Error(`Failed to submit transaction: ${submitError}`);
      }
    } catch (error) {
      console.error("❌ SignContract error:", error);

      // Log the full error details
      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      } else {
        console.error("Non-Error object thrown:", typeof error, error);
      }

      throw error;
    }
  }

  // Helper function to parse datum from UTxO
  parseDatum(utxo: UTxO): any {
    try {
      console.log("🔍 Parsing datum from UTxO...");

      let plutusDataHex: string;

      // Get the plutusData hex string
      if (
        utxo.output.plutusData &&
        typeof utxo.output.plutusData === "string"
      ) {
        plutusDataHex = utxo.output.plutusData;
      } else if (utxo.output.dataHash) {
        throw new Error(
          "Only datum hash found - inline datum required for parsing"
        );
      } else {
        throw new Error("No plutusData found in UTxO output");
      }

      console.log("PlutusData hex:", plutusDataHex.substring(0, 100) + "...");

      // Decode CBOR hex string using the cbor library
      const buffer = Buffer.from(plutusDataHex, "hex");
      const decodedData = cbor.decode(buffer);

      console.log("Decoded CBOR data:", decodedData);
      console.log("Decoded data type:", typeof decodedData);
      console.log("Is Tagged object:", decodedData.tag !== undefined);

      // Handle the Tagged object (CBOR tag 121 for Plutus Data)
      let fields;
      if (
        decodedData &&
        decodedData.tag === 121 &&
        Array.isArray(decodedData.value)
      ) {
        // Tagged object with Plutus Data constructor
        fields = decodedData.value;
        console.log(
          "✅ Found Tagged Plutus Data with",
          fields.length,
          "fields"
        );
      } else if (
        decodedData &&
        typeof decodedData === "object" &&
        decodedData.constructor === 0
      ) {
        // Constructor format: {constructor: 0, fields: [...]}
        fields = decodedData.fields;
      } else if (Array.isArray(decodedData)) {
        // Direct array format
        fields = decodedData;
      } else {
        throw new Error(
          `Unexpected decoded data format: ${typeof decodedData}, tag: ${
            decodedData?.tag
          }`
        );
      }

      if (!Array.isArray(fields)) {
        throw new Error(`Expected fields to be an array, got ${typeof fields}`);
      }

      if (fields.length !== 5) {
        console.error("Fields array:", fields);
        console.error("Fields length:", fields.length);
        console.error(
          "Fields types:",
          fields.map((f) => typeof f)
        );
        throw new Error(
          `Invalid datum structure. Expected 5 fields, got ${fields.length}`
        );
      }

      // Parse each field according to your ContractDatum structure
      const parsedDatum = {
        document_hash: this.parseField(fields[0], "document_hash"),
        required_signers: this.parseSignerArray(fields[1], "required_signers"),
        signatures_collected: this.parseSignerArray(
          fields[2],
          "signatures_collected"
        ),
        threshold: this.parseNumber(fields[3], "threshold"),
        contract_creator: this.parseKeyHash(fields[4], "contract_creator"),
      };

      console.log("✅ Parsed datum:", parsedDatum);
      return parsedDatum;
    } catch (error) {
      console.error("❌ Error parsing datum:", error);
      console.error(
        "UTxO output structure:",
        JSON.stringify(utxo.output, null, 2)
      );
      throw new Error(
        `Failed to parse contract datum: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // Helper methods for parsing individual fields
  private parseField(field: any, fieldName: string): string {
    try {
      if (typeof field === "string") {
        return field;
      } else if (field instanceof Uint8Array) {
        // Convert bytes to hex string for document hash
        return Buffer.from(field).toString("hex");
      } else if (Buffer.isBuffer(field)) {
        return field.toString("hex");
      } else {
        return String(field);
      }
    } catch (error) {
      throw new Error(`Failed to parse ${fieldName}: ${error}`);
    }
  }

  private parseSignerArray(field: any, fieldName: string): string[] {
    try {
      if (!Array.isArray(field)) {
        console.warn(`${fieldName} is not an array, got:`, typeof field, field);
        return [];
      }

      return field.map((item, index) => {
        if (typeof item === "string") {
          return item;
        } else if (item instanceof Uint8Array) {
          return Buffer.from(item).toString("hex");
        } else if (Buffer.isBuffer(item)) {
          return item.toString("hex");
        } else {
          console.warn(
            `Unexpected signer format at index ${index}:`,
            typeof item,
            item
          );
          return String(item);
        }
      });
    } catch (error) {
      throw new Error(`Failed to parse ${fieldName}: ${error}`);
    }
  }

  private parseNumber(field: any, fieldName: string): number {
    try {
      if (typeof field === "number") {
        return field;
      } else {
        const parsed = parseInt(String(field), 10);
        if (isNaN(parsed)) {
          throw new Error(`Cannot convert to number: ${field}`);
        }
        return parsed;
      }
    } catch (error) {
      throw new Error(`Failed to parse ${fieldName}: ${error}`);
    }
  }

  private parseKeyHash(field: any, fieldName: string): string {
    try {
      if (typeof field === "string") {
        return field;
      } else if (field instanceof Uint8Array) {
        return Buffer.from(field).toString("hex");
      } else if (Buffer.isBuffer(field)) {
        return field.toString("hex");
      } else {
        return String(field);
      }
    } catch (error) {
      throw new Error(`Failed to parse ${fieldName}: ${error}`);
    }
  }

  // Helper function to convert datum to CBOR
  datumToCbor(datum: any): any {
    return mConStr0([
      datum.document_hash,
      datum.required_signers,
      datum.signatures_collected,
      datum.threshold,
      datum.contract_creator,
    ]);
  }

  // Check if contract is fully signed
  isContractComplete(datum: ContractDatum): boolean {
    return datum.signatures_collected.length >= datum.threshold;
  }

  // Get contract status
  getContractStatus(datum: ContractDatum): {
    isComplete: boolean;
    signaturesCount: number;
    requiredCount: number;
    missingSigners: string[];
  } {
    const isComplete = this.isContractComplete(datum);
    const missingSigners = datum.required_signers.filter(
      (signer) => !datum.signatures_collected.includes(signer)
    );

    return {
      isComplete,
      signaturesCount: datum.signatures_collected.length,
      requiredCount: datum.threshold,
      missingSigners,
    };
  }

  // Validate contract data
  validateContractData(
    documentHash: string,
    requiredSigners: string[],
    threshold: number
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!documentHash || documentHash.trim().length === 0) {
      errors.push("Document hash is required");
    }

    if (!requiredSigners || requiredSigners.length === 0) {
      errors.push("At least one required signer is needed");
    }

    if (threshold <= 0) {
      errors.push("Threshold must be greater than 0");
    }

    if (threshold > requiredSigners.length) {
      errors.push(
        "Threshold cannot be greater than number of required signers"
      );
    }

    requiredSigners.forEach((signer, index) => {
      if (!signer || signer.trim().length === 0) {
        errors.push(`Signer ${index + 1} address is empty`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
