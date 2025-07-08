import requests
import cbor2
from datetime import datetime
from types import SimpleNamespace
from typing import Dict, Any
from langchain_core.tools import tool
from app.core.config import BLOCKFROST_PROJECT_ID
from blockfrost import BlockFrostApi, ApiError, ApiUrls
from app.utils.data_formatter import format_transaction_data, format_utxo_data
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BlockfrostClient:
    def __init__(self):
        self.project_id = BLOCKFROST_PROJECT_ID
        self.base_url = ApiUrls.preview.value

        self.api = BlockFrostApi(
            project_id=self.project_id,
            base_url=self.base_url
        )
    
    def get_transaction(self, tx_hash: str) -> Dict[str, Any]:
        """Get transaction details from Blockfrost API"""
        try:
            url = f"{self.base_url}/txs/{tx_hash}"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": f"Failed to fetch transaction: {str(e)}"}
    
    def get_transaction_utxos(self, tx_hash: str) -> Dict[str, Any]:
        """Get transaction UTXOs from Blockfrost API"""
        try:
            url = f"{self.base_url}/txs/{tx_hash}/utxos"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": f"Failed to fetch UTXOs: {str(e)}"}
    
    def get_address_info(self, address: str) -> Dict[str, Any]:
        """Get address information from Blockfrost API"""
        try:
            # url = f"{self.base_url}/addresses/{address}"
            # response = requests.get(url, headers=self.headers)
            # response.raise_for_status()
            # return response.json()
            response = self.api.address(address=address)
            return response
        except requests.exceptions.RequestException as e:
            return {"error": f"Failed to fetch address info: {str(e)}"}

# Initialize Blockfrost client
blockfrost_client = BlockfrostClient()

@tool
def get_cardano_transaction(tx_hash: str) -> str:
    """
    Retrieve detailed information about a Cardano transaction using its hash.
    
    Args:
        tx_hash: The transaction hash (64-character hexadecimal string)
    
    Returns:
        Formatted transaction information including block details, amounts, and fees
    """
    if not tx_hash or len(tx_hash) != 64:
        return "Invalid transaction hash. Please provide a 64-character hexadecimal string."
    
    # Get transaction details
    tx_data = blockfrost_client.get_transaction(tx_hash)
    if "error" in tx_data:
        return f"Error fetching transaction: {tx_data['error']}"
    
    # Get UTXOs for input/output details
    utxo_data = blockfrost_client.get_transaction_utxos(tx_hash)
    if "error" in utxo_data:
        return f"Error fetching UTXOs: {utxo_data['error']}"
    
    # Format the data for better readability
    formatted_data = format_transaction_data(tx_data, utxo_data)
    return formatted_data

@tool
def get_cardano_address_info(address: str) -> str:
    """
    Retrieve information about a Cardano address including balance and transaction history.
    
    Args:
        address: The Cardano address to query
    
    Returns:
        Formatted address information including balance and recent activity
    """
    if not address:
        return "Invalid address. Please provide a valid Cardano address."
    
    address_data = blockfrost_client.get_address_info(address)
    if "error" in address_data:
        return f"Error fetching address info: {address_data['error']}"
    
    # Format address data
    formatted_info = f"""
    **Address Information:**
    - Address: {address}
    - Balance: {address_data.get('amount', [{}])[0].get('quantity', 'N/A')} lovelace
    - Transaction Count: {address_data.get('tx_count', 'N/A')}
    - Controlled Amount: {address_data.get('controlled_amount', 'N/A')}
    """
    
    return formatted_info

@tool
def analyze_transaction_flow(tx_hash: str) -> str:
    """
    Analyze the flow of assets in a Cardano transaction, showing inputs and outputs.
    
    Args:
        tx_hash: The transaction hash to analyze
    
    Returns:
        Analysis of asset flow including sender/receiver addresses and amounts
    """
    if not tx_hash or len(tx_hash) != 64:
        return "Invalid transaction hash. Please provide a 64-character hexadecimal string."
    
    # Get transaction and UTXO data
    tx_data = blockfrost_client.get_transaction(tx_hash)
    utxo_data = blockfrost_client.get_transaction_utxos(tx_hash)
    
    if "error" in tx_data or "error" in utxo_data:
        return "Error fetching transaction data for analysis."
    
    analysis = format_utxo_data(utxo_data)
    return analysis

def pull_the_data_from_blockfrost_api(adderss: str):
    api = BlockFrostApi(
            project_id=BLOCKFROST_PROJECT_ID,
            base_url=ApiUrls.preview.value
        )
    
    output = ""
    transaction = api.address(address=adderss)
    transaction = namespace_to_dict(transaction)

    output += f"Address: {transaction['address']}\n"
    output += f"Stake Address: {transaction['stake_address']}\n"
    output += f"Script: {transaction['script']}\n"
    output += f"Current amount: {int(transaction['amount'][0]['quantity'])/1000000} ADA\n"

    return output


