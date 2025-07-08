import plutusScript from "@/data/plutus.json";
import {
  applyParamsToScript,
  BlockfrostProvider,
  MeshTxBuilder,
  serializePlutusScript,
  UTxO,
} from "@meshsdk/core";

const blockfrostApiKey = import.meta.env.VITE_API_BLOCKFROST_API_KEY;

export function getscript() {
  const scriptCbor = applyParamsToScript(
    plutusScript.validators[0].compiledCode,
    []
  );

  const scriptAddr = serializePlutusScript({
    code: scriptCbor,
    version: "V3",
  }).address;

  return { scriptCbor, scriptAddr };
}

const blockchainProvider = new BlockfrostProvider(blockfrostApiKey);

export function getTxBuilder() {
  return new MeshTxBuilder({
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
  });
}

// reusable function to get a UTxO by transaction hash
export async function getUtxoByTxHash(txHash: string): Promise<UTxO> {
  const utxos = await blockchainProvider.fetchUTxOs(txHash);
  if (utxos.length === 0) {
    throw new Error("UTxO not found");
  }
  return utxos[0];
}
