# Bitcoin - Smart Contract "Hello World"

Este tutorial te enseña a crear smart contracts **directamente en Bitcoin Script nativo**, sin abstracciones de alto nivel. Es el camino más profundo para entender Bitcoin desde sus fundamentos.

- ✅ **Bitcoin Script** - Programación stack-based desde cero
- ✅ **Hash preimage challenges** - Smart contracts simples pero poderosos
- ✅ **P2SH (Pay to Script Hash)** - Scripts personalizados con direcciones normales
- ✅ **Bitcoin Core** - Configuración y uso completo en testnet
- ✅ **Simulación vs Realidad** - Testing local + deployment real
- ✅ **UTXO Model** - Entender el modelo fundamental de Bitcoin

## 🚀 Quick Start

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/bitcoin-script-tutorial.git
cd bitcoin-script-tutorial
```

### 2. Test inmediato (sin instalación)
```bash
# Simulador local - funciona sin Bitcoin Core
node bitcoin_script_simulator.js
```

### 3. Para deployment real: Configurar Bitcoin Core

**Instalar Bitcoin Core:**
```bash
# macOS con Homebrew:
brew install bitcoin

# O descargar desde: https://bitcoin.org/en/download
```

**Crear configuración:**
```bash
mkdir -p ~/.bitcoin
nano ~/.bitcoin/bitcoin.conf
```

**Contenido del archivo `~/.bitcoin/bitcoin.conf`:**
```
# Bitcoin testnet configuration
testnet=1
server=1
rpcuser=bitcoinrpc
rpcpassword=TU_PASSWORD_SUPER_SEGURA_AQUI_123
rpcallowip=127.0.0.1
rpcport=18332
daemon=1

# Optional: Reduce storage
prune=2000

# Enable all RPC commands
rpcbind=127.0.0.1
```

**Iniciar Bitcoin Core testnet:**
```bash
bitcoind -testnet -daemon
```

**Verificar conexión:**
```bash
bitcoin-cli -testnet getblockchaininfo
```

## 📁 Scripts incluidos

| Script | Descripción | Requiere Bitcoin Core | Gasta Bitcoin |
|--------|-------------|----------------------|---------------|
| `bitcoin_script_simulator.js` | Simulador local stack-based | ❌ No | ❌ No |
| `create_real_contract.js` | Generador de contratos hex | ❌ No | ❌ No |
| `bitcoin_contract_summary.js` | Resumen y certificado | ❌ No | ❌ No |

### bitcoin_script_simulator.js
**Simulador completo de Bitcoin Script**
- Implementa stack-based programming
- Simula opcodes: OP_SHA256, OP_EQUAL
- Tests con mensajes correctos e incorrectos
- **100% local** - no requiere blockchain

```bash
node bitcoin_script_simulator.js
```

**Resultado esperado:**
```
🚀 === BITCOIN SCRIPT HELLO WORLD ===
🔐 === EJECUTANDO CONTRATO HASH ===
📝 Input: "hello world"
✅ OP_SHA256: 68656c6c6f20776f726c64 → b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
✅ OP_EQUAL: b94d27... == b94d27... → 01
🏁 Resultado final: ✅ ÉXITO
```

### create_real_contract.js
**Generador de contratos en hexadecimal**
- Crea locking scripts válidos para Bitcoin
- Genera unlocking scripts para diferentes mensajes
- Explica cómo funciona la ejecución combinada
- Output listo para usar con Bitcoin Core

```bash
node create_real_contract.js
```

### bitcoin_contract_summary.js
**Resumen completo y certificado de logros**
- Muestra tu smart contract completo
- Direcciones P2SH generadas automáticamente
- Comandos para deployment real
- Certificado de conceptos dominados

```bash
node bitcoin_contract_summary.js
```

## 🏆 Mi Smart Contract

### **Hash Preimage Challenge**

**Locking Script (hex):**
```
a820b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde987
```

**Decodificación:**
```
a8   = OP_SHA256
20   = PUSH 32 bytes  
b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9 = Hash objetivo
87   = OP_EQUAL
```

**¿Qué hace?**
Requiere conocer el preimage del hash SHA256 para gastar el Bitcoin. Solo quien sepa que el hash corresponde a "hello world" puede desbloquear los fondos.

**Direcciones P2SH generadas:**
- **Native SegWit:** `tb1qexuufael7vrza8vx5daz2hnzjfwk2e42ff5lmnqcq4zgvs57069qpd3fu4`
- **P2SH Legacy:** `2NE58e9bQeGMtQv1cWLDAupviC2g3Y96856`
- **P2SH-SegWit:** `2N1indjsdYEs8NqFCLkKytUeygwxAVVa7pW`

## 🔧 Verificar con Bitcoin Core

Una vez que tengas Bitcoin Core sincronizado:

```bash
# Verificar que el script es válido:
bitcoin-cli -testnet decodescript a820b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde987