@tool
def get_address_details(address: str) -> str:
    """
    Get transaction details from Blockfrost API.
    
    Args:
        tx_hash: The transaction address to retrieve details for.
    
    Returns:
        A string containing the transaction details or an error message.
    """
    try:
        details = pull_the_data_from_blockfrost_api(address)
        return f"Transaction details for {address}: {details}"
    except Exception as e:
        logger.error(f"Error fetching transaction details for {address}: {e}")
        return f"Failed to fetch transaction details for {address}: {str(e)}"
    
@tool
def get_first_hash_from_cbor_hex(cbor_hex: str) -> str:
    """
    Decodes a Cardano CBOR hex string and returns the first hash (as hex string)

    Args:
        cbor_hex (str): The CBOR hex string to decode.
        
    Returns:
        str: 
    """
    try:
        first_hash = fun_get_first_hash_from_cbor_hex(cbor_hex)
        if first_hash:
            return f"First hash found: {first_hash}"
        else:
            return "No valid hash found in the provided CBOR hex string : {first_hash}"
    except Exception as e:
        logger.error(f"Error decoding CBOR hex string: {e}")
        return f"Failed to decode CBOR hex string: {str(e)}"


def fun_get_first_hash_from_cbor_hex(cbor_hex: str) -> str:
    # Remove 0x prefix if exists
    if cbor_hex.startswith('0x'):
        cbor_hex = cbor_hex[2:]

    # Convert hex to bytes
    cbor_bytes = bytes.fromhex(cbor_hex)
    decoded = cbor2.loads(cbor_bytes)

    # Handle Plutus Constr (CBOR tag 121)
    if isinstance(decoded, cbor2.CBORTag) and decoded.tag == 121:
        fields = decoded.value
    elif isinstance(decoded, dict) and 'fields' in decoded:
        fields = decoded['fields']
    elif isinstance(decoded, list):
        fields = decoded
    else:
        raise ValueError("Unsupported CBOR structure")

    first_field = fields[0]
    if isinstance(first_field, (bytes, bytearray)):
        return first_field.decode('utf-8')
    return None  # Return None if the first field is not a byte array or if no valid hash is found


## transaction history tool

def namespace_to_dict(ns):
    """Recursively convert Namespace/SimpleNamespace to dict."""
    if isinstance(ns, (SimpleNamespace,)):
        return {k: namespace_to_dict(v) for k, v in vars(ns).items()}
    elif isinstance(ns, list):
        return [namespace_to_dict(i) for i in ns]
    else:
        return ns

@tool
def get_transactions_for_address(address: str) -> str:
    """
    Get transactions for a given Cardano address.
    
    Args:
        address (str): The Cardano address to query.
        
    Returns:
        str: A string representation of the transactions.
    """
    try:
        details = get_transactions_details(address)
        print("=====================")
        print("get_transactios_for_address tool triggered")
        print("=====================")
        return details
    except ApiError as e:
        return f"Error fetching transactions: {e}"
    
def get_transactions_details(address: str) -> str:
    output = "Latest 5 transactions for address:\n"

    try:
        transactions = blockfrost_client.api.address_transactions(address=address, count=5, order="desc")
        transactions = namespace_to_dict(transactions)

        for tx in transactions:
            tx_hash = tx['tx_hash']
            timestamp = tx['block_time']
            readable_time = datetime.fromtimestamp(timestamp)
            output += f"Transaction Hash: {tx_hash}\n"
            output += f"Timestamp: {readable_time}\n"
            output += "-" * 50 + "\n"

        return output if output else "No transactions found for this address."
    except ApiError as e:
        return f"Error fetching transactions: {e}"
    
@tool
def get_single_transaction_details(tx_hash: str) -> dict:
    """Get single transaction details from Blockfrost API.
    Retrieves details of a specific transaction using its hash.
    example like hash, quantity, time, fees etc.

    Args:
        tx_hash (str): The hash of the transaction to retrieve details for.
    Returns:
        dict: A dictionary containing the transaction details or an error message.

    """
    try:
        tx_details = get_transactions_details_with_format(tx_hash)
        print("=====================")
        print("get_single_transaction_details tool triggered")
        print("=====================")
        return f"transaction details: {tx_details}"
    except ApiError as e:
        return {"error": f"Failed to fetch transaction details: {str(e)}"}
    
def get_transactions_details_with_format(tx_hash: str) -> dict:
    """Get formatted transaction details from Blockfrost API."""
    try:
        tx = blockfrost_client.api.transaction(tx_hash)
        tx_dict = namespace_to_dict(tx)
        format_data = {
            "hash": tx_dict.get("hash"),
            "time": datetime.fromtimestamp(tx_dict.get("block_time")).isoformat(),
            "fee": tx_dict.get("fees"),
            "Change ADA amount": float(tx_dict.get("output_amount")[0].get("quantity"))/1000000
        }
        return format_data

    except ApiError as e:
        return {"error": f"Failed to fetch transaction details: {str(e)}"}