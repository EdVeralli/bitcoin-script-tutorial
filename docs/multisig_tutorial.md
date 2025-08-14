# Tutorial Completo: MultiSig Bitcoin

## 🔍 ¿Qué es MultiSig?

**MultiSig (Multi-Signature)** es un tipo de script Bitcoin que requiere **múltiples firmas** de diferentes claves privadas para gastar fondos. Es como tener una caja fuerte que necesita varias llaves para abrirse.

### Tipos Comunes:
- **1-of-2**: Solo 1 firma de 2 posibles (backup/recovery)
- **2-of-2**: Ambas firmas requeridas (escrow básico)
- **2-of-3**: 2 firmas de 3 posibles (más común y práctico)
- **3-of-5**: 3 firmas de 5 posibles (organizaciones)

---

## 🎯 Casos de Uso Reales

### 🏢 **Empresas**
```
CEO + CFO + CTO (2-of-3)
Cualquier combinación de 2 puede autorizar pagos
```

### 🏦 **Escrow/Arbitraje**
```
Comprador + Vendedor + Árbitro (2-of-3)
Normal: Comprador + Vendedor
Disputa: Una parte + Árbitro
```

### 🔐 **Seguridad Personal**
```
Laptop + Móvil + Hardware Wallet (2-of-3)
Protección contra pérdida de dispositivos
```

---

## 🔄 **Flujo Visual Simplificado**

```
DIRECCION_MULTISIG (paso 3)
    ↓ (verificar fondos paso 4)
    ↓ (enviar fondos paso 5)
TXID_FUNDING (paso 6)
    ↓ (crear transacción paso 9)
RAW_TRANSACTION (paso 9)
    ↓ (+ firma Alice paso 11)
RESULTADO_FIRMA_ALICE (paso 11)
    ↓ (+ firma Bob paso 12)
TRANSACCION_CON_2_FIRMAS (paso 12)
    ↓ (broadcast paso 13)
TXID de éxito 🎉 (paso 13)
```

**Cada paso te da exactamente lo que necesitas para el siguiente paso. ¡Sin misterios!**

---

## 🛠️ Implementación Práctica: 2-of-3 MultiSig

## ⚙️ **FASE 0: Preparación del Entorno**
```mermaid
graph TD
    A[Reinicio del nodo] --> B{¿Billeteras cargadas?}
    B -->|No| C[Listar wallets con listwalletdir]
    C --> D[Cargar con loadwallet]
    D --> E[Operar normalmente]
    B -->|Sí| E
```

### **VERIFICACIONES INICIALES OBLIGATORIAS**

Antes de empezar con MultiSig, asegúrate de que tu entorno esté correctamente configurado:

- ✅ **Bitcoin Core instalado y funcionando**
- ✅ **Daemon bitcoind corriendo**
- ✅ **Nodo sincronizado** (>99%)
- ✅ **Wallet creado y cargado**
- ✅ **Fondos disponibles** (mínimo 0.002 tBTC)

---

### **PASO 0.0: Iniciar Bitcoin Core Daemon**

#### Verificar si bitcoind ya está corriendo:
```bash
bitcoin-cli -testnet getblockchaininfo
```

**Si obtienes un error de conexión:**
```
error: Could not connect to the server 127.0.0.1:18332

Make sure the bitcoind server is running and that you are connecting to the correct RPC port.
```

#### Iniciar el daemon en testnet:
```bash
bitcoind -testnet -daemon
```

**Resultado esperado:**
```
Bitcoin Core starting
```

#### Verificar que está corriendo correctamente:
```bash
# Debería responder sin errores después de unos segundos
bitcoin-cli -testnet getblockchaininfo | head -5
```

**🔥 IMPORTANTE:** 
- El daemon puede tardar **10-30 segundos** en estar completamente listo
- Si el comando anterior falla, espera un momento y vuelve a intentar
- En la primera ejecución, comenzará a descargar la blockchain de testnet

---

### **PASO 0.1: Verificar Sincronización del Nodo**

```bash
# Verificar que el nodo está sincronizado
bitcoin-cli -testnet getblockchaininfo | grep verificationprogress
```

**Resultado esperado:**
```
"verificationprogress": 0.999... o 1.0
```

**🚨 Si está por debajo de 0.99:**
```bash
# Monitorear progreso cada 30 segundos
watch -n 30 "bitcoin-cli -testnet getblockchaininfo | grep verificationprogress"
```