# Crear billetera:
bitcoin-cli -testnet createwallet "helloworld"

# Obtener fondos de faucet para testing:
bitcoin-cli -testnet getnewaddress "test" "bech32"
```

**Faucets testnet gratuitos:**
- https://testnet-faucet.com/btc-testnet/
- https://coinfaucet.eu/en/btc-testnet/
- https://bitcoinfaucet.uo1.net/

## 🧠 Conceptos que dominarás

### **Bitcoin Script Fundamentals**
- **Stack-based programming** - LIFO (Last In, First Out)
- **Opcodes** - OP_SHA256, OP_EQUAL, PUSH operations
- **Execution flow** - Unlocking script + Locking script
- **Validation** - Pila final debe contener solo `01` (true)

### **Hash Preimage Challenges**
- **Preimage** - Valor original antes del hash
- **One-way function** - Fácil hash → difícil reverse
- **Verification** - Cualquiera puede verificar, pocos pueden resolver
- **Use cases** - Atomic swaps, Lightning Network, Time-locks

### **P2SH (Pay to Script Hash)**
- **Script hiding** - Solo se revela al gastar
- **Normal addresses** - Cualquier wallet puede enviar
- **Flexibility** - Scripts arbitrarios con direcciones estándar
- **Efficiency** - Script no está en blockchain hasta que se usa

### **UTXO Model**
- **Unspent Transaction Outputs** - Modelo fundamental de Bitcoin
- **Coin selection** - Cómo se eligen inputs
- **Change outputs** - Vuelto en transacciones
- **Script conditions** - Cada UTXO tiene condiciones para gastarlo

## 🌍 Casos de uso reales

Este tipo de contratos hash preimage se usan en:

- **⚡ Lightning Network** - HTLCs (Hash Time-Locked Contracts)
- **🔄 Atomic Swaps** - Intercambios cross-chain sin confianza
- **🌉 Cross-chain bridges** - Puentes entre blockchains
- **⏰ Time-locked payments** - Pagos condicionados por tiempo
- **🎰 Gambling protocols** - Juegos verificables

## 📚 Recursos adicionales

- **[Bitcoin Script Reference](https://en.bitcoin.it/wiki/Script)** - Documentación oficial
- **[Mastering Bitcoin](https://github.com/bitcoinbook/bitcoinbook)** - Libro técnico completo
- **[Bitcoin Testnet Explorer](https://blockstream.info/testnet/)** - Explorar transacciones
- **[Learn me a Bitcoin](https://learnmeabitcoin.com/)** - Tutoriales técnicos

## 🎓 Nivel alcanzado

Al completar este tutorial serás capaz de:

- 🎯 **Programar** directamente en Bitcoin Script
- 🎯 **Entender** el modelo UTXO profundamente  
- 🎯 **Crear** smart contracts personalizados
- 🎯 **Deployar** en Bitcoin testnet real
- 🎯 **Dominar** conceptos de bajo nivel

**Nivel: Desarrollador Bitcoin Expert** ⭐⭐⭐⭐⭐

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! 

1. Fork el proyecto
2. Crea una branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la branch (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

### Ideas para contribuir:
- 🔨 **Más tipos de contratos** (MultiSig, Timelock, etc.)
- 🧪 **Tests automatizados** para los scripts
- 📖 **Documentación** en otros idiomas
- 🐛 **Bug fixes** y mejoras
- 💡 **Ejemplos adicionales** de use cases

## 📜 Licencia

MIT License - ve [LICENSE](LICENSE) para detalles.
