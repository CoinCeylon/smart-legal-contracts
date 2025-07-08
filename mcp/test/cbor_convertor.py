import cbor2

def get_first_hash_from_cbor_hex(cbor_hex: str) -> str:
    try:
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
        else:
            raise TypeError("First field is not a byte array")

    except Exception as e:
        raise ValueError(f"Error extracting document hash: {e}")


inline_datum = "d8799f5840623935623133633732333664333330323833653732306263643164623765343763643733613861626438626138613737663465313235663161313434373539659f581c34c9af470aaff4f843ff7805ff9ff785fc1fe6af6c67baf7443800d6ff8001581c0fb7885eac82f0ea18abdea461c3911da8e88c0cf404b8d3f9e1d6cbff"
first_hash = get_first_hash_from_cbor_hex(inline_datum)
print(first_hash)