**⏳ Espera hasta que `verificationprogress` sea ≥ 0.999 antes de continuar**

---

### **PASO 0.2: Preparar el Wallet**

#### Verificar si hay wallet cargado:
```bash
bitcoin-cli -testnet listwallets
```

**Resultado si NO hay wallet:**
```json
[]
```

#### Si está vacío, crear wallet nuevo:
```bash
bitcoin-cli -testnet createwallet "multisig_tutorial"
```

**Resultado esperado:**
```json
{
  "name": "multisig_tutorial",
  "warning": ""
}
```

#### Verificar que el wallet está funcionando:
```bash
# Ver información del wallet
bitcoin-cli -testnet getwalletinfo

# Verificar saldo inicial (debería ser 0)
bitcoin-cli -testnet getbalance
```

**Resultado esperado del saldo:**
```
0.00000000
```

---

### **PASO 0.3: Conseguir Fondos de Testnet**

#### Crear dirección para recibir fondos del faucet:
```bash
bitcoin-cli -testnet getnewaddress "faucet" "bech32"
```

**Resultado esperado:**
```
tb1qd0apye72kj4xy5n35n4sxddcm507k9ea08fqsz
```
**💡 Esta dirección es la Posta de mi Ubuntu**

**🔥 IMPORTANTE: Copia esta dirección exactamente como aparece**

#### Solicitar fondos en faucets de testnet:

**Opción 1 (Recomendado):**
- 🌐 **https://coinfaucet.eu/en/btc-testnet/**
- Pegar tu dirección y solicitar fondos
- Cantidad típica: ~0.001-0.01 tBTC

**Opciones adicionales:**
- 🌐 **https://testnet-faucet.mempool.co/**
- 🌐 **https://bitcoinfaucet.uo1.net/**

#### Verificar que llegaron los fondos:
```bash
# Ver transacciones recientes
bitcoin-cli -testnet listtransactions "*" 10

# Verificar saldo actualizado
bitcoin-cli -testnet getbalance
```

**Resultado esperado después de recibir fondos:**
```json
// En listtransactions verás algo como:
{
  "address": "tb1q...",
  "category": "receive",
  "amount": 0.01000000,
  "confirmations": 1,
  "txid": "abc123def456..."
}
```

```bash
// En getbalance verás:
0.01000000
```

#### Verificar en explorador de bloques (opcional):
```bash
# Abrir en navegador para verificar visualmente
https://blockstream.info/testnet/address/TU_DIRECCION_DEL_FAUCET
```

---

### **PASO 0.4: Verificación Final Antes de MultiSig**

```bash
# 1. Confirmar que todo está listo
bitcoin-cli -testnet getwalletinfo | grep walletname
bitcoin-cli -testnet getbalance

# 2. Verificar fondos mínimos necesarios
# Necesitas AL MENOS:
# - 0.001 tBTC para enviar al multisig
# - 0.0002 tBTC para fees estimados
# - Total recomendado: 0.002 tBTC o más
```

**✅ CRITERIOS PARA CONTINUAR:**
- Wallet cargado ✓
- Saldo ≥ 0.002 tBTC ✓
- Al menos 1 confirmación en las transacciones recibidas ✓

**🚨 Si no tienes fondos suficientes:**
- Solicita más fondos en otros faucets
- Espera a que confirmen las transacciones pendientes
- Verifica que usaste la dirección correcta

---

### **⏳ Tiempos de Espera Típicos:**

- **Sincronización inicial**: 2-6 horas (primera vez)
- **Fondos del faucet**: 10-60 minutos
- **Confirmaciones**: ~10 minutos por confirmación

**🔄 UNA VEZ COMPLETADA LA FASE 0, CONTINÚA CON:**
**[FASE 1: Generar las 3 Claves]**

---





### **FASE 1: Generar las 3 Claves**

#### 1. Crear 3 direcciones diferentes para simular 3 usuarios:

```bash
# Usuario 1 (Alice)
bitcoin-cli -testnet getnewaddress "alice" "legacy"
```

**Resultado esperado:**
```
mzK8eAb2v4Z3X9qL7wN5pR2mC1dF6gH8jI
```
**🔥 IMPORTANTE: Guarda este resultado como DIRECCION_ALICE**

```bash
# Usuario 2 (Bob) 
bitcoin-cli -testnet getnewaddress "bob" "legacy"
```

