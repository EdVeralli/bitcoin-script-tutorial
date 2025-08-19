# Tutorial Completo: MultiSig Bitcoin con SegWit Nativo

## Qué es MultiSig

**MultiSig (Multi-Signature)** es un tipo de script Bitcoin que requiere **múltiples firmas** de diferentes claves privadas para gastar fondos. Es como tener una caja fuerte que necesita varias llaves para abrirse.

### Tipos Comunes:
- **1-of-2**: Solo 1 firma de 2 posibles (backup/recovery)
- **2-of-2**: Ambas firmas requeridas (escrow básico)
- **2-of-3**: 2 firmas de 3 posibles (más común y práctico)
- **3-of-5**: 3 firmas de 5 posibles (organizaciones)

---

## Método Alternativo: Usando PSBTs (Más Realista)

Para un flujo más cercano a la vida real, puedes usar PSBTs en lugar de transacciones raw:

### Crear PSBT:
```bash
# Crear PSBT financiada automáticamente
bitcoin-cli -testnet walletcreatefundedpsbt \
'[{"txid":"TXID_FUNDING","vout":VOUT_NUMBER}]' \
'[{"DIRECCION_DESTINO":0.0009}]'
```

### Procesar y firmar PSBT:
```bash
# Firmar PSBT (en la vida real, cada participante haría esto en su dispositivo)
bitcoin-cli -testnet walletprocesspsbt "PSBT_BASE64"
```

### Finalizar PSBT:
```bash
# Combinar firmas y finalizar
bitcoin-cli -testnet finalizepsbt "PSBT_FIRMADA"
```

### Broadcast PSBT:
```bash
# Extraer transacción final del PSBT
bitcoin-cli -testnet sendrawtransaction "HEX_EXTRAIDA_DEL_PSBT"
```

**Ventajas de PSBTs:**
- Formato estándar entre wallets diferentes
- Cada participante puede verificar antes de firmar
- Compatible con hardware wallets
- Usado por software moderno (Sparrow, Electrum, etc.)

---

## Casos de Uso Reales

### Empresas
```
CEO + CFO + CTO (2-of-3)
Cualquier combinación de 2 puede autorizar pagos
```

### Escrow/Arbitraje
```
Comprador + Vendedor + Árbitro (2-of-3)
Normal: Comprador + Vendedor
Disputa: Una parte + Árbitro
```

### Seguridad Personal
```
Laptop + Móvil + Hardware Wallet (2-of-3)
Protección contra pérdida de dispositivos
```

---

## Flujo Visual Simplificado

```
CLAVES_PÚBLICAS (paso 2)
    ↓
DESCRIPTOR_MULTISIG (paso 3)
    ↓
IMPORTAR_DESCRIPTOR (paso 4)
    ↓
DIRECCIÓN_MULTISIG (paso 5)
    ↓
ENVIAR_FONDOS (paso 6)
    ↓
CREAR_TRANSACCIÓN (paso 8)
    ↓
FIRMAR_TRANSACCIÓN (paso 9)
    ↓
BROADCAST (paso 10)
```

---

## Implementación Práctica: 2-of-3 MultiSig SegWit

## FASE 0: Preparación del Entorno

### Verificaciones Iniciales Obligatorias

Antes de empezar con MultiSig, asegúrate de que tu entorno esté correctamente configurado:

- Bitcoin Core instalado y funcionando
- Daemon bitcoind corriendo
- Nodo sincronizado (>99%)
- Wallet creado y cargado
- Fondos disponibles (mínimo 0.002 tBTC)

---

### PASO 0.0: Iniciar Bitcoin Core Daemon

#### Verificar si bitcoind ya está corriendo:
```bash
bitcoin-cli -testnet getblockchaininfo
```

**Si obtienes un error de conexión:**
```
error: Could not connect to the server 127.0.0.1:18332
```

#### Iniciar el daemon en testnet:
```bash
bitcoind -testnet -daemon
```

#### Verificar que está corriendo correctamente:
```bash
bitcoin-cli -testnet getblockchaininfo | head -5
```

