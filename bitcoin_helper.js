#!/usr/bin/env node

const { execSync } = require('child_process');

class BitcoinHelper {
    // Ejecutar comando bitcoin-cli con manejo inteligente de respuesta
    static rpc(command, expectJson = true) {
        try {
            const result = execSync(`bitcoin-cli -testnet ${command}`, { encoding: 'utf8' });
            
            if (expectJson) {
                return JSON.parse(result);
            } else {
                return result.trim();
            }
        } catch (error) {
            throw new Error(`RPC Error: ${error.message}`);
        }
    }

    // Obtener información de UTXO
    static getUTXO(txid, vout) {
        try {
            const utxo = this.rpc(`gettxout ${txid} ${vout} true`, true);
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
            const txid = this.rpc(`sendrawtransaction ${txHex}`, false);
            return txid;
        } catch (error) {
            throw new Error(`Error transmitiendo: ${error.message}`);
        }
    }

    // Obtener balance
    static getBalance() {
        return parseFloat(this.rpc('getbalance', false));
    }

    // Generar nueva dirección
    static getNewAddress(label = '') {
        return this.rpc(`getnewaddress "${label}" "bech32"`, false);
    }

    // Obtener información de transacción
    static getTransaction(txid) {
        return this.rpc(`gettransaction ${txid}`, true);
    }

    // Listar UTXOs no gastados
    static listUnspent(minConf = 1, maxConf = 9999999, addresses = []) {
        let addressesStr = '';
        if (addresses.length > 0) {
            addressesStr = ` '${JSON.stringify(addresses)}'`;
        }
        return this.rpc(`listunspent ${minConf} ${maxConf}${addressesStr}`, true);
    }

    // Obtener información de la blockchain
    static getBlockchainInfo() {
        return this.rpc('getblockchaininfo', true);
    }

    // Obtener el número de bloque actual
    static getBlockCount() {
        return parseInt(this.rpc('getblockcount', false));
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
                if (!txid || isNaN(vout)) {
                    console.log('Uso: node bitcoin-helper.js utxo <txid> <vout>');
                    process.exit(1);
                }
                const utxo = BitcoinHelper.getUTXO(txid, vout);
                console.log(JSON.stringify(utxo, null, 2));
                break;

            case 'broadcast':
                const txHex = args[1];
                if (!txHex) {
                    console.log('Uso: node bitcoin-helper.js broadcast <hex>');
                    process.exit(1);
                }
                const result = BitcoinHelper.broadcastTransaction(txHex);
                console.log('Transacción transmitida:', result);
                break;

            case 'balance':
                console.log('Balance:', BitcoinHelper.getBalance());
                break;

            case 'address':
                const label = args[1] || 'generated';
                console.log(BitcoinHelper.getNewAddress(label));
                break;

            case 'transaction':
                const getTxid = args[1];
                if (!getTxid) {
                    console.log('Uso: node bitcoin-helper.js transaction <txid>');
                    process.exit(1);
                }
                const txInfo = BitcoinHelper.getTransaction(getTxid);
                console.log(JSON.stringify(txInfo, null, 2));
                break;

            case 'listutxos':
                const minConf = parseInt(args[1]) || 1;
                const maxConf = parseInt(args[2]) || 9999999;
                const utxos = BitcoinHelper.listUnspent(minConf, maxConf);
                console.log(JSON.stringify(utxos, null, 2));
                break;

            case 'blockinfo':
                const blockInfo = BitcoinHelper.getBlockchainInfo();
                console.log(JSON.stringify(blockInfo, null, 2));
                break;

            case 'blockcount':
                console.log('Block count:', BitcoinHelper.getBlockCount());
                break;

            case 'status':
                const status = BitcoinHelper.getBlockchainInfo();
                console.log('=== ESTADO BITCOIN CORE ===');
                console.log(`Red: ${status.chain}`);
                console.log(`Bloques: ${status.blocks}`);
                console.log(`Progreso: ${(status.verificationprogress * 100).toFixed(2)}%`);
                console.log(`Pruneado: ${status.pruned}`);
                console.log(`Balance wallet: ${BitcoinHelper.getBalance()} tBTC`);
                break;

            default:
                console.log('Comandos disponibles:');
                console.log('  utxo <txid> <vout>         - Obtener información de UTXO');
                console.log('  broadcast <hex>            - Transmitir transacción');
                console.log('  balance                    - Ver balance del wallet');
                console.log('  address [label]            - Generar nueva dirección');
                console.log('  transaction <txid>         - Ver información de transacción');
                console.log('  listutxos [minConf] [maxConf] - Listar UTXOs no gastados');
                console.log('  blockinfo                  - Información de la blockchain');
                console.log('  blockcount                 - Número de bloque actual');
                console.log('  status                     - Estado completo del nodo');
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