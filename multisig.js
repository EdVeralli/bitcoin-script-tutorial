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
                console.log(multiSig.multiSigData.address);
            } else {
                console.log('Primero ejecuta: node multisig.js generate');
                process.exit(1);
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