const crypto = require('crypto');

class BitcoinScriptSimulator {
    constructor() {
        this.stack = [];
        this.debug = true;
    }

    log(message) {
        if (this.debug) console.log(message);
    }

    // Simular OP_SHA256
    op_sha256() {
        if (this.stack.length === 0) {
            this.log("❌ OP_SHA256: Stack empty");
            return false;
        }
        const item = this.stack.pop();
        const hash = crypto.createHash('sha256').update(Buffer.from(item, 'hex')).digest();
        this.stack.push(hash.toString('hex'));
        this.log(`✅ OP_SHA256: ${item} → ${hash.toString('hex')}`);
        return true;
    }

    // Simular OP_EQUAL
    op_equal() {
        if (this.stack.length < 2) {
            this.log("❌ OP_EQUAL: Need 2 items on stack");
            return false;
        }
        const a = this.stack.pop();
        const b = this.stack.pop();
        const result = (a === b) ? '01' : '00';
        this.stack.push(result);
        this.log(`✅ OP_EQUAL: ${b} == ${a} → ${result}`);
        return true;
    }

    // Empujar datos a la pila
    pushData(data) {
        this.stack.push(data);
        this.log(`📥 PUSH: ${data}`);
    }

    // Ejecutar nuestro script: OP_SHA256 <hash> OP_EQUAL
    executeHashContract(input, targetHash) {
        console.log(`\n🔐 === EJECUTANDO CONTRATO HASH ===`);
        console.log(`📝 Input: "${Buffer.from(input, 'hex').toString()}"`);
        console.log(`🎯 Target hash: ${targetHash}`);
        console.log(`\n📚 Simulando Bitcoin Script...`);
        
        this.stack = [];
        
        // 1. Empujar input a la pila (unlocking script)
        this.pushData(input);
        
        // 2. OP_SHA256 (locking script parte 1)
        this.op_sha256();
        
        // 3. Empujar target hash (locking script parte 2)
        this.pushData(targetHash);
        
        // 4. OP_EQUAL (locking script parte 3)
        this.op_equal();
        
        // 5. Verificar resultado final
        const success = this.stack.length === 1 && this.stack[0] === '01';
        console.log(`\n🏁 Resultado final: ${success ? '✅ ÉXITO' : '❌ FALLÓ'}`);
        console.log(`📊 Stack final: [${this.stack.join(', ')}]`);
        
        return success;
    }
}

// Crear nuestro "Hello World" contract
const simulator = new BitcoinScriptSimulator();

// El hash SHA256 de "hello world"
const targetHash = "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9";

console.log("🚀 === BITCOIN SCRIPT HELLO WORLD ===");
console.log("🎯 Nuestro contrato requiere el preimage de:");
console.log(`   ${targetHash}`);

// Test 1: Mensaje correcto
const correctMessage = Buffer.from("hello world").toString('hex');
simulator.executeHashContract(correctMessage, targetHash);

// Test 2: Mensaje incorrecto  
const wrongMessage = Buffer.from("wrong password").toString('hex');
simulator.executeHashContract(wrongMessage, targetHash);

