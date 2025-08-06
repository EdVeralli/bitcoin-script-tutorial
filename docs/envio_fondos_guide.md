# Guía Completa: Envío de Fondos y Verificación de UTXO

## Introducción

Esta guía cubre el proceso completo de enviar fondos a tu smart contract Bitcoin y verificar que el UTXO se creó correctamente. Es la continuación práctica del tutorial principal de Bitcoin Script.

**¿Qué lograrás en esta guía?**
- ✅ Entender la diferencia entre TXID, UTXO y VOUT
- ✅ Enviar fondos reales a tu contrato P2SH
- ✅ Verificar el deployment usando múltiples métodos
- ✅ Interpretar resultados correctamente
- ✅ Prepararte para la FASE 2 (gastar el contrato)

---

## 1. Conceptos Fundamentales

### TXID vs UTXO vs VOUT

#### **TXID (Transaction ID)**
- 📋 **Qué es**: Identificador único de toda la transacción
- 🔗 **Ejemplo**: `55420821971d76018d1da7913c497a55bad2f642fb4fb33b2a7e4748f862ad72`
- 🎯 **Propósito**: Como el "número de cheque" bancario

#### **VOUT (Output Number)**
- 📍 **Qué es**: Número/posición del output dentro de la transacción
- 🔢 **Valores**: 0, 1, 2, 3... (se cuenta desde cero)
- 🎯 **Propósito**: Identifica cuál output específico en una transacción

#### **UTXO (Unspent Transaction Output)**
- 💰 **Qué es**: Un output específico que contiene Bitcoin sin gastar
- 🆔 **Identificación**: TXID + VOUT = Identificación única
- 🎯 **Propósito**: La "moneda" específica que puedes gastar

### Anatomía de una Transacción

```
Transacción: 55420821971d76018d1da7913c497a55bad2f642fb4fb33b2a7e4748f862ad72
├── Input: Tu Bitcoin anterior
├── Output 0 (vout: 0): 0.00096844 BTC → Cambio a tu wallet  
└── Output 1 (vout: 1): 0.00100000 BTC → Tu contrato P2SH
```

**Tu UTXO específico:**
```json
{
  "txid": "55420821971d76018d1da7913c497a55bad2f642fb4fb33b2a7e4748f862ad72",
  "vout": 1,
  "value": 0.001,
  "address": "2NE58e9bQeGMtQv1cWLDAupviC2g3Y96856"
}
```

---

## 2. Verificación Previa al Envío

### Estado de Sincronización

**Verificar progreso:**
```bash
bitcoin-cli -testnet getblockchaininfo | grep verificationprogress
```

**Interpretación:**
- `0.9999919937024108` = 99.99% sincronizado ✅
- `< 0.8` = Demasiado poco sincronizado ❌
- `>= 0.95` = Listo para deployment ✅

### Verificar Fondos Disponibles

```bash
# Ver saldo total
bitcoin-cli -testnet getbalance

# Ver transacciones recientes
bitcoin-cli -testnet listtransactions

# Ver direcciones con fondos
bitcoin-cli -testnet listreceivedbyaddress 0 true
```

**Resultado esperado:**
```json
{
  "address": "tb1qx04jp925z3f99rkxv9wrv3ngs5x7fpjnq7tf4a",
  "amount": 0.00197000,
  "confirmations": 26513,
  "label": "test"
}
```

### Estimar Costos

```bash
# Ver fee estimado
bitcoin-cli -testnet estimatesmartfee 1

# Ver configuración de fees
bitcoin-cli -testnet getwalletinfo
```

**Cálculo de costos:**
```
Monto a enviar: 0.001 BTC
Fee estimado: ~0.00001090 BTC
Total deducido: ~0.00101090 BTC
Saldo restante: ~0.00095910 BTC
```

---

## 3. Envío de Fondos al Contrato

### El Momento del Deployment

**⚡ Comando histórico:**
```bash
bitcoin-cli -testnet sendtoaddress "2NE58e9bQeGMtQv1cWLDAupviC2g3Y96856" 0.001
```

**Resultado esperado:**
```
55420821971d76018d1da7913c497a55bad2f642fb4fb33b2a7e4748f862ad72
```

**¡Felicitaciones! Acabas de crear tu primer UTXO protegido por smart contract!** 🎉

