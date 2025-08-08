# Ciclo Completo - Smart Contract Bitcoin Script

## Introducción

Este documento contiene **todos los comandos que funcionaron exitosamente** desde el inicio hasta la finalización completa del smart contract Bitcoin Script. Incluye tanto la FASE 1 (funding del contrato) como la FASE 2 (gasto y revelación), con **valores reales** utilizados.

---

## Estado Inicial - Verificaciones Previas

### Verificar sincronización de Bitcoin Core:

```bash
bitcoin-cli -testnet getblockchaininfo | grep verificationprogress
```

**Resultado requerido:** `>= 0.95` (95% o más sincronizado)  
**Resultado obtenido:** `0.9999919937024108` ✅

### Verificar fondos disponibles:

```bash
bitcoin-cli -testnet getbalance
```

**Resultado obtenido:** `0.00197000`

### Ver detalles de fondos recibidos del faucet: ( ultimas 10 transacciones )

```bash
bitcoin-cli -testnet listtransactions "*" 10
```

**Resultado confirmó:**
- ✅ Recepción del faucet: 0.00197000 BTC
- ✅ Dirección: `tb1qx04jp925z3f99rkxv9wrv3ngs5x7fpjnq7tf4a`
- ✅ Confirmaciones: 37,767

---

## FASE 1: Funding del Smart Contract

### 1. Verificar fee estimado:

```bash
bitcoin-cli -testnet estimatesmartfee 1
```

**Resultado obtenido:**
```json
{
  "feerate": 0.00001090,
  "blocks": 2
}
```

### 2. Ver configuración de wallet:

```bash
bitcoin-cli -testnet getwalletinfo
```

**Confirmó:**
- ✅ Wallet: "helloworld"
- ✅ Balance: 0.00197000 BTC
- ✅ Wallet desbloqueada y funcional

### 3. **COMANDO HISTÓRICO - Envío de fondos al contrato:**

```bash
bitcoin-cli -testnet sendtoaddress "2NE58e9bQeGMtQv1cWLDAupviC2g3Y96856" 0.001
```

**🎉 RESULTADO EXITOSO:**
```
55420821971d76018d1da7913c497a55bad2f642fb4fb33b2a7e4748f862ad72
```

### 4. Verificar nuevo saldo post-envío:

```bash
bitcoin-cli -testnet getbalance
```

**Resultado obtenido:** `0.00096844`

**Cálculo verificado:**
```
Saldo inicial: 0.00197000 BTC
Enviado: -0.00100000 BTC
Fee: -0.00000156 BTC
Saldo final: 0.00096844 BTC ✅
```

### 5. Ver detalles de la transacción de funding:

```bash
bitcoin-cli -testnet gettransaction 55420821971d76018d1da7913c497a55bad2f642fb4fb33b2a7e4748f862ad72
```

**Confirmó:**
- ✅ Amount: -0.00100000 (enviado)
- ✅ Fee: -0.00000156 (156 satoshis)
- ✅ Address: `2NE58e9bQeGMtQv1cWLDAupviC2g3Y96856`
- ✅ VOUT: 1
- ✅ Confirmaciones: 24+ (y creciendo)

---

## Verificación en Explorador Blockchain (FASE 1)

### Verificar contrato en explorador web:

**URL del contrato:**
```
https://blockstream.info/testnet/address/2NE58e9bQeGMtQv1cWLDAupviC2g3Y96856
```

**Estado confirmado:**
- ✅ Balance: 0.001 tBTC
- ✅ Confirmed TX Count: 1
- ✅ Confirmed Received: 1 outputs (0.0010000 tBTC)
- ✅ Confirmed Unspent: 1 outputs (0.0010000 tBTC)

**URL de la transacción de funding:**
```
https://blockstream.info/testnet/tx/55420821971d76018d1da7913c497a55bad2f642fb4fb33b2a7e4748f862ad72
```

---

------------------------------------------------------------------------------
-------------------------------------------------------------------------------
-------------------------------------------------------------------------------

----------------------------------------------------------------------------
----------------------------------------------------------------------------
----------------------------------------------------------------------------



# Ahora toca ejecutar el RedeemScript
```
bitcoin-cli -testnet signrawtransactionwithkey \
'020000000172ad62f848477e2a3bb34ffb42f6d2ba557a493c91a71d8d01761d97210842550100000000fdffffff01905f0100000000001600144a1fcbcdf6a7e6f298abfeb74806c8bcaa9e6a0600000000' \
'[]' \
'[{
  "txid":"55420821971d76018d1da7913c497a55bad2f642fb4fb33b2a7e4748f862ad72",
  "vout":1,
  "scriptPubKey":"a91407876b3d158b4e3a6c7140e0262b8cfeeef4ae8287",
  "redeemScript":"a820b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde987",
  "amount":0.001
}]'

```
## Decodificación del redeemScript:
```
a820b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde987

a8 = OP_SHA256
20 = PUSH 32 bytes
b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde987 ← ¡HELLO WORLD HASHEADO!
87 = OP_EQUAL
```