**IMPORTANTE:** 
- El daemon puede tardar 10-30 segundos en estar completamente listo
- En la primera ejecución, comenzará a descargar la blockchain de testnet

---

### PASO 0.1: Verificar Sincronización del Nodo

```bash
bitcoin-cli -testnet getblockchaininfo | grep verificationprogress
```

**Resultado esperado:**
```
"verificationprogress": 0.999... o 1.0
```

**Si está por debajo de 0.99:**
```bash
watch -n 30 "bitcoin-cli -testnet getblockchaininfo | grep verificationprogress"
```

**Espera hasta que `verificationprogress` sea ≥ 0.999 antes de continuar**

---

### PASO 0.2: Preparar el Wallet

#### Verificar si hay wallet cargado:
```bash
bitcoin-cli -testnet listwallets
```

#### Si está vacío, crear wallet nuevo:
```bash
bitcoin-cli -testnet createwallet "multisig_tutorial"
```

#### Verificar que el wallet está funcionando:
```bash
bitcoin-cli -testnet getwalletinfo
bitcoin-cli -testnet getbalance
```

---

### PASO 0.3: Conseguir Fondos de Testnet

#### Crear dirección para recibir fondos del faucet:
```bash
bitcoin-cli -testnet getnewaddress "faucet" "bech32"
```

#### Solicitar fondos en faucets de testnet:

**Opción recomendada:**
- https://coinfaucet.eu/en/btc-testnet/
- Cantidad típica: ~0.001-0.01 tBTC

**Opciones adicionales:**
- https://testnet-faucet.mempool.co/
- https://bitcoinfaucet.uo1.net/

#### Verificar que llegaron los fondos:
```bash
bitcoin-cli -testnet listtransactions "*" 10
bitcoin-cli -testnet getbalance
```

---

### PASO 0.4: Verificación Final Antes de MultiSig

```bash
bitcoin-cli -testnet getwalletinfo | grep walletname
bitcoin-cli -testnet getbalance
```

**Criterios para continuar:**
- Wallet cargado
- Saldo ≥ 0.002 tBTC
- Al menos 1 confirmación en las transacciones recibidas

---

### PASO 0.5: Solución para Disco Lleno (Pruning)

**Si durante la sincronización encuentras errores de conexión y tu disco está lleno:**

#### Verificar espacio en disco:
```bash
df -h
```

#### Solución con Pruning Mode:
```bash
# 1. Detener Bitcoin completamente
killall bitcoind

# 2. Liberar espacio
rm ~/.bitcoin/testnet3/debug.log
sudo apt-get clean
sudo apt-get autoremove

# 3. Reiniciar con pruning (mantiene solo últimos 2GB)
bitcoind -testnet -daemon -prune=2000

# 4. Monitorear el proceso
watch -n 120 "df -h | grep nvme && echo '---' && du -sh ~/.bitcoin/testnet3/blocks"
```

**Resultado del pruning:**
- Reduce espacio de ~150GB a ~2-5GB
- Libera 140+ GB de espacio en disco
- Permite completar la sincronización sin problemas

**Tiempo del proceso:** 20-45 minutos

---

### Tiempos de Espera Típicos:

- **Sincronización inicial**: 2-6 horas (primera vez)
- **Pruning inicial**: 20-45 minutos (si es necesario)
- **Fondos del faucet**: 10-60 minutos
- **Confirmaciones**: ~10 minutos por confirmación

---

### FASE 1: Crear MultiSig SegWit Nativo

#### 1. Generar 3 direcciones SegWit para simular 3 usuarios:

```bash
# Usuario 1 (Alice) - SegWit nativo
bitcoin-cli -testnet getnewaddress "alice" "bech32"

# Usuario 2 (Bob) - SegWit nativo  
bitcoin-cli -testnet getnewaddress "bob" "bech32"

# Usuario 3 (Charlie) - SegWit nativo
bitcoin-cli -testnet getnewaddress "charlie" "bech32"
```

