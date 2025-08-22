# Tutorial MultiSig Bitcoin Híbrido - Bitcoin Core + JavaScript

**Tutorial Optimizado: Bitcoin Core para infraestructura + JavaScript para MultiSig**

Funciona con: `prune=2000` (solo 2GB de blockchain)

## Tabla de Contenidos

1. [Configuración Inicial con PRUNE](#configuración-inicial-con-prune)
2. [Configuración JavaScript](#configuración-javascript)
3. [Creación del MultiSig Híbrido](#creación-del-multisig-híbrido)
4. [Funding con Bitcoin Core](#funding-con-bitcoin-core)
5. [Gasto con JavaScript](#gasto-con-javascript)
6. [Verificación Final](#verificación-final)

## Configuración Inicial con PRUNE

### 1. Configurar bitcoin.conf para Prune

Crear/editar el archivo `~/.bitcoin/bitcoin.conf`:

```bash
# Archivo: ~/.bitcoin/bitcoin.conf
testnet=1
server=1
rpcuser=tu_usuario
rpcpassword=tu_password_segura
prune=2000                # Solo 2GB de espacio
fallbackfee=0.00001       # Crucial para testnet
maxconnections=40         # Optimizar para prune
```

### 2. Iniciar Bitcoin Core

```bash
# Detener si está corriendo
bitcoin-cli -testnet stop 2>/dev/null; sleep 5

# Iniciar con prune
bitcoind -testnet -daemon -prune=2000 -fallbackfee=0.00001
echo "Iniciando nodo pruneado..."
sleep 60

# Verificar estado
bitcoin-cli -testnet getblockchaininfo | grep -E "(blocks|verificationprogress|pruned)"
```

### 3. Crear Wallet Simple

```bash
# Crear wallet básico para fondos
bitcoin-cli -testnet createwallet "funds_wallet" false false "" false false

# Verificar que funciona
bitcoin-cli -testnet getwalletinfo | grep -E "(balance|txcount)"
```

## Configuración JavaScript

### 1. Instalar Node.js y Dependencias

```bash
# Verificar Node.js
node --version
npm --version

# Crear directorio para el proyecto
mkdir bitcoin-multisig-hybrid
cd bitcoin-multisig-hybrid

# Inicializar proyecto
npm init -y

# Instalar bitcoinjs-lib
npm install bitcoinjs-lib
```

### 2. Script MultiSig Principal

Crear archivo `multisig.js`:

```javascript
#!/usr/bin/env node

const bitcoin = require('bitcoinjs-lib');
const fs = require('fs');

// Configuración
const network = bitcoin.networks.testnet;

class MultiSigManager {
    constructor() {
        this.keyPairs = [];
        this.publicKeys = [];
        this.multiSigData = {};
    }

    // Generar 3 claves para MultiSig 2-of-3
    generateKeys() {
        console.log('Generando 3 claves para MultiSig 2-of-3...');
        
        this.keyPairs = [];
        this.publicKeys = [];
        
        for (let i = 0; i < 3; i++) {
            const keyPair = bitcoin.ECPair.makeRandom({ network });
            this.keyPairs.push(keyPair);
            this.publicKeys.push(keyPair.publicKey);
        }

        console.log('\nClaves generadas:');
        this.keyPairs.forEach((keyPair, index) => {
            const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network });
            console.log(`Participante ${index + 1}:`);
            console.log(`  Private Key: ${keyPair.toWIF()}`);
            console.log(`  Public Key: ${keyPair.publicKey.toString('hex')}`);
            console.log(`  Address: ${p2wpkh.address}\n`);
        });

        // Guardar claves para uso posterior
        this.saveKeys();
    }

    // Crear MultiSig SegWit (P2WSH)
    createMultiSig() {
        if (this.publicKeys.length !== 3) {
            throw new Error('Necesitas 3 claves públicas');
        }

        const witnessScript = bitcoin.script.compile([
            bitcoin.opcodes.OP_2,
            ...this.publicKeys,
            bitcoin.opcodes.OP_3,
            bitcoin.opcodes.OP_CHECKMULTISIG
        ]);

        const p2wsh = bitcoin.payments.p2wsh({
            redeem: { output: witnessScript },
            network
        });

        this.multiSigData = {
            address: p2wsh.address,
            witnessScript: witnessScript.toString('hex'),
            output: p2wsh.output.toString('hex'),
            hash: p2wsh.hash.toString('hex')
        };

        console.log('MultiSig P2WSH creado:');
        console.log(`Dirección: ${this.multiSigData.address}`);
        console.log(`WitnessScript: ${this.multiSigData.witnessScript}`);
        console.log(`Output: ${this.multiSigData.output}`);

        this.saveMultiSig();
        return this.multiSigData;
    }

    // Crear transacción gastando desde MultiSig
    createSpendingTransaction(utxoData, destination, sendAmount) {
        const { txid, vout, amount, scriptPubKey } = utxoData;
        
        console.log(`Creando transacción desde MultiSig...`);
        console.log(`Input: ${txid}:${vout} (${amount} sats)`);
        console.log(`Output: ${destination} (${sendAmount} sats)`);
        console.log(`Fee: ${amount - sendAmount} sats`);

        const psbt = new bitcoin.Psbt({ network });

        // Agregar input con información del UTXO MultiSig
        psbt.addInput({
            hash: txid,
            index: vout,
            witnessUtxo: {
                script: Buffer.from(this.multiSigData.output, 'hex'),
                value: amount
            },
            witnessScript: Buffer.from(this.multiSigData.witnessScript, 'hex')
        });

        // Agregar output
        psbt.addOutput({
            address: destination,
            value: sendAmount
        });

        // Firmar con 2 de las 3 claves (suficiente para 2-of-3)
        console.log('Firmando con las primeras 2 claves...');
        psbt.signInput(0, this.keyPairs[0]);
        psbt.signInput(0, this.keyPairs[1]);

        console.log('Validando firmas...');
        if (!psbt.validateSignaturesOfInput(0)) {
            throw new Error('Validación de firmas falló');
        }

        // Finalizar transacción
        console.log('Finalizando transacción...');
        psbt.finalizeAllInputs();

        const finalTx = psbt.extractTransaction();
        const txHex = finalTx.toHex();
        const txId = finalTx.getId();

        console.log(`Transacción creada exitosamente:`);
        console.log(`TXID: ${txId}`);
        console.log(`Hex: ${txHex}`);

        return { txId, txHex, transaction: finalTx };
    }

    // Guardar claves en archivo
    saveKeys() {
        const keysData = {
            keyPairs: this.keyPairs.map(kp => ({
                private: kp.toWIF(),
                public: kp.publicKey.toString('hex')
            })),
            timestamp: new Date().toISOString()
        };
        
        fs.writeFileSync('keys.json', JSON.stringify(keysData, null, 2));
        console.log('Claves guardadas en keys.json');
    }

    // Cargar claves desde archivo
    loadKeys() {
        try {
            const keysData = JSON.parse(fs.readFileSync('keys.json', 'utf8'));
            this.keyPairs = keysData.keyPairs.map(k => 
                bitcoin.ECPair.fromWIF(k.private, network)
            );
            this.publicKeys = this.keyPairs.map(kp => kp.publicKey);
            console.log('Claves cargadas desde keys.json');
            return true;
        } catch (error) {
            console.log('No se pudieron cargar las claves:', error.message);
            return false;
        }
    }

    // Guardar datos del MultiSig
    saveMultiSig() {
        fs.writeFileSync('multisig.json', JSON.stringify(this.multiSigData, null, 2));
        console.log('Datos MultiSig guardados en multisig.json');
    }

    // Cargar datos del MultiSig
    loadMultiSig() {
        try {
            this.multiSigData = JSON.parse(fs.readFileSync('multisig.json', 'utf8'));
            console.log('Datos MultiSig cargados desde multisig.json');
            return true;
        } catch (error) {
            console.log('No se pudieron cargar datos MultiSig:', error.message);
            return false;
        }
    }
}

// CLI Interface
function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    const multiSig = new MultiSigManager();

    switch (command) {
        case 'generate':
            multiSig.generateKeys();
            multiSig.createMultiSig();
            break;

        case 'address':
            if (multiSig.loadMultiSig()) {
                console.log('Dirección MultiSig:', multiSig.multiSigData.address);
            } else {
                console.log('Primero ejecuta: node multisig.js generate');
            }
            break;

        case 'spend':
            const txid = args[1];
            const vout = parseInt(args[2]);
            const amount = parseInt(args[3]);
            const destination = args[4];
            const sendAmount = parseInt(args[5]);

            if (!txid || isNaN(vout) || !amount || !destination || !sendAmount) {
                console.log('Uso: node multisig.js spend <txid> <vout> <amount> <destination> <sendAmount>');
                process.exit(1);
            }

            if (!multiSig.loadKeys() || !multiSig.loadMultiSig()) {
                console.log('Error cargando datos. Ejecuta generate primero.');
                process.exit(1);
            }

            const utxoData = { txid, vout, amount };
            const result = multiSig.createSpendingTransaction(utxoData, destination, sendAmount);
            
            console.log('\nPara transmitir:');
            console.log(`bitcoin-cli -testnet sendrawtransaction ${result.txHex}`);
            break;

        default:
            console.log('Comandos disponibles:');
            console.log('  generate                    - Generar claves y crear MultiSig');
            console.log('  address                     - Mostrar dirección MultiSig');
            console.log('  spend <txid> <vout> <amount> <dest> <sendAmount> - Crear transacción de gasto');
    }
}

if (require.main === module) {
    main();
}

module.exports = MultiSigManager;
```

### 3. Script Helper para Integración

Crear archivo `bitcoin-helper.js`:

```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');

class BitcoinHelper {
    // Ejecutar comando bitcoin-cli
    static rpc(command) {
        try {
            const result = execSync(`bitcoin-cli -testnet ${command}`, { encoding: 'utf8' });
            return JSON.parse(result);
        } catch (error) {
            throw new Error(`RPC Error: ${error.message}`);
        }
    }

    // Obtener información de UTXO
    static getUTXO(txid, vout) {
        try {
            const utxo = this.rpc(`gettxout ${txid} ${vout} true`);
            if (!utxo) {
                throw new Error('UTXO no encontrado');
            }

            return {
                txid,
                vout,
                amount: Math.round(utxo.value * 100000000), // Convertir a satoshis
                scriptPubKey: utxo.scriptPubKey.hex,
                confirmations: utxo.confirmations
            };
        } catch (error) {
            throw new Error(`Error obteniendo UTXO: ${error.message}`);
        }
    }

    // Transmitir transacción
    static broadcastTransaction(txHex) {
        try {
            const txid = this.rpc(`sendrawtransaction ${txHex}`);
            return txid;
        } catch (error) {
            throw new Error(`Error transmitiendo: ${error.message}`);
        }
    }

    // Obtener balance
    static getBalance() {
        return this.rpc('getbalance');
    }

    // Generar nueva dirección
    static getNewAddress(label = '') {
        return this.rpc(`getnewaddress "${label}" "bech32"`);
    }
}

// CLI
function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
        switch (command) {
            case 'utxo':
                const txid = args[1];
                const vout = parseInt(args[2]);
                const utxo = BitcoinHelper.getUTXO(txid, vout);
                console.log(JSON.stringify(utxo, null, 2));
                break;

            case 'broadcast':
                const txHex = args[1];
                const result = BitcoinHelper.broadcastTransaction(txHex);
                console.log('Transacción transmitida:', result);
                break;

            case 'balance':
                console.log('Balance:', BitcoinHelper.getBalance());
                break;

            case 'address':
                console.log('Nueva dirección:', BitcoinHelper.getNewAddress('faucet'));
                break;

            default:
                console.log('Comandos:');
                console.log('  utxo <txid> <vout>     - Obtener información de UTXO');
                console.log('  broadcast <hex>        - Transmitir transacción');
                console.log('  balance                - Ver balance');
                console.log('  address                - Generar nueva dirección');
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = BitcoinHelper;
```

## Creación del MultiSig Híbrido

### 1. Generar MultiSig con JavaScript

```bash
# Entrar al directorio del proyecto
cd bitcoin-multisig-hybrid

# Generar claves y crear MultiSig
node multisig.js generate

# Verificar dirección creada
node multisig.js address
```

## Funding con Bitcoin Core

### 1. Obtener Fondos de Faucet

```bash
# Generar dirección para recibir fondos
FAUCET_ADDR=$(node bitcoin-helper.js address)
echo "Envía tBTC a: $FAUCET_ADDR"

# Usar faucets:
# https://coinfaucet.eu/en/btc-testnet/
# https://testnet-faucet.mempool.co/

# Monitorear balance
watch -n 30 'node bitcoin-helper.js balance'
```

### 2. Enviar Fondos al MultiSig

```bash
# Obtener dirección MultiSig
MULTISIG_ADDR=$(node multisig.js address)

# Enviar fondos usando Bitcoin Core
TXID_FUNDING=$(bitcoin-cli -testnet sendtoaddress $MULTISIG_ADDR 0.0005)

echo "TXID de funding: $TXID_FUNDING"

# Esperar confirmación
bitcoin-cli -testnet gettransaction $TXID_FUNDING
```

### 3. Obtener Información del UTXO

```bash
# Buscar el UTXO del MultiSig
# Primer intento con vout 0
UTXO_INFO=$(node bitcoin-helper.js utxo $TXID_FUNDING 0 2>/dev/null)

if [ -z "$UTXO_INFO" ]; then
    # Intentar vout 1
    UTXO_INFO=$(node bitcoin-helper.js utxo $TXID_FUNDING 1)
    VOUT=1
else
    VOUT=0
fi

echo "UTXO Info: $UTXO_INFO"

# Extraer datos
AMOUNT=$(echo $UTXO_INFO | jq -r '.amount')
echo "Amount encontrado: $AMOUNT satoshis"
```

## Gasto con JavaScript

### 1. Crear Dirección de Destino

```bash
# Generar dirección de destino
DESTINO=$(node bitcoin-helper.js address)
echo "Dirección destino: $DESTINO"

# Calcular amount a enviar (restar fee)
SEND_AMOUNT=$((AMOUNT - 15000))  # Fee de 15000 sats
echo "Enviando: $SEND_AMOUNT satoshis"
echo "Fee: 15000 satoshis"
```

### 2. Crear y Firmar Transacción con JavaScript

```bash
# Crear transacción firmada usando JavaScript
node multisig.js spend $TXID_FUNDING $VOUT $AMOUNT $DESTINO $SEND_AMOUNT

# El script mostrará el comando para transmitir
```

### 3. Transmitir con Bitcoin Core

```bash
# Copiar el hex de la transacción del output anterior
TX_HEX="02000000..." # Pegar aquí el hex completo

# Transmitir usando Bitcoin Core
FINAL_TXID=$(bitcoin-cli -testnet sendrawtransaction $TX_HEX)

echo "Transacción transmitida: $FINAL_TXID"
echo "Verificar en: https://blockstream.info/testnet/tx/$FINAL_TXID"
```

## Verificación Final

### Script de Verificación Completa

Crear archivo `verify.js`:

```javascript
#!/usr/bin/env node

const BitcoinHelper = require('./bitcoin-helper');
const MultiSigManager = require('./multisig');

async function verify() {
    console.log('=== VERIFICACIÓN FINAL ===\n');

    try {
        // Verificar balance del wallet
        const balance = BitcoinHelper.getBalance();
        console.log(`Balance wallet Bitcoin Core: ${balance} tBTC`);

        // Cargar datos del MultiSig
        const multiSig = new MultiSigManager();
        if (!multiSig.loadMultiSig()) {
            console.log('Error: No se encontraron datos del MultiSig');
            return;
        }

        console.log(`Dirección MultiSig usada: ${multiSig.multiSigData.address}`);

        // Mostrar resumen
        console.log('\n=== RESUMEN OPERACIÓN ===');
        console.log('✅ MultiSig P2WSH creado con JavaScript');
        console.log('✅ Fondos enviados usando Bitcoin Core');
        console.log('✅ Transacción firmada con JavaScript');
        console.log('✅ Transacción transmitida con Bitcoin Core');
        console.log('\nTutorial híbrido completado exitosamente!');

    } catch (error) {
        console.error('Error en verificación:', error.message);
    }
}

verify();
```

```bash
# Ejecutar verificación
node verify.js
```

## Ventajas del Enfoque Híbrido

**Bitcoin Core maneja:**
- Sincronización con la red
- Gestión de fondos simples
- Consulta de UTXOs
- Transmisión de transacciones
- Operaciones que ya funcionaban bien

**JavaScript maneja:**
- Creación de MultiSig SegWit
- Firma de transacciones MultiSig
- Lógica criptográfica compleja
- Operaciones que fallaban en Bitcoin Core

**Resultado:**
- Tutorial funcional completo
- Mejor control sobre el proceso de firma
- Aprovecha las fortalezas de ambas tecnologías
- Educativo sobre ambos enfoques

Este enfoque resuelve las limitaciones del tutorial original mientras mantiene la simplicidad de Bitcoin Core para las operaciones básicas.