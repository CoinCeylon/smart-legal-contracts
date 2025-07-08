from typing import Dict, Any
from datetime import datetime

def format_transaction_data(tx_data: Dict[str, Any], utxo_data: Dict[str, Any]) -> str:
    """Format transaction data for better readability"""
    
    # Convert block time to readable format
    block_time = datetime.fromtimestamp(tx_data.get('block_time', 0)).strftime('%Y-%m-%d %H:%M:%S')
    
    # Calculate total input and output amounts
    total_input = sum(
        sum(int(amount.get('quantity', 0)) for amount in inp.get('amount', []))
        for inp in utxo_data.get('inputs', [])
    )
    
    total_output = sum(
        sum(int(amount.get('quantity', 0)) for amount in out.get('amount', []))
        for out in utxo_data.get('outputs', [])
    )
    
    fees = int(tx_data.get('fees', 0))
    
    formatted_data = f"""
    **Transaction Details:**
    
    **Basic Information:**
    - Transaction Hash: {tx_data.get('hash', 'N/A')}
    - Block: {tx_data.get('block', 'N/A')}
    - Block Height: {tx_data.get('block_height', 'N/A')}
    - Block Time: {block_time}
    - Slot: {tx_data.get('slot', 'N/A')}
    - Transaction Index: {tx_data.get('index', 'N/A')}
    
    **Financial Summary:**
    - Total Input: {total_input / 1_000_000:.6f} ADA
    - Total Output: {total_output / 1_000_000:.6f} ADA
    - Fees: {fees / 1_000_000:.6f} ADA
    - Net Amount: {(total_output - total_input) / 1_000_000:.6f} ADA
    
    **Transaction Status:**
    - Confirmations: Block confirmed
    - Size: {tx_data.get('size', 'N/A')} bytes
    """
    
    return formatted_data

def format_utxo_data(utxo_data: Dict[str, Any]) -> str:
    """Format UTXO data to show transaction flow"""
    
    analysis = "**Transaction Flow Analysis:**\n\n"
    
    # Format inputs
    inputs = utxo_data.get('inputs', [])
    if inputs:
        analysis += "**Inputs (Sources):**\n"
        for i, inp in enumerate(inputs, 1):
            address = inp.get('address', 'Unknown')
            amounts = inp.get('amount', [])
            ada_amount = next((int(amt['quantity']) for amt in amounts if amt['unit'] == 'lovelace'), 0)
            analysis += f"  {i}. Address: {address[:20]}...{address[-10:] if len(address) > 30 else address}\n"
            analysis += f"     Amount: {ada_amount / 1_000_000:.6f} ADA\n"
    
    analysis += "\n"
    
    # Format outputs
    outputs = utxo_data.get('outputs', [])
    if outputs:
        analysis += "**Outputs (Destinations):**\n"
        for i, out in enumerate(outputs, 1):
            address = out.get('address', 'Unknown')
            amounts = out.get('amount', [])
            ada_amount = next((int(amt['quantity']) for amt in amounts if amt['unit'] == 'lovelace'), 0)
            analysis += f"  {i}. Address: {address[:20]}...{address[-10:] if len(address) > 30 else address}\n"
            analysis += f"     Amount: {ada_amount / 1_000_000:.6f} ADA\n"
            
            # Check for native tokens
            native_tokens = [amt for amt in amounts if amt['unit'] != 'lovelace']
            if native_tokens:
                analysis += f"     Native Tokens: {len(native_tokens)} different tokens\n"
    
    return analysis

def format_address_summary(address_data: Dict[str, Any]) -> str:
    """Format address information summary"""
    
    amounts = address_data.get('amount', [])
    ada_balance = next((int(amt['quantity']) for amt in amounts if amt['unit'] == 'lovelace'), 0)
    
    summary = f"""
    **Address Summary:**
    - ADA Balance: {ada_balance / 1_000_000:.6f} ADA
    - Total Transactions: {address_data.get('tx_count', 0)}
    - Received Transactions: {address_data.get('received_sum', [{}])[0].get('quantity', 0) if address_data.get('received_sum') else 0}
    - Sent Transactions: {address_data.get('sent_sum', [{}])[0].get('quantity', 0) if address_data.get('sent_sum') else 0}
    """
    
    # Add native tokens if present
    native_tokens = [amt for amt in amounts if amt['unit'] != 'lovelace']
    if native_tokens:
        summary += f"\n**Native Tokens:** {len(native_tokens)} different tokens held"
    
    return summary
