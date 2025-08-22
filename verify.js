#!/usr/bin/env node

const BitcoinHelper = require('./bitcoin-helper');
const MultiSigManager = require('./multisig');

async function verify() {
    console.log('=== VERIFICACIÓN FINAL ===\n');

    try {
        // Verificar estado de Bitcoin Core
        console.log('1. Verificando Bitcoin Core...');
        const blockInfo = BitcoinHelper.getBlockchainInfo();
        console.log(`   Red: ${blockInfo.chain}`);
        console.log(`   Bloques: ${blockInfo.blocks}`);
        console.log(`   Sincronizado: ${(blockInfo.verificationprogress * 100).toFixed(2)}%`);
        console.log(`   Pruneado: ${blockInfo.pruned ? 'Sí' : 'No'}`);

        // Verificar balance del wallet
        console.log('\n2. Verificando wallet Bitcoin Core...');
        const balance = BitcoinHelper.getBalance();
        console.log(`   Balance: ${balance} tBTC`);

        // Cargar y verificar datos del MultiSig
        console.log('\n3. Verificando datos MultiSig...');
        const multiSig = new MultiSigManager();
        
        if (!multiSig.loadKeys()) {
            console.log('   ❌ No se encontraron claves MultiSig');
            console.log('   💡 Ejecuta: node multisig.js generate');
            return;
        }
        
        if (!multiSig.loadMultiSig()) {
            console.log('   ❌ No se encontraron datos MultiSig');
            console.log('   💡 Ejecuta: node multisig.js generate');
            return;
        }

        console.log(`   ✅ Claves cargadas: ${multiSig.keyPairs.length}`);
        console.log(`   ✅ Dirección MultiSig: ${multiSig.multiSigData.address}`);

        // Verificar archivos de configuración
        console.log('\n4. Verificando archivos...');
        const fs = require('fs');
        
        const files = ['keys.json', 'multisig.json'];
        files.forEach(file => {
            if (fs.existsSync(file)) {
                const stats = fs.statSync(file);
                console.log(`   ✅ ${file} (${stats.size} bytes)`);
            } else {
                console.log(`   ❌ ${file} no encontrado`);
            }
        });

        // Verificar UTXOs recientes
        console.log('\n5. Verificando UTXOs...');
        try {
            const utxos = BitcoinHelper.listUnspent(0, 999999);
            console.log(`   Total UTXOs: ${utxos.length}`);
            
            if (utxos.length > 0) {
                console.log('   Últimos UTXOs:');
                utxos.slice(-3).forEach((utxo, index) => {
                    console.log(`     ${index + 1}. ${utxo.txid.substring(0, 16)}... (${utxo.amount} tBTC)`);
                });
            }
        } catch (error) {
            console.log(`   ⚠️ Error listando UTXOs: ${error.message}`);
        }

        // Mostrar resumen de comandos útiles
        console.log('\n=== COMANDOS ÚTILES ===');
        console.log('Consultar estado:');
        console.log('  node bitcoin-helper.js status');
        console.log('  node bitcoin-helper.js balance');
        console.log('\nMultiSig:');
        console.log('  node multisig.js address');
        console.log('  node multisig.js generate');
        console.log('\nTransacciones:');
        console.log('  node bitcoin-helper.js utxo <txid> <vout>');
        console.log('  node multisig.js spend <txid> <vout> <amount> <dest> <sendAmount>');

        console.log('\n=== RESUMEN ===');
        console.log('✅ Bitcoin Core funcionando');
        console.log('✅ Scripts JavaScript configurados');
        console.log('✅ Sistema híbrido listo para usar');
        
        if (balance > 0) {
            console.log(`✅ Fondos disponibles: ${balance} tBTC`);
        } else {
            console.log('💡 Obtén fondos de faucet para continuar');
        }

    } catch (error) {
        console.error('Error en verificación:', error.message);
        console.log('\n💡 Verifica que Bitcoin Core esté corriendo:');
        console.log('  bitcoind -testnet -daemon');
    }
}

// Función para mostrar tutorial paso a paso
function showTutorial() {
    console.log('=== TUTORIAL PASO A PASO ===\n');
    
    console.log('1. CONFIGURACIÓN INICIAL:');
    console.log('   npm install bitcoinjs-lib');
    console.log('   bitcoind -testnet -daemon');
    console.log('');
    
    console.log('2. CREAR MULTISIG:');
    console.log('   node multisig.js generate');
    console.log('   node multisig.js address');
    console.log('');
    
    console.log('3. OBTENER FONDOS:');
    console.log('   node bitcoin-helper.js address');
    console.log('   # Enviar fondos desde faucet a la dirección generada');
    console.log('');
    
    console.log('4. ENVIAR AL MULTISIG:');
    console.log('   MULTISIG_ADDR=$(node multisig.js address)');
    console.log('   bitcoin-cli -testnet sendtoaddress $MULTISIG_ADDR 0.0005');
    console.log('');
    
    console.log('5. GASTAR DESDE MULTISIG:');
    console.log('   node bitcoin-helper.js utxo <txid> <vout>');
    console.log('   DEST=$(node bitcoin-helper.js address)');
    console.log('   node multisig.js spend <txid> <vout> <amount> $DEST <sendAmount>');
    console.log('   # Usar el comando bitcoin-cli que muestra el script');
    console.log('');
    
    console.log('6. VERIFICAR:');
    console.log('   node verify.js');
}

// CLI Interface
function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
        case 'tutorial':
            showTutorial();
            break;
        
        case 'quick':
            // Verificación rápida sin detalles
            try {
                const balance = BitcoinHelper.getBalance();
                const multiSig = new MultiSigManager();
                const hasKeys = multiSig.loadKeys();
                const hasMultiSig = multiSig.loadMultiSig();
                
                console.log(`Balance: ${balance} tBTC`);
                console.log(`Claves: ${hasKeys ? '✅' : '❌'}`);
                console.log(`MultiSig: ${hasMultiSig ? '✅' : '❌'}`);
            } catch (error) {
                console.log('❌ Error:', error.message);
            }
            break;
            
        default:
            verify();
    }
}

if (require.main === module) {
    main();
}

module.exports = { verify, showTutorial };