**Resultado esperado:**
```
n3M9pQ7rS5tU8vW2xY4zA6bC3eD9fG1hJ2
```
**🔥 IMPORTANTE: Guarda este resultado como DIRECCION_BOB**

```bash
# Usuario 3 (Charlie - Árbitro)
bitcoin-cli -testnet getnewaddress "charlie" "legacy"
```

**Resultado esperado:**
```
mjT6kR8sU5vW2yX7zA9bC4dE1fG3hI2kL5
```
**🔥 IMPORTANTE: Guarda este resultado como DIRECCION_CHARLIE**

#### 2. Obtener las claves públicas de cada dirección:

```bash
# Usa TUS direcciones reales del paso anterior
bitcoin-cli -testnet getaddressinfo "DIRECCION_ALICE"
bitcoin-cli -testnet getaddressinfo "DIRECCION_BOB"  
bitcoin-cli -testnet getaddressinfo "DIRECCION_CHARLIE"
```

**Busca el campo `"pubkey"` en cada resultado**

#### 3. Crear el script MultiSig 2-of-3:

```bash
bitcoin-cli -testnet createmultisig 2 '["PUBKEY_ALICE","PUBKEY_BOB","PUBKEY_CHARLIE"]'
```

**Resultado esperado:**
```json
{
  "address": "2N7X8ZkwR4Yh6L3mN9...",     // ← ¡ESTA ES TU DIRECCION_MULTISIG!
  "redeemScript": "5221abc123def456...",   // ← Guarda esto también (TU_REDEEM_SCRIPT)
  "descriptor": "sh(multi(2,abc123...))"   // Descriptor del wallet
}
```

**🔥 IMPORTANTE: Guarda estos 2 datos:**
- `"address"` = Tu **DIRECCION_MULTISIG** (donde enviarás fondos)
- `"redeemScript"` = Tu **REDEEM_SCRIPT** (lo necesitas para gastar después)

**Ejemplo real de cómo se ve:**
```json
{
  "address": "2NE58e9bQeGMtQv1cWLDAupviC2g3Y96856",
  "redeemScript": "5221abc123def456789...",
  "descriptor": "sh(multi(2,...))"
}
```

---

### **FASE 2: Funding del MultiSig**

#### 4. Verificar fondos disponibles antes de enviar:

```bash
# Comprobar saldo actual en tu wallet
bitcoin-cli -testnet getbalance
```

**Resultado esperado:**
```
0.00197000
```

**🔥 IMPORTANTE: Necesitas al menos 0.00102000 tBTC:**
- 0.001 para enviar al multisig
- ~0.0002 para fees (estimado)

**Si no tienes fondos suficientes:**
```bash
# Obtener dirección para recibir fondos del faucet
bitcoin-cli -testnet getnewaddress "faucet" "bech32"

# Ir a: https://coinfaucet.eu/en/btc-testnet/
# Pegar tu dirección y solicitar fondos
```

#### 5. Enviar fondos al contrato multisig:

```bash
# Usa TU dirección multisig del paso anterior
bitcoin-cli -testnet sendtoaddress "TU_DIRECCION_MULTISIG_DEL_PASO_3" 0.001
```

**Ejemplo con dirección ficticia:**
```bash
bitcoin-cli -testnet sendtoaddress "2NE58e9bQeGMtQv1cWLDAupviC2g3Y96856" 0.001
```

#### 6. Verificar que llegaron los fondos y obtener TXID:

```bash
# Obtener TXID de la transacción anterior
bitcoin-cli -testnet listtransactions "*" 5
```

**Busca en el resultado la transacción que acabas de enviar. Se ve así:**
```json
{
  "address": "2N...",           // ← Tu dirección multisig
  "category": "send", 
  "amount": -0.00100000,        // ← Cantidad enviada (negativa)
  "vout": 0,
  "fee": -0.00000156,
  "txid": "abc123...",          // ← ¡ESTE ES TU TXID_FUNDING!
  "time": 1691234567
}
```

**Guarda estos datos importantes:**
- `"txid"`: Es tu **TXID_FUNDING**
- `"vout"`: Es tu **VOUT_NUMBER** (usualmente 0 o 1)

#### 7. Ver detalles completos del UTXO:

```bash
# Reemplaza con TU txid real
bitcoin-cli -testnet gettransaction "TXID_FUNDING"
```