### Traducción humana del redeemScript
Para gastar este UTXO, debes proporcionar un valor que:
1. Cuando se le aplique SHA256
2. Produzca el hash b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde987



---------------------------------------------------
---------------------------------------------------
---------------------------------------------------



# FASE 2 - Comandos Reales Ejecutados con Éxito

## Introducción

Este documento contiene **únicamente los comandos que funcionaron** durante la FASE 2 del tutorial Bitcoin Script, con los **valores reales** utilizados. Es una referencia práctica para replicar el proceso completo de gastar un UTXO protegido por smart contract.

---

## 1. Crear Dirección de Destino

### Generar nueva dirección bech32 para recibir fondos recuperados:

```bash
bitcoin-cli -testnet getnewaddress "recovered" "bech32"
```

```
bitcoin-cli -testnet getnewaddress "recovered" "bech32"
│─────────────────│ │───────────│ │────────│  │──────│
│                 │ │           │ │        │  │      │
│ Cliente + Red   │ │ Comando   │ │ Label  │  │ Tipo │
└─────────────────┘ └───────────┘ └────────┘  └──────┘
```
Nueva Direccion---> tb1qfg0uhn0k5ln09x9tl6m5spkghj4fu6sx2a6p4j



**Resultado obtenido:**
```
tb1qfg0uhn0k5ln09x9tl6m5spkghj4fu6sx2a6p4j
```

---

## 2. Crear Raw Transaction

### Preparar estructura de transacción para gastar el UTXO:

```bash
bitcoin-cli -testnet createrawtransaction \
'[{"txid":"55420821971d76018d1da7913c497a55bad2f642fb4fb33b2a7e4748f862ad72","vout":1}]' \
'{"tb1qfg0uhn0k5ln09x9tl6m5spkghj4fu6sx2a6p4j":0.0009}'
```
--> Me devuelve la transaccion que hice en mi compu, NO esta subida a la blockchain !!!!
020000000172ad62f848477e2a3bb34ffb42f6d2ba557a493c91a71d8d01761d97210842550100000000fdffffff01905f0100000000001600144a1fcbcdf6a7e6f298abfeb74806c8bcaa9e6a0600000000


**Resultado obtenido:**
```
020000000172ad62f848477e2a3bb34ffb42f6d2ba557a493c91a71d8d01761d97210842550100000000fdffffff01905f0100000000001600144a1fcbcdf6a7e6f298abfeb74806c8bcaa9e6a0600000000
```

---

## 3. Verificar Transacción Base

### Decodificar la transacción base para verificar estructura:

```bash
bitcoin-cli -testnet decoderawtransaction '020000000172ad62f848477e2a3bb34ffb42f6d2ba557a493c91a71d8d01761d97210842550100000000fdffffff01905f0100000000001600144a1fcbcdf6a7e6f298abfeb74806c8bcaa9e6a0600000000'
```
Me muestra esto:
```
{
  "txid": "1838cc9adc60b487dfe24b3eec8bdaf6df3f0f6e07c591df4249a4ba5238ba81",
  "hash": "1838cc9adc60b487dfe24b3eec8bdaf6df3f0f6e07c591df4249a4ba5238ba81",
  "version": 2,
  "size": 82,
  "vsize": 82,
  "weight": 328,
  "locktime": 0,
  "vin": [
    {
      "txid": "55420821971d76018d1da7913c497a55bad2f642fb4fb33b2a7e4748f862ad72",
      "vout": 1,
      "scriptSig": {
        "asm": "",
        "hex": ""
      },
      "sequence": 4294967293
    }
  ],
  "vout": [
    {
      "value": 0.00090000,
      "n": 0,
      "scriptPubKey": {
        "asm": "0 4a1fcbcdf6a7e6f298abfeb74806c8bcaa9e6a06",
        "desc": "addr(tb1qfg0uhn0k5ln09x9tl6m5spkghj4fu6sx2a6p4j)#n7f3v0at",
        "hex": "00144a1fcbcdf6a7e6f298abfeb74806c8bcaa9e6a06",
        "address": "tb1qfg0uhn0k5ln09x9tl6m5spkghj4fu6sx2a6p4j",
        "type": "witness_v0_keyhash"
      }
    }
  ]
}
```
**Resultado confirmó:**
- ✅ Input válido: TXID correcto y vout 1
- ✅ Output válido: 0.0009 BTC a dirección correcta
- ✅ Estructura de transacción correcta

---

## 4. Crear PSBT (Método Moderno)

### Crear Partially Signed Bitcoin Transaction:

