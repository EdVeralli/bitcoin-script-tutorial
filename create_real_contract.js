const crypto = require('crypto');

class BitcoinHashContract {
    constructor() {
        this.secretMessage = "hello world";
        this.targetHash = crypto.createHash('sha256')
            .update(this.secretMessage)
            .digest('hex');
    }

    createLockingScript() {
        // Crear script: OP_SHA256 <32-byte-hash> OP_EQUAL
        // OP_SHA256 = 0xa8, OP_EQUAL = 0x87
        // 0x20 = empujar 32 bytes
        const script = `a820${this.targetHash}87`;
        
        console.log("🔐 === BITCOIN HASH CONTRACT ===");
        console.log(`📝 Secret: "${this.secretMessage}"`);
        console.log(`🎯 Hash: ${this.targetHash}`);
        console.log(`📜 Locking Script (hex): ${script}`);
        console.log(`📝 Locking Script (human): OP_SHA256 ${this.targetHash} OP_EQUAL`);
        
        return script;
    }

    createUnlockingScript(message) {
        const messageHex = Buffer.from(message).toString('hex');
        console.log(`\n🔓 === UNLOCKING SCRIPT ===`);
        console.log(`📝 Message: "${message}"`);
        console.log(`📜 Unlocking Script (hex): ${messageHex}`);
        console.log(`📝 Unlocking Script (human): PUSH("${message}")`);
        
        return messageHex;
    }

    explainTransaction() {
        console.log(`\n🌍 === COMO FUNCIONA EN BITCOIN REAL ===`);
        console.log(`\n📋 Para gastar este contrato necesitas crear una transacción con:`);
        console.log(`   • Input: UTXO que contiene el contrato`);
        console.log(`   • Unlocking Script: "${this.secretMessage}" en hex`);
        console.log(`   • Output: Donde enviar el Bitcoin liberado`);
        console.log(`\n⚡ Bitcoin combina unlocking + locking script y ejecuta:`);
        console.log(`   1. PUSH("${this.secretMessage}")`);
        console.log(`   2. OP_SHA256`);
        console.log(`   3. PUSH(${this.targetHash})`);
        console.log(`   4. OP_EQUAL`);
        console.log(`   5. Si resultado = 01 → Transacción válida ✅`);
        console.log(`   6. Si resultado = 00 → Transacción inválida ❌`);
    }
}

// Crear el contrato
const contract = new BitcoinHashContract();
const lockingScript = contract.createLockingScript();

// Crear unlocking scripts
const correctUnlock = contract.createUnlockingScript("hello world");
const wrongUnlock = contract.createUnlockingScript("wrong password");

contract.explainTransaction();

console.log(`\n🎯 === RESUMEN ===`);
console.log(`✅ Unlocking correcto: ${correctUnlock}`);
console.log(`❌ Unlocking incorrecto: ${wrongUnlock}`);
console.log(`🔒 Locking script: ${lockingScript}`);