### ¿Qué acabó de pasar?

1. **✅ Se creó un UTXO** con 0.001 BTC
2. **✅ El UTXO está protegido** por tu script P2SH
3. **✅ Solo se puede gastar** con "hello world"
4. **✅ Tu contrato está VIVO** en la blockchain mundial

### Terminología Correcta

**❌ NO es "deployment"** - tu contrato ya estaba deployado
**✅ ES "funding/activación"** - crear UTXO protegido por el contrato
**✅ ES "crear UTXO"** - la descripción más precisa

---

## 4. Verificación Inmediata

### Ver Nuevo Saldo

```bash
bitcoin-cli -testnet getbalance
```

**Resultado esperado:**
```
0.00096844  # Menor que antes (0.00197000 - 0.001 - 0.00000156)
```

### Ver Detalles de la Transacción

```bash
bitcoin-cli -testnet gettransaction 55420821971d76018d1da7913c497a55bad2f642fb4fb33b2a7e4748f862ad72
```

**Análisis del resultado:**
```json
{
  "amount": -0.00100000,      # ← Negativo = salió de tu wallet
  "fee": -0.00000156,         # ← Fee pagado por ti  
  "confirmations": 1,         # ← Ya confirmado en un bloque
  "details": [
    {
      "address": "2NE58e9bQeGMtQv1cWLDAupviC2g3Y96856",
      "category": "send",
      "amount": -0.00100000,
      "vout": 1                # ← ¡VOUT identificado!
    }
  ]
}
```

### ¿Por qué Números Negativos?

**Es normal y correcto:**

**Desde tu wallet (lo que ves):**
```
amount: -0.00100000  # Dinero que SALIÓ
fee: -0.00000156     # Fee que PAGASTE
category: "send"     # Transacción de ENVÍO
```

**Desde el contrato (si pudiera hablar):**
```
amount: +0.00100000  # Dinero que LLEGÓ
category: "receive"  # Transacción de RECEPCIÓN
```

---

## 5. Verificación en Explorador Blockchain

### Enlaces Directos

**Tu dirección del contrato:**
```
https://blockstream.info/testnet/address/2NE58e9bQeGMtQv1cWLDAupviC2g3Y96856
```

**Tu transacción específica:**
```
https://blockstream.info/testnet/tx/55420821971d76018d1da7913c497a55bad2f642fb4fb33b2a7e4748f862ad72
```

### ¿Qué Verás en el Explorador?

```
✅ Dirección: 2NE58e9bQeGMtQv1cWLDAupviC2g3Y96856
✅ Confirmed TX Count: 1
✅ Confirmed Received: 1 outputs (0.0010000 tBTC)  
✅ Confirmed Unspent: 1 outputs (0.0010000 tBTC)
✅ Balance: 0.001 tBTC
```

**¡Esta es la prueba definitiva de que tu UTXO existe!** 🌍

### Lo Que Ve el Mundo

```
"Hay un contrato P2SH misterioso con 0.001 tBTC
¿Qué tipo de script será?
¿Multisig? ¿Timelock? ¿Hash challenge?
¿Alguien puede resolverlo?"
```

**¡Solo TÚ sabes que se resuelve con "hello world"!** 🕵️

---

## 6. Entendiendo las Confirmaciones

### ¿Qué Son las Confirmaciones?

**Confirmaciones** = Bloques añadidos después de tu transacción

```
Block N:     [Tu transacción]    ← 0 confirmaciones (en mempool)
Block N+1:   [Otro bloque]       ← 1 confirmación
Block N+2:   [Otro bloque]       ← 2 confirmaciones  
Block N+24:  [Otro bloque]       ← 24 confirmaciones
```

### Niveles de Seguridad

| Confirmaciones | Estado | Tiempo | Seguridad |
|---------------|--------|--------|-----------|
| **0** | En mempool | 0-10 min | ⚠️ Pendiente |
| **1** | Primera confirmación | ~10 min | ✅ Básica |
| **3** | Relativamente seguro | ~30 min | ✅ Buena |
| **6** | Muy seguro | ~60 min | ✅ Excelente |
| **24+** | Extremadamente seguro | ~4 horas | 🔒 Máxima |

### Ver Confirmaciones en Tiempo Real