```bash
bitcoin-cli -testnet createpsbt \
'[{"txid":"55420821971d76018d1da7913c497a55bad2f642fb4fb33b2a7e4748f862ad72","vout":1}]' \
'[{"tb1qfg0uhn0k5ln09x9tl6m5spkghj4fu6sx2a6p4j":0.0009}]'
```

**Resultado obtenido:**
```
cHNidP8BAFICAAAAAXKtYvhIR34qO7NP+0L20rpVekk8kacdjQF2HZchCEJVAQAAAAD9////AZBfAQAAAAAAFgAUSh/Lzfan5vKYq/63SAbIvKqeagYAAAAAAAAA
```

---

## 5. Procesar PSBT

### Intentar procesar PSBT con información de wallet:

```bash
bitcoin-cli -testnet walletprocesspsbt 'cHNidP8BAFICAAAAAXKtYvhIR34qO7NP+0L20rpVekk8kacdjQF2HZchCEJVAQAAAAD9////AZBfAQAAAAAAFgAUSh/Lzfan5vKYq/63SAbIvKqeagYAAAAAAAAA' true "ALL" true
```

**Resultado:**
```json
{
  "psbt": "cHNidP8BAFICAAAAAXKtYvhIR34qO7NP+0L20rpVekk8kacdjQF2HZchCEJVAQAAAAD9////AZBfAQAAAAAAFgAUSh/Lzfan5vKYq/63SAbIvKqeagYAAAAAAAEAcwIAAAABskde3izhUWb8mr0wXPI2MM+C4ZI2dS0J5Jd169/7TLUBAAAAAP3///8CTHoBAAAAAAAXqRQHh2s9FYtOOmxxQOAmK4z+7vSugoeghgEAAAAAABepFORyBKzH1wNlxuXJziv6nA6KpGIfhytJRgAAIgIDIgnUvYEMoLYU6c+uJgAijJ/NbXyOVmVjmqN0TEN7P00Yc3sAz1QAAIABAACAAAAAgAAAAAABAAAAAA==",
  "complete": false
}
```

---

## 6. Construir Transacción Manualmente (Método que Funcionó)

### Crear archivo JavaScript para construcción manual:

```bash
nano complete_transaction.js
```

**Contenido del archivo:**

```javascript
// Construir transacción Bitcoin manualmente
const txid = "55420821971d76018d1da7913c497a55bad2f642fb4fb33b2a7e4748f862ad72";

// "hello world" en hex
const helloWorldHex = "68656c6c6f20776f726c64"; // 11 bytes
const redeemScript = "a820b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde987"; // 35 bytes

// Construir scriptSig
const scriptSig = "0b" + helloWorldHex + "23" + redeemScript;
console.log("🔑 ScriptSig:", scriptSig);
console.log("📏 ScriptSig length:", scriptSig.length / 2, "bytes");

// Reversar txid para little-endian
function reverseTxid(txid) {
    return txid.match(/.{2}/g).reverse().join('');
}

const reversedTxid = reverseTxid(txid);
console.log("🔄 Reversed TXID:", reversedTxid);

// Construir transacción completa
const version = "02000000";
const inputCount = "01";
const inputTxid = reversedTxid;
const inputVout = "01000000";
const scriptSigLen = (scriptSig.length / 2).toString(16).padStart(2, '0');
const sequence = "fdffffff";
const outputCount = "01"; 
const outputValue = "905f010000000000"; // 90000 satoshis
const outputScript = "1600144a1fcbcdf6a7e6f298abfeb74806c8bcaa9e6a06";
const locktime = "00000000";

const completeTx = version + inputCount + inputTxid + inputVout + scriptSigLen + scriptSig + sequence + outputCount + outputValue + outputScript + locktime;

console.log("\n🚀 TRANSACCIÓN FINAL:");
console.log(completeTx);
console.log("\n📝 Para enviar:");
console.log(`bitcoin-cli -testnet sendrawtransaction '${completeTx}'`);
```

### Ejecutar el script:

```bash
node complete_transaction.js
```

**Resultado obtenido:**
```
🔑 ScriptSig: 0b68656c6c6f20776f726c6423a820b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde987
📏 ScriptSig length: 48 bytes
🔄 Reversed TXID: 72ad62f848477e2a3bb34ffb42f6d2ba557a493c91a71d8d01761d9721084255
🚀 TRANSACCIÓN FINAL:
020000000172ad62f848477e2a3bb34ffb42f6d2ba557a493c91a71d8d01761d972108425501000000300b68656c6c6f20776f726c6423a820b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde987fdffffff01905f0100000000001600144a1fcbcdf6a7e6f298abfeb74806c8bcaa9e6a0600000000
📝 Para enviar:
bitcoin-cli -testnet sendrawtransaction '020000000172ad62f848477e2a3bb34ffb42f6d2ba557a493c91a71d8d01761d972108425501000000300b68656c6c6f20776f726c6423a820b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde987fdffffff01905f0100000000001600144a1fcbcdf6a7e6f298abfeb74806c8bcaa9e6a0600000000'
```

