# Smart Contract "Hola Mundo" en Bitcoin Script Nativo

## ¿Qué es Bitcoin Script?

Bitcoin Script es el lenguaje de programación nativo de Bitcoin. Es un lenguaje:
- **Stack-based** (basado en pila)
- **Forth-like** (similar a Forth)  
- **No Turing-complete** (intencionalmente limitado)
- **Determinista** (siempre produce el mismo resultado)

### Diferencias vs sCrypt:
- **sCrypt**: TypeScript → Bitcoin Script (abstracción de alto nivel)
- **Bitcoin Script**: Programación directa con opcodes (bajo nivel)

### ¿Por qué estas limitaciones?

| Característica | Bitcoin Script | Lenguajes tradicionales |
|---------------|----------------|------------------------|
| **Paradigma** | Stack-based (basado en pila) | Variables y funciones |
| **Estado** | Sin estado persistente | Variables que mantienen estado |
| **Loops** | No permitidos | For, while, etc. |
| **Complejidad** | Intencionalmente limitado | Turing-complete |
| **Propósito** | Validar transacciones | Aplicaciones generales |

**Razones de las limitaciones:**
- ✅ **Determinismo**: El mismo script siempre produce el mismo resultado
- ✅ **Seguridad**: No puede entrar en loops infinitos
- ✅ **Simplicidad**: Menos superficie de ataque
- ✅ **Consenso**: Todos los nodos llegan al mismo resultado

## Requisitos Previos