**En el resultado busca:**
```json
{
  "details": [
    {
      "address": "2N...",       // ← Confirma que es tu multisig
      "category": "send",
      "amount": -0.001,
      "vout": 1                 // ← Confirma el VOUT_NUMBER
    }
  ]
}
```

---

###  PONER COMO SE PUEDE VER DESDE EL BROWSER LA TRANSACCION 
https://blockstream.info/testnet/tx/ecf15992ee1426f5b9d32baa8bf85e0e628e5dab0a1f4ff730db91d47c04656b

### **FASE 3: Gastar desde MultiSig (¡Lo Interesante!)**

#### 8. Crear dirección destino para los fondos:

```bash
bitcoin-cli -testnet getnewaddress "recovered_multisig" "bech32"
```

#### 9. Crear transacción raw usando los datos que obtuviste:

```bash
# Usa TUS datos reales de los pasos anteriores
bitcoin-cli -testnet createrawtransaction \
'[{"txid":"TXID_FUNDING","vout":VOUT_NUMBER}]' \
'{"DIRECCION_DESTINO":0.0009}'
```

**El resultado será algo así:**
```
020000000172ad62f848477e2a3bb34ffb42f6d2ba557a493c91a71d8d01761d972108425501000000fdffffff01905f0100000000001600144a1fcbcdf6a7e6f298abfeb74806c8bcaa9e6a0600000000
```

**🔥 IMPORTANTE: Guarda este resultado:**
***  Esto esta en la maquina Local... aun no esta en la blockchain cuando este firmada !!!!
- Es tu **RAW_TRANSACTION** (para el paso 11)

**Ejemplo con datos ficticios:**
```bash
bitcoin-cli -testnet createrawtransaction \
'[{"txid":"abc123def456...","vout":1}]' \
'{"tb1qx04jp925z3f99rkxv9wrv3ngs5x7fpjnq7tf4a":0.0009}'
```

#### 10. Obtener el scriptPubKey del multisig:

```bash
# Necesitas este dato para firmar - obtenerlo así:
bitcoin-cli -testnet gettransaction "TXID_FUNDING" true
```

**En el resultado busca la sección `"vout"` y encuentra:**
```json
"vout": [
  {
    "value": 0.00100000,
    "n": 1,                     // ← Confirma que coincide con tu VOUT
    "scriptPubKey": {
      "hex": "a914...",          // ← ESTE ES TU SCRIPT_PUB_KEY
      "type": "scripthash",
      "address": "2N..."         // ← Confirma que es tu multisig
    }
  }
]
```

#### 11. Firmar con la primera clave (Alice):

```bash
# Usa TODOS tus datos reales de los pasos anteriores
bitcoin-cli -testnet signrawtransactionwithwallet "RAW_TRANSACTION" \
'[{
  "txid":"TXID_FUNDING",
  "vout":VOUT_NUMBER,
  "scriptPubKey":"SCRIPT_PUB_KEY_HEX",
  "redeemScript":"REDEEM_SCRIPT",
  "amount":0.001
}]'
```

**Ejemplo con datos ficticios:**
```bash
bitcoin-cli -testnet signrawtransactionwithwallet \
"020000000172ad62f848477e2a3bb34ffb42f6d2ba557a493c91a71d8d01761d972108425501000000fdffffff01905f0100000000001600144a1fcbcdf6a7e6f298abfeb74806c8bcaa9e6a0600000000" \
'[{
  "txid":"abc123def456789...",
  "vout":1,
  "scriptPubKey":"a914abcdef123456789...",
  "redeemScript":"5221abc123def456789...",
  "amount":0.001
}]'
```

**El resultado será algo así:**
```json
{
  "hex": "020000000172ad62f848477e2a3bb34ffb42f6d2ba557a493c91a71d8d01761d972108425501000000b500483045022100...",
  "complete": false
}
```

**🔥 IMPORTANTE: Guarda el campo `"hex"`:**
- `"hex"`: Es tu **RESULTADO_FIRMA_ALICE** (para el paso 11)
- `"complete": false`: Necesita más firmas

#### 12. Firmar con la segunda clave (Bob):

```bash
# Usa el "hex" del paso anterior como input
bitcoin-cli -testnet signrawtransactionwithwallet "RESULTADO_FIRMA_ALICE" \
'[{
  "txid":"TXID_FUNDING", 
  "vout":VOUT_NUMBER,
  "scriptPubKey":"SCRIPT_PUB_KEY_HEX",
  "redeemScript":"REDEEM_SCRIPT",
  "amount":0.001
}]'
```

