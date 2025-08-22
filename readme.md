# Bitcoin MultiSig Implementation Example

A practical example of Bitcoin MultiSig 2-of-3 implementation using a hybrid approach combining Bitcoin Core and JavaScript.

## Overview

This project demonstrates how Bitcoin MultiSig transactions work at a technical level, including:
- P2WSH (Pay-to-Witness-Script-Hash) MultiSig creation
- Offline key generation and script construction
- Transaction signing with multiple keys
- Detailed opcode analysis and Bitcoin VM execution

**Warning: This is an example implementation for learning purposes. Do not use with real funds without proper security auditing.**

## Features

- **Hybrid Architecture**: Bitcoin Core for network operations + JavaScript for MultiSig handling
- **Complete Process**: From key generation to spending transactions
- **Detailed Documentation**: Step-by-step process with opcode analysis
- **Testnet Ready**: Safe testing environment with no real money risk
- **Pruned Node Support**: Works with minimal disk space (2GB blockchain)

## Project Structure

```
bitcoin-multisig-hybrid/
├── README.md                                   # This file
├── package.json                                # Node.js dependencies
├── multisig.js                                 # Main MultiSig operations
├── bitcoin-helper.js                           # Bitcoin Core interface
├── verify.js                                   # System verification and diagnostics
├── keys.json                                   # Generated keys (created after setup)
├── multisig.json                               # MultiSig data (created after setup)
├── Readme_Multisig.md                         # Complete step-by-step tutorial
├── Readme_explicacion_multisig_opcodes.md     # Deep technical analysis with opcodes
├── limpieza_completa_tutorial.md              # System cleanup and reset guide
├── multisig_proceso_detallado.md              # Original detailed process documentation
└── Mis_datos.txt                              # Example configuration file
```

## Quick Start

### Prerequisites

- Ubuntu/Debian Linux
- Bitcoin Core installed
- Node.js (v12 or higher)
- Basic command line knowledge

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/bitcoin-multisig-educational.git
   cd bitcoin-multisig-educational
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Bitcoin Core**
   ```bash
   cat > ~/.bitcoin/bitcoin.conf << 'EOF'
   testnet=1
   server=1
   rpcuser=your_username
   rpcpassword=your_secure_password
   prune=2000
   fallbackfee=0.00001
   maxconnections=40
   EOF
   ```

4. **Start Bitcoin Core**
   ```bash
   bitcoind -testnet -daemon
   ```

5. **Verify setup**
   ```bash
   node verify.js
   ```

## Usage

### Basic Commands

```bash
# Generate MultiSig 2-of-3 setup
node multisig.js generate

# Get MultiSig address
node multisig.js address

# Check system status
node verify.js

# Get Bitcoin Core status
node bitcoin-helper.js status
```

### Complete Workflow

1. **Generate MultiSig**
   ```bash
   node multisig.js generate
   MULTISIG_ADDR=$(node multisig.js address)
   echo "MultiSig Address: $MULTISIG_ADDR"
   ```

2. **Get testnet funds**
   ```bash
   FAUCET_ADDR=$(bitcoin-cli -testnet getnewaddress "faucet" "bech32")
   echo "Send testnet coins to: $FAUCET_ADDR"
   # Use faucets: coinfaucet.eu, testnet-faucet.mempool.co
   ```

3. **Send to MultiSig**
   ```bash
   bitcoin-cli -testnet sendtoaddress $MULTISIG_ADDR 0.0005
   ```

4. **Spend from MultiSig**
   ```bash
   # Get UTXO details first
   node bitcoin-helper.js utxo <txid> <vout>
   
   # Create spending transaction
   DEST=$(bitcoin-cli -testnet getnewaddress "destination" "bech32")
   node multisig.js spend <txid> <vout> <amount_sats> $DEST <send_amount_sats>
   ```

## Key Components

### multisig.js
Main script handling:
- Key generation (3 keys for 2-of-3 MultiSig)
- P2WSH address creation
- Transaction signing and construction
- PSBT (Partially Signed Bitcoin Transaction) handling

### bitcoin-helper.js
Interface with Bitcoin Core:
- UTXO management
- Transaction broadcasting
- Wallet operations
- Network status monitoring

### verify.js
System diagnostics:
- Bitcoin Core connectivity
- File integrity checks
- Balance verification
- Tutorial progress tracking

## Educational Value

This project teaches:

1. **Cryptographic Concepts**
   - ECDSA key pairs
   - Hash functions (SHA256, RIPEMD160)
   - Digital signatures