### Software necesario:
- **Bitcoin Core** - [Descargar](https://bitcoin.org/en/download)
- **Node.js** (para herramientas auxiliares)

### Instalar Bitcoin Core en macOS:
```bash
# Opción 1: Homebrew (recomendado)
brew install bitcoin

# Opción 2: Descargar desde bitcoin.org
```

### Verificar instalación:
```bash
bitcoind --version
bitcoin-cli --version
```

**Resultado esperado:**
```
Bitcoin Core daemon version v29.0.0
Bitcoin Core RPC client version v29.0.0
```

## ¿Qué es Bitcoin Core?

**Bitcoin Core** es la implementación de referencia de Bitcoin que incluye:
- **bitcoind**: El daemon/servidor que ejecuta el nodo completo
- **bitcoin-cli**: Cliente de línea de comandos para interactuar con bitcoind
- **Validación completa**: Verifica todas las transacciones y bloques independientemente
- **Red P2P**: Se conecta directamente a la red Bitcoin

### Crear archivo de configuración:
```bash
mkdir -p ~/.bitcoin
nano ~/.bitcoin/bitcoin.conf
```

### Configuración para testnet:

```
# Bitcoin testnet configuration
testnet=1
server=1
rpcuser=bitcoinrpc
rpcpassword=mi_password_super_segura_123_testnet
rpcallowip=127.0.0.1
rpcport=18332
daemon=1

# Optional: Reduce storage
prune=2000

# Enable all RPC commands
rpcbind=127.0.0.1
```

### ¿Qué hace cada configuración?

| Parámetro | Función | Por qué es importante |
|-----------|---------|----------------------|
| `testnet=1` | Conectar a Bitcoin testnet | Usar red de pruebas, no dinero real |
| `server=1` | Activar servidor RPC | Permitir comandos desde bitcoin-cli |
| `rpcuser/rpcpassword` | Credenciales RPC | Seguridad para conexiones locales |
| `rpcallowip=127.0.0.1` | Solo conexiones locales | Evitar accesos remotos no autorizados |
| `rpcport=18332` | Puerto testnet | Testnet usa 18332, mainnet usa 8332 |
| `daemon=1` | Ejecutar en background | Funcionar como servicio |
| `prune=2000` | Limitar almacenamiento | Solo guardar últimos 2GB de bloques |

### Iniciar Bitcoin Core:

```bash
bitcoind -testnet -daemon
```

**Resultado esperado:**
```
Bitcoin Core starting
```

### Verificar que funciona:

```bash
bitcoin-cli -testnet getblockchaininfo
```

**Resultado típico al inicio:**
```json
{
  "chain": "test",                    // ✅ Conectado a testnet
  "blocks": 0,                        // Bloques descargados: empezando
  "headers": 0,                       // Headers descargados: empezando  
  "initialblockdownload": true,       // ⏳ Sincronizando por primera vez
  "verificationprogress": 1.4e-09     // 📈 Progreso: casi 0%
}
```

## 🔍 **¿Qué está pasando cuando inicias el nodo?**

### **Tu Mac se convierte en un nodo Bitcoin:**

1. **Conexión P2P**: Se conecta a otros nodos testnet en el mundo
2. **Descarga de blockchain**: Comienza a descargar todos los bloques desde 2011
3. **Verificación**: Valida cada transacción y bloque independientemente
4. **Construcción de estado**: Construye su propia copia verificada de la blockchain

### **Testnet vs Mainnet:**

| Aspecto | Testnet | Mainnet |
|---------|---------|---------|
| **Propósito** | Desarrollo y pruebas | Producción real |
| **Bitcoin** | Sin valor económico | Valor real en mercados |
| **Seguridad** | Seguro para experimentar | Errores cuestan dinero |
| **Reset** | Se puede resetear | Inmutable para siempre |
| **Tamaño** | ~20-50 GB | ~500+ GB |
| **Dificultad** | Baja, ajustable | Alta, competitiva |

### **¿Por qué sincronizar localmente?**

**Ventajas del nodo propio:**
- ✅ **Independencia**: No dependes de terceros
- ✅ **Privacidad**: Nadie ve tus consultas
- ✅ **Control total**: Acceso completo a todas las funciones
- ✅ **Confianza**: Verificas todo independientemente
- ✅ **Desarrollo**: Puedes crear transacciones complejas

**vs APIs de terceros:**
- ❌ **Dependencia**: Si se cae el servicio, no funciona
- ❌ **Limitaciones**: Funciones restringidas
- ❌ **Privacidad**: Terceros ven toda tu actividad
- ❌ **Confianza**: Debes confiar en sus datos

### **Proceso de sincronización:**

```bash
# Verificar progreso de sincronización:
bitcoin-cli -testnet getblockchaininfo | grep verificationprogress
```

**Interpretación del progreso:**
- `0.0001` = 0.01% completado
- `0.5` = 50% completado  
- `0.999` = 99.9% completado
- `1.0` = 100% sincronizado ✅

**Tiempo estimado:**
- **Internet rápido**: 30-60 minutos
- **Internet normal**: 1-2 horas
- **Con prune=2000**: Más rápido (solo últimos bloques)

### **Verificar estado mientras sincroniza:**

```bash
# Ver progreso y bloques:
bitcoin-cli -testnet getblockchaininfo | grep -E "blocks|verificationprogress"

# Ver conexiones de red:
bitcoin-cli -testnet getnetworkinfo | grep connections

# Ver peers conectados:
bitcoin-cli -testnet getpeerinfo | wc -l
```

### **¿Qué pasa si la sincronización va muy lenta?**

**Problemas comunes:**
1. **Pocas conexiones** a otros nodos
2. **Internet lento** o inestable
3. **Firewall bloqueando** conexiones P2P
4. **Disco lento** (especialmente HDD vs SSD)

**Soluciones:**
```bash
# Verificar conexiones (deberían ser 8-10):
bitcoin-cli -testnet getnetworkinfo | grep connections

# Reiniciar si hay problemas:
bitcoin-cli -testnet stop
bitcoind -testnet -daemon

# Verificar logs de error:
tail -f ~/.bitcoin/testnet3/debug.log
```

### **¿Qué puedes hacer mientras sincroniza?**

| Progreso | ¿Qué funciona? | ¿Qué no funciona? |
|----------|---------------|-------------------|
| **0-10%** | ✅ Crear billeteras<br>✅ Generar direcciones<br>✅ Entender conceptos | ❌ Ver transacciones<br>❌ Verificar balances<br>❌ Gastar fondos |
| **10-80%** | ✅ Todo lo anterior<br>✅ Ver transacciones antiguas | ❌ Ver transacciones recientes<br>❌ Deploy de contratos |
| **80-99%** | ✅ Casi todas las funciones<br>✅ Ver fondos del faucet | ⚠️ Pueden faltar bloques recientes |
| **100%** | ✅ **Todas las funciones**<br>✅ **Deploy de contratos**<br>✅ **Testing completo** | 🎉 ¡Todo funciona! |

### **Crear billetera mientras sincroniza:**

```bash
# Crear billetera testnet:
bitcoin-cli -testnet createwallet "helloworld"

# Verificar que se creó:
bitcoin-cli -testnet listwallets

# Generar dirección para recibir fondos:
bitcoin-cli -testnet getnewaddress "test" "bech32"
```

**Resultado esperado:**
```
tb1qx04jp925z3f99rkxv9wrv3ngs5x7fpjnq7tf4a
```

### **¿Qué es una billetera en Bitcoin?**

Una **billetera Bitcoin** NO es como una billetera física:

**Billetera tradicional:**
- 💳 Contiene dinero físico
- 🔒 Si la pierdes, pierdes el dinero

**Billetera Bitcoin:**
- 🔑 Contiene **claves privadas** (no Bitcoin)
- 📍 Las claves **controlan direcciones** en la blockchain
- 💰 El Bitcoin existe en la **blockchain**, no en la billetera
- 🔐 **"Your keys, your Bitcoin"** - quien tiene las claves controla los fondos



### ¿Qué tipos de direcciones Bitcoin existen?

| Tipo | Prefijo | Descripción | Ventajas |
|------|---------|-------------|----------|
| **Legacy (P2PKH)** | `1...` (mainnet), `m/n...` (testnet) | Formato original | Máxima compatibilidad |
| **SegWit (P2SH-P2WPKH)** | `3...` (mainnet), `2...` (testnet) | SegWit wrapped | Menor fee, compatible |
| **Native SegWit (Bech32)** | `bc1...` (mainnet), `tb1...` (testnet) | SegWit nativo | Menor fee, más eficiente |

**Para nuestros contratos usaremos principalmente Bech32** por ser más eficiente.

### Obtener fondos testnet:

Ve a estos faucets gratuitos:
- https://testnet-faucet.com/btc-testnet/
- https://coinfaucet.eu/en/btc-testnet/
- https://bitcoinfaucet.uo1.net/
- https://testnet-faucet.mempool.co/

**Pasos:**
1. **Copia tu dirección** tb1q... del comando anterior
2. **Pégala en cualquier faucet**
3. **Resuelve el captcha** si aparece
4. **Haz clic en "Send"** o "Claim"
5. **Espera 10-60 minutos** para confirmación

### ¿Qué son los faucets?

**Faucets** son servicios gratuitos que:
- 🚰 **Distribuyen Bitcoin testnet** gratis
- 🎯 **Permiten a desarrolladores** obtener fondos de prueba
- ⚡ **Facilitan testing** sin valor económico real
- 🔄 **Se recargan periódicamente** con nuevos fondos

**¿Por qué existen?**
- Bitcoin testnet **no tiene valor** económico
- **Cualquiera puede minear** testnet fácilmente
- **La comunidad los mantiene** para facilitar desarrollo
- **Son esenciales** para el ecosistema de desarrollo

### Verificar transacciones y balance:

```bash
# Verificar balance confirmado:
bitcoin-cli -testnet getbalance

# Verificar balance no confirmado:
bitcoin-cli -testnet getunconfirmedbalance

# Ver transacciones recientes:
bitcoin-cli -testnet listtransactions

# Ver UTXOs disponibles:
bitcoin-cli -testnet listunspent

# Ver dirección específica:
bitcoin-cli -testnet listreceivedbyaddress 0 true
```

### ¿Cómo funciona una transacción Bitcoin?

**Proceso completo:**
1. **Crear transacción**: Especificar inputs, outputs, fees
2. **Firmar transacción**: Usar clave privada para autorizar
3. **Broadcast**: Enviar a la red P2P
4. **Mempool**: Transacción espera en pool de memoria
5. **Minado**: Minero incluye en bloque
6. **Confirmación**: Bloque se agrega a blockchain
7. **Finalización**: Después de 6+ confirmaciones

**En testnet:**
- ⚡ **Bloques cada ~10 minutos** (igual que mainnet)
- 🟡 **1 confirmación**: ~10 minutos
- ✅ **6 confirmaciones**: ~60 minutos (considerado seguro)

### Detectar problemas comunes:

#### Problema: Fondos del faucet no aparecen

**Causas posibles:**
1. **Bitcoin Core muy poco sincronizado** (< 80%)
2. **Dirección incorrecta** copiada
3. **Faucet temporalmente sin fondos**
4. **Transacción aún no confirmada**

**Soluciones:**
```bash
# Verificar progreso:
bitcoin-cli -testnet getblockchaininfo | grep verificationprogress

# Verificar balance no confirmado:
bitcoin-cli -testnet getunconfirmedbalance

# Ver dirección usada:
bitcoin-cli -testnet listreceivedbyaddress 0 true

# Verificar conexiones:
bitcoin-cli -testnet getnetworkinfo | grep connections
```

### ¿Qué pasa si Bitcoin Core está poco sincronizado?

**Normal al inicio (< 80% sincronizado):**
- ✅ **Puedes crear billeteras** ✅
- ✅ **Puedes generar direcciones** ✅
- ✅ **Puedes recibir fondos** (aunque no los veas aún)
- ❌ **No puedes ver transacciones recientes**
- ❌ **No puedes gastar fondos**

**Una vez sincronizado (> 80%):**
- ✅ **Todas las funciones** disponibles
- ✅ **Puedes ver fondos** del faucet
- ✅ **Puedes crear transacciones**
- ✅ **Deployment de contratos** posible

### Comandos útiles de monitoreo:

```bash
# Ver estado general de billetera:
bitcoin-cli -testnet getwalletinfo

# Ver información de red:
bitcoin-cli -testnet getnetworkinfo

# Ver información de blockchain:
bitcoin-cli -testnet getblockchaininfo

# Ver todas las direcciones de la billetera:
bitcoin-cli -testnet getaddressesbylabel ""

# Ver peers conectados:
bitcoin-cli -testnet getpeerinfo | grep addr
```

### Resultado típico de una transacción del faucet:

Cuando el faucet funciona correctamente, verás algo como:
```
We sent 0.00197 bitcoins to address
tb1qx04jp925z3f99rkxv9wrv3ngs5x7fpjnq7tf4a
tx: b54cfbdfeb7597e4092d753692e182cf3036f25c30bd9afc6651e12cde5e47b2
```

### Interpretar el resultado del faucet:

- **Cantidad:** 0.00197 BTC testnet (suficiente para múltiples tests)
- **Dirección:** Tu dirección testnet
- **TX ID:** Identificador único de la transacción en la blockchain

Una vez que Bitcoin Core esté sincronizado, podrás ver estos fondos en tu balance.




## Crear simulador de Bitcoin Script:

Mientras Bitcoin Core sincroniza, vamos a entender cómo funciona Bitcoin Script creando nuestro propio simulador.

```bash
nano bitcoin_script_simulator.js
```

**Código del simulador completo:**

```javascript
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
```

#### Ejecutar simulador:
```bash
node bitcoin_script_simulator.js
```

**Resultado esperado:**
```
🚀 === BITCOIN SCRIPT HELLO WORLD ===
🎯 Nuestro contrato requiere el preimage de:
   b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9

🔐 === EJECUTANDO CONTRATO HASH ===
📝 Input: "hello world"
🎯 Target hash: b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
📚 Simulando Bitcoin Script...
📥 PUSH: 68656c6c6f20776f726c64
✅ OP_SHA256: 68656c6c6f20776f726c64 → b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
📥 PUSH: b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
✅ OP_EQUAL: b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9 == b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9 → 01
🏁 Resultado final: ✅ ÉXITO
📊 Stack final: [01]

🔐 === EJECUTANDO CONTRATO HASH ===
📝 Input: "wrong password"
🎯 Target hash: b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
📚 Simulando Bitcoin Script...
📥 PUSH: 77726f6e672070617373776f7264
✅ OP_SHA256: 77726f6e672070617373776f7264 → 3dff73672811dcd9f93f3dd86ce4e04960b46e10827a55418c7cc35d596e9662
📥 PUSH: b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
✅ OP_EQUAL: 3dff73672811dcd9f93f3dd86ce4e04960b46e10827a55418c7cc35d596e9662 == b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9 → 00
🏁 Resultado final: ❌ FALLÓ
📊 Stack final: [00]
```

### 🧠 **¿Qué acabas de aprender?**

#### **Conceptos de programación stack-based:**

1. **La pila (stack)**: Estructura LIFO (Last In, First Out)
   - Los elementos se "empujan" (push) al tope
   - Los elementos se "sacan" (pop) del tope
   - Los opcodes operan sobre elementos del tope

2. **Opcodes fundamentales:**
   - `OP_SHA256`: Saca un elemento, le aplica SHA256, empuja el resultado
   - `OP_EQUAL`: Saca dos elementos, los compara, empuja 01 (true) o 00 (false)
   - `PUSH data`: Empuja datos literales a la pila

3. **Flujo de ejecución:**
   - **Unlocking script** se ejecuta primero
   - **Locking script** se ejecuta después
   - Si la pila final contiene solo `01`, la transacción es válida

#### **Hash Preimage Challenge explicado:**

Un **hash preimage challenge** es un tipo de smart contract que:
- ✅ **Requiere conocimiento**: Debes saber el valor original (preimage)
- ✅ **Es verificable**: Cualquiera puede verificar que el hash es correcto
- ✅ **No requiere confianza**: No necesitas confiar en terceros
- ✅ **Es determinista**: Siempre produce el mismo resultado

**Casos de uso reales:**
- **Atomic Swaps**: Intercambios sin confianza entre blockchains
- **Lightning Network**: Pagos condicionados en canales de pago
- **Time-locked payments**: Pagos que se liberan después de un tiempo
- **Cross-chain bridges**: Puentes entre diferentes blockchains

### **Diferencias entre simulación y Bitcoin real:**

| Aspecto | Simulación Local | Bitcoin Real |
|---------|-----------------|--------------|
| **Costo** | ✅ Gratis | 💰 Gasta satoshis |
| **Velocidad** | ⚡ Instantáneo | ⏳ ~10 min por bloque |
| **Validación** | 🔍 Nuestra lógica | ✅ Red completa de nodos |
| **Persistencia** | ❌ Solo en memoria | ✅ Permanente en blockchain |
| **Testing** | ✅ Perfecto para debugging | ✅ Prueba final definitiva |

### **¿Por qué empezar con simulación?**

- ✅ **Entender la lógica** sin complejidad de red
- ✅ **Detectar bugs** sin gastar Bitcoin
- ✅ **Experimentar rápidamente** con diferentes inputs
- ✅ **Aprender conceptos** fundamentales
- ✅ **Preparar para deployment** real



## Crear el Contrato Real en Hexadecimal

### ¿Por qué hexadecimal?

Bitcoin Core solo entiende **datos binarios**, pero trabajamos en **hexadecimal** porque:
- ✅ **Es legible** para humanos (vs binario puro)
- ✅ **Cada byte** se representa con 2 caracteres hex
- ✅ **Es el estándar** en todas las herramientas Bitcoin
- ✅ **Fácil conversión** a/desde binario

### Crear el generador de contrato:

```bash
nano create_real_contract.js
```

**Código del generador:**

```javascript
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
```

#### Ejecutar generador:
```bash
node create_real_contract.js
```

### 🧠 **Decodificación del script hex:**

Tu script `a820b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde987` significa:

| Hex | Opcode | Descripción |
|-----|--------|-------------|
| `a8` | OP_SHA256 | Aplicar hash SHA256 al tope de la pila |
| `20` | PUSH 32 bytes | Los siguientes 32 bytes van a la pila |
| `b94d...de9` | Hash literal | El hash objetivo de 32 bytes |
| `87` | OP_EQUAL | Comparar dos elementos del tope de la pila |

### **¿Cómo funciona la ejecución combinada?**

Cuando Bitcoin ejecuta una transacción:

1. **Ejecuta unlocking script** primero:
   ```
   PUSH("hello world") → Pila: ["68656c6c6f20776f726c64"]
   ```

2. **Ejecuta locking script** después:
   ```
   OP_SHA256    → Pila: ["b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"]
   PUSH(hash)   → Pila: ["b94d27...de9", "b94d27...de9"]  
   OP_EQUAL     → Pila: ["01"]
   ```

3. **Verifica resultado**:
   - Si pila final = `["01"]` → ✅ Transacción válida
   - Si pila final = `["00"]` o vacía → ❌ Transacción inválida

## Verificar el Contrato con Bitcoin Core

### ¿Por qué verificar con Bitcoin Core?

Hasta ahora hemos simulado Bitcoin Script localmente, pero **Bitcoin Core es la implementación oficial**:
- ✅ **Autoridad definitiva** en validación de scripts
- ✅ **Misma lógica** que usan los mineros
- ✅ **Detecta errores** que nuestro simulador podría pasar por alto
- ✅ **Genera direcciones** P2SH oficiales

### Verificar que nuestro script es válido:

```bash
bitcoin-cli -testnet decodescript a820b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde987
```

**Resultado esperado:**
```json
{
  "asm": "OP_SHA256 b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9 OP_EQUAL",
  "desc": "raw(a820b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde987)#37qmtltw",
  "type": "nonstandard",
  "p2sh": "2NE58e9bQeGMtQv1cWLDAupviC2g3Y96856",
  "segwit": {
    "asm": "0 c9b9c4f73ff3062e9d86a37a255e62925d6566aa4a69fdcc18054486429e7e8a",
    "desc": "addr(tb1qexuufael7vrza8vx5daz2hnzjfwk2e42ff5lmnqcq4zgvs57069qpd3fu4)#u89g47u9",
    "hex": "0020c9b9c4f73ff3062e9d86a37a255e62925d6566aa4a69fdcc18054486429e7e8a",
    "address": "tb1qexuufael7vrza8vx5daz2hnzjfwk2e42ff5lmnqcq4zgvs57069qpd3fu4",
    "type": "witness_v0_scripthash",
    "p2sh-segwit": "2N1indjsdYEs8NqFCLkKytUeygwxAVVa7pW"
  }
}
```

### 🧠 **Análisis del resultado:**

#### **✅ Script válido:**
```json
"asm": "OP_SHA256 b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9 OP_EQUAL"
```
**¡Bitcoin Core reconoce exactamente nuestro script!**

#### **🏠 Direcciones P2SH generadas:**
- **P2SH Legacy:** `2NE58e9bQeGMtQv1cWLDAupviC2g3Y96856`
- **P2SH-SegWit:** `2N1indjsdYEs8NqFCLkKytUeygwxAVVa7pW`  
- **Native SegWit:** `tb1qexuufael7vrza8vx5daz2hnzjfwk2e42ff5lmnqcq4zgvs57069qpd3fu4`

#### **⚠️ "type": "nonstandard"**
Esto significa que es un script personalizado (no P2PKH/P2WPKH estándar), ¡exactamente lo que queremos!

### ¿Qué es P2SH (Pay to Script Hash)?

**P2SH** permite crear direcciones para scripts personalizados:

#### **Funcionamiento:**
1. **Tu script**: `a820b94d27...87`
2. **Hash del script**: SHA256(script)
3. **Dirección P2SH**: Codifica el hash del script
4. **Para gastar**: Debes proveer el script original + unlocking script

#### **Ventajas de P2SH:**
- ✅ **Direcciones normales**: Se ven como direcciones Bitcoin normales
- ✅ **Privacidad**: El script se revela solo al gastar
- ✅ **Compatibilidad**: Cualquier wallet puede enviar a P2SH
- ✅ **Eficiencia**: El script no se almacena en blockchain hasta que se usa

### Tipos de direcciones P2SH:

| Tipo | Dirección de ejemplo | Descripción |
|------|---------------------|-------------|
| **P2SH Legacy** | `2NE58e9bQeGMt...` | Compatible con wallets antiguos |
| **P2SH-SegWit** | `2N1indjsdYEs8N...` | SegWit wrapped, menor fee |
| **Native SegWit** | `tb1qexuufael7vr...` | SegWit nativo, máxima eficiencia |

### Verificar progreso de sincronización:

```bash
bitcoin-cli -testnet getblockchaininfo | grep -E "blocks|verificationprogress"
```

**Mientras esperamos que sincronice**, nuestro contrato ya está **100% listo** para usar.

### **¿Qué significa esto?**

#### **Tu smart contract está oficialmente validado:**
- ✅ **Script sintácticamente correcto**
- ✅ **Opcodes válidos** y soportados
- ✅ **Direcciones P2SH** generadas
- ✅ **Listo para recibir Bitcoin**

#### **Cuando Bitcoin Core sincronice completamente, podrás:**
1. **Enviar Bitcoin** a cualquiera de las direcciones P2SH
2. **Crear transacción** que gaste el contrato
3. **Probar** con diferentes unlocking scripts
4. **Ver resultados** reales en la blockchain


## Crear script de resumen final:

```bash
nano bitcoin_contract_summary.js
```

```javascript
const crypto = require('crypto');

console.log("🏆 === BITCOIN SCRIPT SMART CONTRACT - RESUMEN COMPLETO ===\n");

class BitcoinContractSummary {
    constructor() {
        this.secret = "hello world";
        this.hash = crypto.createHash('sha256').update(this.secret).digest('hex');
        this.lockingScript = `a820${this.hash}87`;
        this.unlockingScript = Buffer.from(this.secret).toString('hex');
    }

    displayContract() {
        console.log("🔐 TU SMART CONTRACT:");
        console.log("═".repeat(50));
        console.log(`📝 Secreto: "${this.secret}"`);
        console.log(`🎯 Hash SHA256: ${this.hash}`);
        console.log(`🔒 Locking Script: ${this.lockingScript}`);
        console.log(`🔓 Unlocking Script: ${this.unlockingScript}`);
        
        console.log("\n📋 DECODIFICACIÓN:");
        console.log("═".repeat(50));
        console.log(`a8   = OP_SHA256`);
        console.log(`20   = Empujar 32 bytes`);
        console.log(`${this.hash} = Hash objetivo`);
        console.log(`87   = OP_EQUAL`);
    }

    displayAddresses() {
        console.log("\n🏠 DIRECCIONES DEL CONTRATO:");
        console.log("═".repeat(50));
        console.log("Para deployar tu contrato, envía Bitcoin a:");
        console.log("• P2SH Legacy: 2NE58e9bQeGMtQv1cWLDAupviC2g3Y96856");
        console.log("• P2SH-SegWit: 2N1indjsdYEs8NqFCLkKytUeygwxAVVa7pW");
        console.log("• Native SegWit: tb1qexuufael7vrza8vx5daz2hnzjfwk2e42ff5lmnqcq4zgvs57069qpd3fu4");
    }

    displayNextSteps() {
        console.log("\n🚀 PRÓXIMOS PASOS:");
        console.log("═".repeat(50));
        console.log("1. ⏳ Esperar que Bitcoin Core sincronice");
        console.log("2. 💰 Enviar Bitcoin testnet a una dirección del contrato");
        console.log("3. 🔓 Crear transacción con unlocking script");
        console.log("4. ✅ Probar con mensaje correcto");
        console.log("5. ❌ Probar con mensaje incorrecto");
        console.log("6. 🎉 ¡Ver tu contrato funcionando en Bitcoin real!");
    }

    displayCommands() {
        console.log("\n⚡ COMANDOS BITCOIN CORE:");
        console.log("═".repeat(50));
        console.log("# Verificar script:");
        console.log(`bitcoin-cli -testnet decodescript ${this.lockingScript}`);
        console.log("\n# Verificar progreso:");
        console.log("bitcoin-cli -testnet getblockchaininfo | grep verificationprogress");
        console.log("\n# Verificar balance:");
        console.log("bitcoin-cli -testnet getbalance");
        console.log("\n# Enviar a contrato:");
        console.log("bitcoin-cli -testnet sendtoaddress <dirección_contrato> 0.001");
    }

    displayAchievements() {
        console.log("\n🏆 LO QUE LOGRASTE:");
        console.log("═".repeat(50));
        console.log("✅ Instalaste y configuraste Bitcoin Core");
        console.log("✅ Conectaste a Bitcoin testnet real");
        console.log("✅ Creaste billetera y direcciones");
        console.log("✅ Obtuviste fondos de faucet");
        console.log("✅ Programaste en Bitcoin Script nativo");
        console.log("✅ Creaste smart contract de hash preimage");
        console.log("✅ Simulaste ejecución local");
        console.log("✅ Verificaste script con Bitcoin Core");
        console.log("✅ Generaste direcciones P2SH");
        console.log("✅ Entendiste el proceso completo de Bitcoin");
        
        console.log("\n🎓 CONCEPTOS DOMINADOS:");
        console.log("═".repeat(50));
        console.log("• Bitcoin Script stack-based programming");
        console.log("• Opcodes: OP_SHA256, OP_EQUAL");
        console.log("• Locking vs Unlocking scripts");
        console.log("• P2SH (Pay to Script Hash)");
        console.log("• Hash preimage challenges");
        console.log("• Hex encoding/decoding");
        console.log("• UTXO model");
        console.log("• Testnet vs Mainnet");
        console.log("• Bitcoin Core RPC");
    }
}

const summary = new BitcoinContractSummary();
summary.displayContract();
summary.displayAddresses();
summary.displayNextSteps();
summary.displayCommands();
summary.displayAchievements();

console.log("\n🎉 ¡FELICITACIONES! Has creado tu primer smart contract en Bitcoin Script nativo!");
console.log("🌟 Esto es mucho más avanzado que usar abstracciones de alto nivel.");
console.log("🧠 Ahora entiendes Bitcoin desde sus fundamentos más profundos.");
```

#### Ejecutar resumen:
```bash
node bitcoin_contract_summary.js
```

## Deployment Real del Contrato (Cuando Esté Sincronizado)

### Una vez que `verificationprogress` esté cerca de 1.0:

#### 1. Verificar fondos disponibles:
```bash
bitcoin-cli -testnet getbalance
bitcoin-cli -testnet listunspent
```

#### 2. Enviar Bitcoin al contrato:
```bash
# Usando dirección Native SegWit (más eficiente):
bitcoin-cli -testnet sendtoaddress tb1qexuufael7vrza8vx5daz2hnzjfwk2e42ff5lmnqcq4zgvs57069qpd3fu4 0.001
```

#### 3. Verificar que llegó:
```bash
bitcoin-cli -testnet listtransactions
```

## Comandos de Referencia Final

```bash
# Bitcoin Core management
bitcoind -testnet -daemon                    # Iniciar nodo testnet
bitcoin-cli -testnet stop                    # Parar nodo
bitcoin-cli -testnet getblockchaininfo      # Info de blockchain
bitcoin-cli -testnet getbalance             # Ver balance
bitcoin-cli -testnet getnewaddress          # Nueva dirección
bitcoin-cli -testnet listunspent            # Ver UTXOs

# Script operations
bitcoin-cli -testnet decodescript <hex>     # Decodificar script
bitcoin-cli -testnet createrawtransaction   # Crear transacción raw
bitcoin-cli -testnet signrawtransactionwithwallet  # Firmar
bitcoin-cli -testnet sendrawtransaction     # Enviar transacción

# Testing local
node bitcoin_script_simulator.js           # Simulador local
node create_real_contract.js               # Generador de contrato
node bitcoin_contract_summary.js           # Resumen completo

# Monitoreo
bitcoin-cli -testnet getblockchaininfo | grep verificationprogress
bitcoin-cli -testnet getnetworkinfo | grep connections
```

## Troubleshooting Común

### 1. Bitcoin Core no inicia:
```bash
# Verificar que no esté ya ejecutándose:
ps aux | grep bitcoind

# Eliminar lock file si es necesario:
rm ~/.bitcoin/testnet3/.lock
```

### 2. Sincronización muy lenta:
```bash
# Agregar nodos confiables a bitcoin.conf:
addnode=testnet-seed.bitcoin.jonasschnelli.ch
addnode=seed.tbtc.petertodd.org
```

### 3. Error RPC connection refused:
```bash
# Verificar que bitcoin.conf tenga:
server=1
rpcuser=bitcoinrpc
rpcpassword=tu_password
```

### 4. No aparecen fondos del faucet:
- ✅ Verificar que Bitcoin Core esté sincronizado (>80%)
- ✅ Usar la dirección correcta generada por tu billetera
- ✅ Esperar 10-60 minutos para confirmación


### ✅ **Conceptos Dominados:**
- **Bitcoin Script nativo** sin abstracciones
- **Stack-based programming** con opcodes
- **P2SH (Pay to Script Hash)** para scripts personalizados
- **Hash preimage challenges** como contratos simples
- **UTXO management** directo
- **Raw transactions** en Bitcoin
- **Bitcoin Core RPC** completo

### ✅ **Diferencias vs sCrypt:**
- **Más control** pero más complejo
- **Sin compilador** - programas directamente en opcodes
- **Limitado** por opcodes disponibles en Bitcoin Core

### 🚀 **Próximos Pasos:**
- **MultiSig scripts** con múltiples firmas
- **Timelock contracts** con OP_CHECKLOCKTIMEVERIFY
- **More complex hash challenges** con múltiples condiciones
- **Lightning Network** scripts básicos
- **Atomic swaps** entre diferentes cryptomonedas