**IMPORTANTE: Guarda estas direcciones:**
- DIRECCION_ALICE
- DIRECCION_BOB  
- DIRECCION_CHARLIE

#### 2. Extraer y verificar las claves públicas de cada dirección:

```bash
# Usar las direcciones reales del paso anterior
bitcoin-cli -testnet getaddressinfo "DIRECCION_ALICE"
bitcoin-cli -testnet getaddressinfo "DIRECCION_BOB"
bitcoin-cli -testnet getaddressinfo "DIRECCION_CHARLIE"
```

**En cada resultado, verifica y copia la información importante:**

**Verificaciones de seguridad:**
```bash
# Verificar que las claves siguen derivación BIP32 determinista
bitcoin-cli -testnet getaddressinfo "DIRECCION_ALICE" | grep hdkeypath
bitcoin-cli -testnet getaddressinfo "DIRECCION_BOB" | grep hdkeypath
bitcoin-cli -testnet getaddressinfo "DIRECCION_CHARLIE" | grep hdkeypath
```

**Resultado esperado:**
```
"hdkeypath": "m/84'/1'/0'/0/0"
"hdkeypath": "m/84'/1'/0'/0/1"  
"hdkeypath": "m/84'/1'/0'/0/2"
```

**De cada `getaddressinfo`, copia el campo `"pubkey"`:**
```json
{
  "pubkey": "02abcd1234567890...",  // ← Copia esto
  "hdkeypath": "m/84'/1'/0'/0/0",   // ← Confirma derivación BIP32
  "ismine": true                    // ← Confirma que tienes la clave privada
}
```

**IMPORTANTE: Guarda estas claves públicas:**
- PUBKEY_ALICE
- PUBKEY_BOB
- PUBKEY_CHARLIE

**Nota de seguridad:** En producción, cada participante debería usar hardware wallets separados o seeds dedicadas, no el mismo wallet para todas las claves.

#### 3. Crear el descriptor multisig SegWit nativo con checksum:

```bash
# Reemplaza con tus claves públicas reales
bitcoin-cli -testnet getdescriptorinfo "wsh(multi(2,PUBKEY_ALICE,PUBKEY_BOB,PUBKEY_CHARLIE))"
```

**Resultado esperado:**
```json
{
  "descriptor": "wsh(multi(2,02abcd...,02efgh...,02ijkl...))#5a2f3z41",
  "checksum": "5a2f3z41",
  "isrange": false,
  "issolvable": true,
  "hasprivatekeys": false
}
```