2. **Bitcoin Internals**
   - UTXO model
   - Script opcodes
   - Witness data structure
   - Transaction malleability protection

3. **MultiSig Security**
   - Threshold signatures
   - Key distribution
   - Recovery procedures

4. **Network Operations**
   - Testnet usage
   - Node synchronization
   - Transaction propagation

## Technical Details

### Script Structure
The MultiSig script uses these opcodes:
```
OP_2 <pubkey1> <pubkey2> <pubkey3> OP_3 OP_CHECKMULTISIG
```

### P2WSH Address Generation
```javascript
const witnessScript = bitcoin.script.compile([
    bitcoin.opcodes.OP_2,
    publicKey1, publicKey2, publicKey3,
    bitcoin.opcodes.OP_3,
    bitcoin.opcodes.OP_CHECKMULTISIG
]);

const scriptHash = bitcoin.crypto.sha256(witnessScript);
const address = bitcoin.address.toBech32(scriptHash, 0, network.bech32);
```

### Transaction Flow
1. **Privacy Phase**: Script hidden behind hash
2. **Funding Phase**: Coins sent to P2WSH address
3. **Spending Phase**: Script revealed in witness data
4. **Validation Phase**: Network executes opcodes

## Documentation Files

This repository includes comprehensive documentation covering different aspects of Bitcoin MultiSig:

### Core Documentation

- **[Readme_explicacion_multisig_opcodes.md](Readme_explicacion_multisig_opcodes.md)** - Complete technical implementation guide
  - Step-by-step process with detailed opcode analysis
  - Bitcoin VM execution walkthrough
  - Network state changes at each phase
  - Complete tutorial from setup to spending
  - Comparison between P2WSH and P2SH approaches

- **[multisig_proceso_detallado.md](multisig_proceso_detallado.md)** - Original detailed process documentation
  - Theoretical foundation of MultiSig operations
  - Cryptographic concepts and implementation details
  - Transaction flow and network interactions
  - Technical deep dive into the MultiSig mechanism

### Utility Documentation

- **[limpieza_completa_tutorial.md](limpieza_completa_tutorial.md)** - System cleanup guide
  - Complete environment reset procedures
  - Safe removal of testnet data
  - Project cleanup for fresh start
  - Verification steps for clean state

- **[Mis_datos.txt](Mis_datos.txt)** - Configuration example
  - Sample Bitcoin Core configuration
  - Required parameters for testnet operation
  - Security considerations for RPC settings

The main technical documentation is in `Readme_explicacion_multisig_opcodes.md`, which provides both the practical tutorial and the deep technical analysis with opcodes.

## Security Considerations

### Educational Use Only
- Keys stored in plain text JSON files
- All keys on same machine
- No hardware wallet integration
- Simplified error handling

### Production Differences
- Distribute keys across devices/people
- Use hardware wallets
- Implement proper key backup
- Add comprehensive validation
- Use mainnet with real security practices

## Troubleshooting

### Common Issues

1. **Bitcoin Core not responding**
   ```bash
   bitcoin-cli -testnet getblockchaininfo
   # If fails, restart: bitcoind -testnet -daemon
   ```

2. **Node.js dependencies**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Testnet synchronization**
   ```bash
   # Check sync progress
   node bitcoin-helper.js status
   ```

4. **UTXO not found**
   ```bash
   # Verify transaction confirmation
   bitcoin-cli -testnet gettransaction <txid>
   ```

## Contributing

This is an educational project. Contributions welcome for:
- Documentation improvements
- Additional educational examples
- Security best practices
- Code clarity enhancements

## References

- [Bitcoin Developer Documentation](https://developer.bitcoin.org/)
- [BIP 141 - Segregated Witness](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki)
- [BIP 143 - Transaction Signature Verification](https://github.com/bitcoin/bips/blob/master/bip-0143.mediawiki)
- [bitcoinjs-lib Documentation](https://github.com/bitcoinjs/bitcoinjs-lib)

## License

MIT License - See LICENSE file for details.

## Disclaimer

This software is for educational purposes only. The authors are not responsible for any loss of funds or security issues. Always test thoroughly on testnet before any mainnet usage. This implementation intentionally simplifies security for learning purposes and should not be used in production without significant security enhancements.

## Support

For educational questions or issues:
1. Check the troubleshooting section
2. Review the detailed documentation
3. Ensure you're using testnet only
4. Open an issue with full context and error messages

Remember: This is a learning tool, not production software!