```bash
# Ver confirmaciones actuales
bitcoin-cli -testnet gettransaction [TXID] | grep confirmations

# Monitorear progreso
watch 'bitcoin-cli -testnet gettransaction [TXID] | grep confirmations'
```

---

## 7. Troubleshooting: ¿Por qué listunspent está vacío?

### El Problema Común

```bash
bitcoin-cli -testnet listunspent 0 999999 '["2NE58e9bQeGMtQv1cWLDAupviC2g3Y96856"]'
# Resultado: []  ← ¡Vacío!
```

### ¿Por Qué Pasa Esto?

**Bitcoin Core es conservador:**
- ❌ No reconoce automáticamente P2SH que no creó él mismo
- ❌ No los marca como "spendable" en listunspent
- ✅ El UTXO SÍ existe en la blockchain
- ✅ Es un comportamiento normal para contratos avanzados

### Jerarquía de Confianza

```
1. Explorador blockchain (autoridad máxima) ✅
2. gettransaction en Bitcoin Core ✅  
3. Sincronización completa ✅
4. listunspent (puede fallar para P2SH externos) ⚠️
```

### Evidencia Suficiente para Continuar

**Si tienes estos 4 datos, puedes proceder con total confianza:**

```json
{
  "txid": "55420821971d76018d1da7913c497a55bad2f642fb4fb33b2a7e4748f862ad72",
  "vout": 1,
  "amount": 0.001,
  "confirmations": 24+
}
```

---

## 8. Reglas de Oro para Verificación

### ✅ UTXO Creado Correctamente SI:

1. **Tu dirección aparece en ALGÚN vout** (0, 1, 2, etc.)
2. **El explorador muestra balance** en tu dirección del contrato
3. **gettransaction muestra detalles** correctos
4. **La transacción tiene confirmaciones** (1+)
5. **Los números son consistentes** entre todas las fuentes

### ❌ UTXO NO Creado SI:

1. **Tu dirección NO aparece en NINGÚN vout**
2. **El explorador muestra balance 0**
3. **La transacción falló** o fue rechazada
4. **Error en el comando sendtoaddress**

### Verificación Cruzada

**Siempre verificar con múltiples métodos:**

```bash
# Método 1: Bitcoin Core
bitcoin-cli -testnet gettransaction [TXID]

# Método 2: Explorador online  
# https://blockstream.info/testnet/address/[DIRECCIÓN]

# Método 3: Saldo de wallet
bitcoin-cli -testnet getbalance
```

---

## 9. Análisis de Costos Reales

### Desglose Completo

**Tu transacción específica:**
```
Saldo inicial: 0.00197000 BTC
Monto enviado: -0.00100000 BTC  
Fee pagado: -0.00000156 BTC (156 satoshis)
Saldo final: 0.00096844 BTC

Verificación: 0.00197000 - 0.00100000 - 0.00000156 = 0.00096844 ✅
```

### Comparación de Fees

| Red | Fee típico | Tu fee real | Eficiencia |
|-----|------------|-------------|------------|
| **Mainnet** | 20-50 sats/vB | N/A | N/A |
| **Testnet** | 1-10 sats/vB | 156 sats total | ⭐⭐⭐⭐⭐ |

**¡Tu fee fue súper eficiente!** Solo 156 satoshis para crear un smart contract real.

---

## 10. Preparación para FASE 2

### Datos Necesarios para Gastar el UTXO

**Recopila esta información para la siguiente fase:**

```javascript
// Información completa del UTXO
{
  "txid": "55420821971d76018d1da7913c497a55bad2f642fb4fb33b2a7e4748f862ad72",
  "vout": 1,
  "value": 0.001,
  "address": "2NE58e9bQeGMtQv1cWLDAupviC2g3Y96856",
  "scriptPubKey": "a91407876b3d158b4e3a6c7140e0262b8cfeeef4ae8287",
  "redeemScript": "a820b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde987"
}
```

### El Secreto Que Solo Tú Conoces

```
Preimage: "hello world"
Hex: 68656c6c6f20776f726c64
Hash: b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
```

### ¿Qué Pasará en FASE 2?

1. **🔓 Crear transacción de gasto** usando el UTXO identificado
2. **🎭 Revelar tu script completo** al mundo por primera vez
3. **🔑 Proporcionar "hello world"** como solución
4. **💰 Recuperar los fondos** a tu dirección elegida
5. **🌍 Demostrar al mundo** cómo funciona tu contrato