**Importancia del checksum:**
El checksum (ej: #5a2f3z41) es crucial porque:
- Detecta errores de tipeo al importar el descriptor
- Asegura integridad del descriptor multisig
- Previene pérdida de fondos por configuración incorrecta

**IMPORTANTE: Guarda el descriptor completo con checksum como DESCRIPTOR_MULTISIG**

**Ejemplo real:**
```
wsh(multi(2,02cc6dcd2c16ffde73b90968245feeae0a2cc43e37da67ab564d2afdf0d7493b6f,02d1e9bb8d1c9cfe6e6c7890331b2763eb028b2267e32dbff34a2603c124ae9c6a,023041e6219ced2965002447fdd272ef00550500d81c1dbee84043cfb679570c74))#xpqxvq49
```

#### 4. Crear el multisig SegWit directamente:

Debido a limitaciones en wallets descriptors modernos, usaremos `createmultisig` que funciona mejor:

```bash
# Crear multisig SegWit nativo directamente
bitcoin-cli -testnet createmultisig 2 '["PUBKEY_ALICE","PUBKEY_BOB","PUBKEY_CHARLIE"]' "bech32"
```

**Usando las claves públicas reales:**
```bash
bitcoin-cli -testnet createmultisig 2 '["037f1787a245c00d5bdec639bd7e76226677fb2b5ad323e5b48b064ebe39b6ac30","0255bbae939310b5a2730f9bc3a562f3c2e221ac476c50332956dfe7df8d83ca6f","024ffc0eb46e86fc577dc75d01995293c8b2d3267e96aa8154b5687538ddbd9273"]' "bech32"
```

**Resultado esperado:**
```json
{
  "address": "tb1q...",
  "redeemScript": "522037f1787a245c00d5bdec639bd7e76226677fb2b5ad323e5b48b064ebe39b6ac30210255bbae939310b5a2730f9bc3a562f3c2e221ac476c50332956dfe7df8d83ca6f21024ffc0eb46e86fc577dc75d01995293c8b2d3267e96aa8154b5687538ddbd927353ae",
  "descriptor": "wsh(multi(2,[fingerprint]pubkey1,[fingerprint]pubkey2,[fingerprint]pubkey3))#checksum"
}
```

**IMPORTANTE: Guarda estos datos:**
- **DIRECCION_MULTISIG**: El campo "address" (empezará con tb1q...)
- **REDEEM_SCRIPT**: El campo "redeemScript" (necesario para firmar)
- **DESCRIPTOR**: El campo "descriptor" (información completa)

---

### FASE 2: Funding del MultiSig

#### 6. Verificar fondos disponibles y estimar fees:

```bash
# Comprobar saldo actual
bitcoin-cli -testnet getbalance

# Estimar fee actual para transacciones SegWit (confirmación en ~6 bloques)
bitcoin-cli -testnet estimatesmartfee 6

# Ver estado del mempool para fees dinámicos
bitcoin-cli -testnet getmempoolinfo
```

**Análisis de fees:**
```bash
# Resultado típico de estimatesmartfee:
{
  "feerate": 0.00001500,  // ← sat/vB actual de la red
  "blocks": 6
}
```

**Cálculo de fondos necesarios:**
- MultiSig SegWit: ~140-160 vBytes típico
- Fee estimado: 160 vB × 0.00001500 = 0.0000024 tBTC
- Total necesario: 0.001 (envío) + 0.0000024 (fee) = ~0.001003 tBTC

```bash
# Enviar fondos al multisig (usar dirección del paso 5)
bitcoin-cli -testnet sendtoaddress "DIRECCION_MULTISIG" 0.001
```

#### 7. Verificar la transacción usando listunspent:

```bash
# Ver transacciones recientes para obtener el TXID
bitcoin-cli -testnet listtransactions "*" 5
```

**Del resultado, guarda:**
- **TXID_FUNDING**: El txid de la transacción
- **VOUT_NUMBER**: El índice de salida (vout) del multisig

```bash
# Método eficiente: usar listunspent para encontrar el UTXO multisig
bitcoin-cli -testnet listunspent | grep -A5 -B5 "DIRECCION_MULTISIG"
```

**Resultado esperado:**
```json
{
  "txid": "abc123def456...",
  "vout": 1,
  "address": "tb1q...",           // ← Tu dirección multisig
  "amount": 0.00100000,
  "confirmations": 2,
  "spendable": true,
  "solvable": true,
  "safe": true,
  "scriptPubKey": "0020abcd..."  // ← Este es tu SCRIPT_PUB_KEY
}
```

**Ventaja de listunspent:** Obtienes automáticamente el scriptPubKey y amount sin decodificar transacciones manualmente.

**IMPORTANTE: Del resultado de listunspent, guarda:**
- **SCRIPT_PUB_KEY**: El campo "scriptPubKey"
- **AMOUNT**: El campo "amount" (debería ser 0.001)

---

### FASE 3: Gastar desde MultiSig SegWit

**CONTEXTO IMPORTANTE:**
En este tutorial, todas las claves están en el mismo wallet. En la vida real, cada participante usaría PSBTs (Partially Signed Bitcoin Transactions) para coordinar las firmas de manera segura.

#### 8. Crear transacción para gastar del multisig:

```bash
# Crear dirección de destino SegWit
bitcoin-cli -testnet getnewaddress "recovered_funds" "bech32"

# Crear transacción raw
bitcoin-cli -testnet createrawtransaction \
'[{"txid":"TXID_FUNDING","vout":VOUT_NUMBER}]' \
'{"DIRECCION_DESTINO":0.0009}'
```

**IMPORTANTE: Guarda el resultado como RAW_TRANSACTION**

#### 9. Firmar la transacción con manejo de errores:

Como el descriptor está correctamente importado en tu wallet, Bitcoin Core puede firmar automáticamente:

```bash
bitcoin-cli -testnet signrawtransactionwithwallet "RAW_TRANSACTION"
```

**Escenarios posibles:**

**Caso exitoso:**
```json
{
  "hex": "02000000...completamente_firmada",
  "complete": true
}
```

**Caso problemático:**
```json
{
  "hex": "02000000...parcialmente_firmada", 
  "complete": false,
  "errors": [
    {
      "error": "Unable to sign input, invalid stack size (possibly missing key)"
    }
  ]
}
```

**Si obtienes `"complete": false`, posibles causas:**
1. El descriptor no está correctamente importado
2. Faltan claves privadas necesarias en el wallet
3. El scriptPubKey o amount son incorrectos

**Solución para `"complete": false`:**
```bash
# Verificar que el descriptor está importado correctamente
bitcoin-cli -testnet getaddressinfo "DIRECCION_MULTISIG"

# Debe mostrar:
# "ismine": true
# "solvable": true  
# "desc": "wsh(multi(2,...))"
```

**IMPORTANTE: Solo continúa si `"complete": true`**

#### 10. Broadcast de la transacción:

```bash
# Enviar la transacción firmada a la red
bitcoin-cli -testnet sendrawtransaction "HEX_TRANSACCION_FIRMADA"
```

**Resultado: Un TXID de confirmación que puedes verificar en el explorador de bloques.**

---

## Cómo sería esto en la VIDA REAL

### Escenario Real - Empresa con 3 Ejecutivos:

#### 1. Setup inicial (una sola vez):
- Cada ejecutivo instala software compatible con PSBTs (Electrum, Sparrow, Specter)
- Cada uno genera su seed phrase/clave privada en su dispositivo (preferiblemente hardware wallet)
- Se reúnen para intercambiar **claves públicas** (nunca claves privadas)
- Crean el descriptor multisig conjunto usando las claves públicas
- Cada uno importa el descriptor en su software como "watch-only"

#### 2. Para hacer un pago:
- CEO crea una PSBT usando su software
- CEO la firma parcialmente y envía el archivo .psbt al CFO por canal seguro
- CFO verifica la transacción, la firma en su dispositivo y la envía al CTO
- CTO verifica, agrega su firma y hace broadcast a la red Bitcoin

#### 3. Herramientas modernas recomendadas:
- **Sparrow Wallet**: Cliente moderno con excelente soporte PSBT y SegWit
- **Electrum**: Interfaz simple con soporte multisig maduro
- **Specter Desktop**: Especializado en multisig con hardware wallets
- **Coldcard + Sparrow**: Configuración enterprise de máxima seguridad
- **Bitcoin Core**: Para máxima verificación y control

#### 4. Formato estándar - PSBTs:
- **PSBT (BIP 174)**: Formato estándar para transacciones parcialmente firmadas
- **Compatibilidad universal**: Funciona entre wallets diferentes
- **Verificación completa**: Cada participante puede verificar destinos y cantidades
- **Seguridad**: Las claves privadas nunca salen de cada dispositivo

### Ventajas del SegWit nativo:
- **Fees 30-40% menores** que transacciones legacy
- **Direcciones más eficientes** (menor tamaño de transacción)
- **Mejor escalabilidad** de la red Bitcoin
- **Preparación para mejoras futuras** como Taproot
- **Mayor capacidad** de transacciones por bloque

---

## Anatomía del Script MultiSig SegWit

### Script de ejemplo (2-of-3):
```
OP_2                    ← Mínimo 2 firmas requeridas
<pubkey_alice>          ← Clave pública de Alice
<pubkey_bob>            ← Clave pública de Bob  
<pubkey_charlie>        ← Clave pública de Charlie
OP_3                    ← Total de 3 claves públicas
OP_CHECKMULTISIG        ← Verificar firmas múltiples
```

### Descriptor SegWit moderno:
```
wsh(multi(2,pubkey1,pubkey2,pubkey3))#checksum
```

**Diferencias clave:**
- `wsh()` = Witness Script Hash (SegWit nativo)
- `sh()` = Script Hash (legacy P2SH)
- SegWit permite fees menores y mejor escalabilidad

---

## Variaciones Avanzadas

### MultiSig con diferentes tipos de direcciones:

#### P2SH-P2WSH (SegWit envuelto):
```bash
# Compatible con wallets que no soportan SegWit nativo
bitcoin-cli -testnet getdescriptorinfo "sh(wsh(multi(2,pubkey1,pubkey2,pubkey3)))"
```

#### Preparación para Taproot:
```bash
# Próxima evolución: Schnorr signatures + threshold schemes
# Mayor privacidad, fees aún menores, firmas indistinguibles
```

### Timelock + MultiSig:
```bash
# MultiSig que permite recuperación después de tiempo específico
# Ejemplo: 2-of-3 normal, o 1-of-1 después de 144 bloques (1 día)
```

---

## Consideraciones de Seguridad

### Mejores Prácticas:

1. **Distribución geográfica** de las claves
2. **Hardware wallets** para claves de producción  
3. **Backup seguro** de seed phrases + información del descriptor
4. **Testear completamente** en testnet antes de mainnet
5. **Documentar claramente** el setup y responsabilidades
6. **Usar PSBTs estándar** para coordinación entre participantes
7. **Verificar siempre** destinos y cantidades antes de firmar
8. **SegWit nativo** para menores fees y mejor eficiencia

### Riesgos Comunes:

1. **Pérdida del descriptor** = dificultad para regenerar direcciones
2. **Pérdida de demasiadas seed phrases** = fondos irrecuperables
3. **Mala coordinación** entre signatarios (usar PSBTs estándar)
4. **Fees ligeramente mayores** que transacciones simples (pero SegWit minimiza esto)
5. **Complejidad operacional** vs. direcciones simples

---

## Ejercicio Práctico

### Tu Misión:
1. Crear un 2-of-3 multisig SegWit usando descriptors modernos
2. Importar el descriptor correctamente al wallet
3. Generar dirección multisig SegWit nativa (tb1q...)
4. Enviarle 0.001 tBTC desde tu wallet principal
5. Gastarlo usando las firmas disponibles en tu wallet
6. Recuperar ~0.0009 tBTC en una nueva dirección SegWit

### Comando de Verificación Final:
```bash
# Ver el multisig en el explorador
https://blockstream.info/testnet/address/TU_DIRECCION_MULTISIG

# Confirmar fondos recuperados
bitcoin-cli -testnet getbalance
```

---

## Próximos Pasos

Una vez domines SegWit MultiSig, puedes explorar:

1. **Multisig Taproot** (máxima privacidad y eficiencia)
2. **PSBTs avanzados** (coordinación profesional entre wallets)
3. **Hardware wallet integration** (Coldcard, Ledger, Trezor)
4. **Multisig con timelock** (herencias automáticas)
5. **Watch-only wallets** (monitoreo sin exposición de claves)
6. **Miniscript** (scripts complejos con descriptors)

---

## Recursos Adicionales

### Documentación Técnica:
- **Bitcoin Core 28.0+**: Output descriptors documentation
- **BIP 380**: Output Script Descriptors General Operation
- **BIP 174**: Partially Signed Bitcoin Transaction Format
- **BIP 141**: Segregated Witness (SegWit)

### Software Recomendado:
- **Sparrow Wallet**: Excelente para PSBTs y SegWit
- **Electrum 4.5+**: MultiSig maduro con descriptors
- **Specter Desktop**: Enfoque enterprise multisig
- **Bitcoin Core**: Máximo control y verificación

¿Listo para crear tu primer MultiSig SegWit moderno?