**El resultado será algo así:**
```json
{
  "hex": "020000000172ad62f848477e2a3bb34ffb42f6d2ba557a493c91a71d8d01761d972108425501000000da00483045022100...",
  "complete": true
}
```

**🔥 IMPORTANTE: Guarda el campo `"hex"`:**
- `"hex"`: Es tu **TRANSACCION_CON_2_FIRMAS** (para el paso 13)
- `"complete": true`: Confirma que tiene suficientes firmas

#### 13. Broadcast de la transacción completamente firmada:

```bash
# Usa el "hex" del paso anterior
bitcoin-cli -testnet sendrawtransaction "TRANSACCION_CON_2_FIRMAS"
```

**Ejemplo:**
```bash
bitcoin-cli -testnet sendrawtransaction "020000000172ad62f848477e2a3bb34ffb42f6d2ba557a493c91a71d8d..."
```

---

## 🔍 Anatomía del Script MultiSig

### Script de ejemplo (2-of-3):
```
OP_2                    ← Mínimo 2 firmas requeridas
<pubkey_alice>          ← Clave pública de Alice
<pubkey_bob>            ← Clave pública de Bob  
<pubkey_charlie>        ← Clave pública de Charlie
OP_3                    ← Total de 3 claves públicas
OP_CHECKMULTISIG        ← Verificar firmas múltiples
```

### Para gastar (scriptSig):
```
OP_0                    ← Bug histórico, siempre necesario
<signature_alice>       ← Firma de Alice
<signature_bob>         ← Firma de Bob
<redeemScript>          ← Script completo arriba
```

---

## ⚡ Variaciones Avanzadas

### **Timelock + MultiSig**
```bash
# Multisig que expira después de cierto tiempo
# Si no se usa en X bloques, una sola clave puede recuperar fondos

# Ejemplo: 2-of-3 normal, o 1-of-1 después de 144 bloques (1 día)
```

### **Multisig Anidado (Segwit)**
```bash
# Crear multisig con direcciones bech32 (más eficiente)
bitcoin-cli -testnet createmultisig 2 '["PUBKEYS..."]' "bech32"
```

### **Threshold Signatures con Taproot**
```bash
# Versión más moderna y eficiente (Bitcoin Core 22+)
# Usa Schnorr signatures para mejor privacidad
```

---

## 🚨 Consideraciones de Seguridad

### ✅ **Mejores Prácticas:**

1. **Distribución geográfica** de las claves
2. **Diferentes tipos de dispositivos** (HW wallet, móvil, desktop)
3. **Backup seguro** del redeemScript y claves
4. **Testear en testnet** antes de mainnet
5. **Documentar claramente** quién tiene qué clave

### ⚠️ **Riesgos Comunes:**

1. **Pérdida del redeemScript** = fondos irrecuperables
2. **Pérdida de demasiadas claves** privadas
3. **Coordinación** entre signatarios
4. **Fees más altos** que transacciones simples

---

## 🧪 Ejercicio Práctico

### **Tu Misión:**
1. Crear un 2-of-3 multisig con 3 direcciones nuevas
2. Enviarle 0.001 tBTC desde tu wallet
3. Gastarlo usando 2 de las 3 firmas
4. Recuperar ~0.0009 tBTC en una nueva dirección

### **Comando de Verificación Final:**
```bash
# Ver el multisig gastado en el explorador
https://blockstream.info/testnet/address/TU_DIRECCION_MULTISIG

# Confirmar fondos recuperados
bitcoin-cli -testnet getbalance
```

---

## 🎓 Próximos Pasos

Una vez domines 2-of-3 básico, puedes explorar:

1. **3-of-5 MultiSig** (para organizaciones)
2. **Multisig + Timelock** (herencias automáticas)
3. **Multisig Segwit** (fees más bajos)
4. **Descriptors avanzados** (wallet management)
5. **Hardware Wallet MultiSig** (Ledger, Trezor, etc.)

---

## 📚 Recursos Adicionales

- **Bitcoin Core Documentation**: Multisig commands
- **BIP 11**: M-of-N Standard Transactions
- **BIP 16**: Pay to Script Hash (P2SH)
- **BIP 45**: Structure for Deterministic P2SH Multisignature Wallets

---

*¿Listo para crear tu primer MultiSig en testnet?* 🚀