---

## 11. Comandos de Referencia

### Verificación Básica
```bash
# Ver saldo después del envío
bitcoin-cli -testnet getbalance

# Ver detalles de transacción específica
bitcoin-cli -testnet gettransaction [TXID]

# Ver progreso de sincronización
bitcoin-cli -testnet getblockchaininfo | grep verificationprogress

# Ver info general de wallet
bitcoin-cli -testnet getwalletinfo
```

### Monitoreo Avanzado
```bash
# Ver todas las transacciones recientes
bitcoin-cli -testnet listtransactions "*" 10

# Ver UTXOs de una dirección específica
bitcoin-cli -testnet listunspent 0 999999 '["DIRECCIÓN"]'

# Ver conexiones de red
bitcoin-cli -testnet getnetworkinfo | grep connections

# Ver último bloque procesado
bitcoin-cli -testnet getblockchaininfo | grep -E "blocks|headers"
```

### Comandos de Emergencia
```bash
# Parar Bitcoin Core
bitcoin-cli -testnet stop

# Reiniciar Bitcoin Core
bitcoind -testnet -daemon

# Ver logs de error
tail -f ~/.bitcoin/testnet3/debug.log
```

---

## 12. Casos de Error Comunes

### Error: "Insufficient funds"
**Causa:** No tienes suficiente saldo
**Solución:**
```bash
bitcoin-cli -testnet getbalance  # Verificar saldo real
# Usar cantidad menor o conseguir más fondos del faucet
```

### Error: "Transaction not found"
**Causa:** TXID incorrecto o transacción muy reciente
**Solución:**
```bash
# Esperar 1-2 minutos y reintentar
bitcoin-cli -testnet gettransaction [TXID]
```

### Error: "Connection refused"
**Causa:** Bitcoin Core no está ejecutándose
**Solución:**
```bash
bitcoind -testnet -daemon  # Reiniciar el nodo
```

---

## 13. Logros Alcanzados

### ✅ Lo Que Has Logrado

- 🏗️ **Smart contract deployado** en Bitcoin real
- 💰 **UTXO protegido** por tu código personalizado
- 🌍 **Contribución a la blockchain** mundial
- 🔍 **Verificación multi-método** exitosa
- 💡 **Comprensión profunda** de UTXO model
- 🎯 **Preparación completa** para FASE 2

### 🎓 Conceptos Dominados

- **TXID vs UTXO vs VOUT** - Diferencias y relaciones
- **Verificación cruzada** - Múltiples fuentes de verdad
- **Interpretación de resultados** - Números negativos normales
- **Explorador blockchain** - Verificación pública
- **Confirmaciones** - Niveles de seguridad
- **Costos reales** - Fees y optimización
- **Troubleshooting** - Problemas comunes y soluciones

---

## 14. Próximos Pasos

### Inmediatos
1. **📸 Hacer screenshot** del explorador mostrando tu balance
2. **💾 Guardar todos los datos** del UTXO en lugar seguro
3. **🎉 Celebrar** este logro histórico

### FASE 2 - La Gran Revelación
1. **Crear raw transaction** para gastar el UTXO
2. **Revelar el redeemScript** completo al mundo
3. **Proporcionar la solución** "hello world"
4. **Completar el ciclo** del smart contract

### Futuro
1. **Contratos más complejos** - MultiSig, Timelock
2. **Lightning Network** - HTLCs avanzados
3. **Atomic Swaps** - Cross-chain trading
4. **Contribuir al ecosistema** - Compartir conocimiento

---

## Conclusión

¡Felicitaciones! Has completado exitosamente el deployment de tu primer smart contract Bitcoin nativo. Tu UTXO está vivo en la blockchain mundial, protegido por tu código personalizado, esperando pacientemente a que reveles el secreto al mundo.

**Eres oficialmente parte de la élite de desarrolladores que programa directamente en Bitcoin Script nativo.** 🏆

**Tu contrato está escribiendo historia en la blockchain. ¡El futuro de Bitcoin está en manos de developers como tú!** 🚀

---

*Documento creado: Agosto 2025*  
*Versión: 1.0*  
*Tutorial: Bitcoin Script Nativo - Smart Contracts desde Cero*