---

## 7. Enviar Transacción Final (¡LA REVELACIÓN!)

### Broadcast de la transacción con "hello world" revelado:

```bash
bitcoin-cli -testnet sendrawtransaction '020000000172ad62f848477e2a3bb34ffb42f6d2ba557a493c91a71d8d01761d972108425501000000300b68656c6c6f20776f726c6423a820b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde987fdffffff01905f0100000000001600144a1fcbcdf6a7e6f298abfeb74806c8bcaa9e6a0600000000'
```

**🎉 RESULTADO EXITOSO:**
```
138685cc216d043e36c55124edb0ee2bc741c8b4f470ec4fb436df16020f5711
```

---

## 8. Verificación Post-Éxito

### Verificar saldo actualizado:

```bash
bitcoin-cli -testnet getbalance
```

**Resultado esperado:** `~0.00186844` (saldo original + 0.0009 recuperados - fees)

### Ver detalles de la transacción de gasto:

```bash
bitcoin-cli -testnet gettransaction 138685cc216d043e36c55124edb0ee2bc741c8b4f470ec4fb436df16020f5711
```

### Ver transacciones recientes completas:

```bash
bitcoin-cli -testnet listtransactions "*" 10
```

---

## Datos Clave Utilizados

### Input (UTXO del contrato):
```
TXID: 55420821971d76018d1da7913c497a55bad2f642fb4fb33b2a7e4748f862ad72
VOUT: 1
Valor: 0.001 BTC
Dirección: 2NE58e9bQeGMtQv1cWLDAupviC2g3Y96856
```

### Output (destino de fondos):
```
Dirección: tb1qfg0uhn0k5ln09x9tl6m5spkghj4fu6sx2a6p4j
Valor: 0.0009 BTC
Fee: 0.0001 BTC
```

### Script Information:
```
RedeemScript: a820b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde987
Solución: "hello world" (68656c6c6f20776f726c64)
Hash Objetivo: b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
```

---

## Enlaces de Verificación

### Explorador Blockchain:

**Transacción de gasto (FASE 2):**
```
https://blockstream.info/testnet/tx/138685cc216d043e36c55124edb0ee2bc741c8b4f470ec4fb436df16020f5711
```

**Contrato original (ahora gastado):**
```
https://blockstream.info/testnet/address/2NE58e9bQeGMtQv1cWLDAupviC2g3Y96856
```

**Transacción original (FASE 1):**
```
https://blockstream.info/testnet/tx/55420821971d76018d1da7913c497a55bad2f642fb4fb33b2a7e4748f862ad72
```

---

## Secuencia de Comandos Resumida

```bash
# 1. Crear dirección destino
bitcoin-cli -testnet getnewaddress "recovered" "bech32"

# 2. Crear raw transaction
bitcoin-cli -testnet createrawtransaction \
'[{"txid":"55420821971d76018d1da7913c497a55bad2f642fb4fb33b2a7e4748f862ad72","vout":1}]' \
'{"tb1qfg0uhn0k5ln09x9tl6m5spkghj4fu6sx2a6p4j":0.0009}'

# 3. Construir transacción con scriptSig manual
node complete_transaction.js

# 4. Enviar transacción final
bitcoin-cli -testnet sendrawtransaction '[RESULTADO_DEL_SCRIPT_JS]'

# 5. Verificar éxito
bitcoin-cli -testnet getbalance
```

---

## Notas Importantes

### ¿Por qué el método manual?

Los métodos automáticos de Bitcoin Core (`signrawtransactionwithkey`, `finalizepsbt`) **no pudieron resolver automáticamente** el hash preimage challenge de "hello world". Esto es normal para contratos personalizados complejos.

### Componentes del scriptSig Final:

```
0b                    ← PUSH 11 bytes ("hello world")
68656c6c6f20776f726c64  ← "hello world" en hexadecimal
23                    ← PUSH 35 bytes (redeemScript)
a820b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde987  ← redeemScript completo
```

### Resultado Final:

✅ **FASE 2 COMPLETADA** - Smart contract ejecutado exitosamente  
✅ **"hello world" REVELADO** - Solución expuesta públicamente  
✅ **Fondos RECUPERADOS** - 0.0009 BTC transferidos correctamente  
✅ **Contrato GASTADO** - UTXO consumido completamente  

---

*Documento generado: Agosto 2025*  
*FASE 2 completada exitosamente*  
*TXID de éxito: 138685cc216d043e36c55124edb0ee2bc741c8b4f470ec4fb436df16020f5711*