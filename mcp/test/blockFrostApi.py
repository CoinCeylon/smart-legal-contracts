from app.core.config import BLOCKFROST_PROJECT_ID
from blockfrost import BlockFrostApi, ApiError, ApiUrls
from types import SimpleNamespace
import requests
from datetime import datetime


api = BlockFrostApi(
    project_id=BLOCKFROST_PROJECT_ID,
    base_url=ApiUrls.preview.value,
)

def namespace_to_dict(ns):
    """Recursively convert Namespace/SimpleNamespace to dict."""
    if isinstance(ns, (SimpleNamespace,)):
        return {k: namespace_to_dict(v) for k, v in vars(ns).items()}
    elif isinstance(ns, list):
        return [namespace_to_dict(i) for i in ns]
    else:
        return ns

from langchain_core.tools import tool

@tool
def get_transaction_details(tx_hash: str) -> dict:
    """Get transaction details from Blockfrost API.
    Retrieves details of a specific transaction using its hash.
    example like hash, quantity, time, fees etc.

    Args:
        tx_hash (str): The hash of the transaction to retrieve details for.
    Returns:
        dict: A dictionary containing the transaction details or an error message.

    """
    try:
        tx_details = get_transactions_details_with_format(tx_hash)
        return f"transaction details: {tx_details}"
    except ApiError as e:
        return {"error": f"Failed to fetch transaction details: {str(e)}"}
    
def get_transactions_details_with_format(tx_hash: str) -> dict:
    """Get formatted transaction details from Blockfrost API."""
    try:
        tx = api.transaction(tx_hash)
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


    
if __name__ == "__main__":
    # Example usage
    address = "addr_test1wryf65umuw5nuh8m4sjh9dka0mx7pwsmle0uyex8pf7f4ycj7y6tp"
    tx_hash = "bcb8a9e84bacb3606756ecd93ebdf31fca671849bd7fb6eddcea16fac69c68a3"
    response = api.address('addr_test1wryf65umuw5nuh8m4sjh9dka0mx7pwsmle0uyex8pf7f4ycj7y6tp')

    output = ''
    response = namespace_to_dict(response)

    output += f"Address: {response['address']}\n"
    output += f"Stake Address: {response['stake_address']}\n"
    output += f"Script: {response['script']}\n"
    output += f"Current amount: {int(response['amount'][0]['quantity'])/1000000} ADA\n"

    print(output)
    
    
