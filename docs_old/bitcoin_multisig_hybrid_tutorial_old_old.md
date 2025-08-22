# Tutorial MultiSig Bitcoin Híbrido - VERSIÓN FINAL FUNCIONAL

**Enfoque Híbrido: Bitcoin Core + JavaScript para MultiSig 2-of-3 completo**

Funciona con nodo pruneado: `prune=2000` (solo 2GB de blockchain)

## Qué Aprenderás

Este tutorial te enseña a crear y usar un MultiSig Bitcoin 2-of-3 (se necesitan 2 firmas de 3 posibles) usando un enfoque híbrido que combina:
- **Bitcoin Core**: Para infraestructura de red y gestión de fondos básicos
- **JavaScript**: Para operaciones MultiSig SegWit avanzadas
- **Procedimientos manuales**: Para situaciones donde la automatización falla

## Tabla de Contenidos

1. [Configuración del Entorno](#configuración-del-entorno)
2. [Configuración JavaScript](#configuración-javascript)
3. [Creación del MultiSig](#creación-del-multisig)
4. [Obtención de Fondos](#obtención-de-fondos)
5. [Envío al MultiSig](#envío-al-multisig)
6. [Identificación del UTXO](#identificación-del-utxo)
7. [Gasto desde MultiSig](#gasto-desde-multisig)
8. [Verificación Final](#verificación-final)
9. [Uso en Producción](#uso-en-producción)

## Configuración del Entorno

### Qué estamos haciendo
Configuramos un nodo Bitcoin en testnet (red de pruebas) con mode prune para ahorrar espacio en disco. Este nodo nos permitirá interactuar con la red Bitcoin sin usar dinero real.

### 1. Configurar Bitcoin Core

```bash
# Crear/editar archivo de configuración
nano ~/.bitcoin/bitcoin.conf
```

Agregar este contenido:
```
testnet=1
server=1
rpcuser=tu_usuario
rpcpassword=tu_password_segura
prune=2000
fallbackfee=0.00001
maxconnections=40
```

### 2. Iniciar Bitcoin Core

```bash
# Detener si está corriendo
bitcoin-cli -testnet stop 2>/dev/null; sleep 5

# Iniciar con configuración pruneada
bitcoind -testnet -daemon -prune=2000 -fallbackfee=0.00001
echo "Iniciando nodo pruneado..."
sleep 60

# Verificar estado (debe mostrar progreso cerca del 100%)
bitcoin-cli -testnet getblockchaininfo | grep -E "(blocks|verificationprogress|pruned)"
```

### 3. Crear Wallet para Fondos

```bash
# Crear wallet básico para manejar fondos del faucet
bitcoin-cli -testnet createwallet "funds_wallet" false false "" false false

# Verificar que funciona
bitcoin-cli -testnet getwalletinfo | grep -E "(balance|txcount)"
echo "Wallet para fondos creado exitosamente"
```

**Verificación**: Debes ver información del wallet sin errores.

## Configuración JavaScript

### Qué estamos haciendo
Instalamos Node.js y las bibliotecas necesarias para manejar operaciones criptográficas de Bitcoin. JavaScript nos permitirá crear y firmar transacciones MultiSig que Bitcoin Core no puede manejar nativamente.

### 1. Instalar Dependencias

```bash
# Verificar Node.js
node --version
npm --version

# Si no están instalados
sudo apt install nodejs npm curl

# Crear directorio del proyecto
mkdir bitcoin-multisig-hybrid
cd bitcoin-multisig-hybrid

# Inicializar proyecto
npm init -y

# Instalar bitcoinjs-lib compatible con Node.js 12+
npm install bitcoinjs-lib@5.2.0
```

### 2. Crear Scripts JavaScript

Crear tres archivos usando los artifacts proporcionados:
- `multisig.js` - Operaciones MultiSig principales
- `bitcoin-helper.js` - Interfaz con Bitcoin Core  
- `verify.js` - Verificación y diagnóstico

```bash
# Hacer ejecutables
chmod +x multisig.js bitcoin-helper.js verify.js

# Verificar que funcionan
node verify.js quick
```

**Verificación**: Debe mostrar estado de Bitcoin Core sin errores.

## Creación del MultiSig

### Qué estamos haciendo
Generamos 3 pares de claves criptográficas y creamos una dirección MultiSig 2-of-3. Esto significa que necesitaremos 2 de las 3 claves para gastar fondos, proporcionando seguridad adicional.

### 1. Generar Claves y MultiSig

```bash
# Generar 3 claves y crear MultiSig P2WSH (SegWit)
node multisig.js generate

# Verificar que se crearon los archivos
ls -la keys.json multisig.json

# Obtener dirección MultiSig para uso posterior
MULTISIG_ADDR=$(node multisig.js address)
echo "Tu dirección MultiSig: $MULTISIG_ADDR"
```

**Qué sucede**: El script genera 3 claves privadas/públicas, crea un script MultiSig 2-of-3, y produce una dirección SegWit (empieza con tb1q...). Los archivos JSON guardan esta información para uso posterior.

**Verificación**: Debes ver 3 conjuntos de claves, una dirección MultiSig tb1q..., y archivos JSON creados.

## Obtención de Fondos

### Qué estamos haciendo
Necesitamos fondos de testnet (bitcoins de prueba sin valor real) para demostrar el MultiSig. Usamos "faucets" - sitios web que regalan pequeñas cantidades de bitcoin de testnet.

### 1. Crear Dirección para Faucet

```bash
# Generar dirección para recibir fondos del faucet
FAUCET_ADDR=$(bitcoin-cli -testnet getnewaddress "faucet" "bech32")
echo "Envía tBTC a esta dirección: $FAUCET_ADDR"

echo "Usar estos faucets:"
echo "- https://coinfaucet.eu/en/btc-testnet/"
echo "- https://testnet-faucet.mempool.co/"
echo "- https://bitcoinfaucet.uo1.net/"
```

### 2. Monitorear Fondos

```bash
# Verificar balance hasta que lleguen fondos
while true; do
    BALANCE=$(bitcoin-cli -testnet getbalance)
    echo "Balance actual: $BALANCE tBTC"
    if [ $(echo "$BALANCE > 0" | bc -l) -eq 1 ]; then
        echo "Fondos recibidos!"
        break
    fi
    sleep 30
done
```

**Proceso manual**: 
1. Copia la dirección mostrada
2. Ve a uno de los faucets
3. Pega la dirección y solicita fondos
4. Espera 10-30 minutos

**Verificación**: Balance debe ser mayor a 0.

## Envío al MultiSig

### Qué estamos haciendo
Enviamos parte de nuestros fondos a la dirección MultiSig. Esto "bloquea" los fondos hasta que los gastemos usando 2 de las 3 claves del MultiSig.

### 1. Enviar Fondos al MultiSig

```bash
# Enviar fondos al MultiSig usando Bitcoin Core
SEND_AMOUNT=0.0005
TXID_FUNDING=$(bitcoin-cli -testnet sendtoaddress $MULTISIG_ADDR $SEND_AMOUNT)

# Verificar que se envió
if [ -n "$TXID_FUNDING" ]; then
    echo "Transacción enviada al MultiSig:"
    echo "TXID: $TXID_FUNDING"
    echo "Amount: $SEND_AMOUNT tBTC"
else
    echo "ERROR: No se pudo enviar la transacción"
    echo "Balance actual: $(bitcoin-cli -testnet getbalance)"
    exit 1
fi
```

### 2. Esperar Confirmación

```bash
# Monitorear hasta que se confirme
echo "Esperando confirmación..."
while true; do
    TX_INFO=$(bitcoin-cli -testnet gettransaction "$TXID_FUNDING" 2>/dev/null || echo "{}")
    CONFIRMATIONS=$(echo "$TX_INFO" | jq -r '.confirmations // 0')
    
    if [ "$CONFIRMATIONS" != "null" ] && [ "$CONFIRMATIONS" -ge 1 ]; then
        echo "Transacción confirmada ($CONFIRMATIONS confirmaciones)"
        break
    fi
    
    echo "Confirmaciones: ${CONFIRMATIONS:-0} - Esperando 60 segundos..."
    sleep 60
done
```

**Verificación**: Debe mostrar TXID y luego confirmación exitosa.

## Identificación del UTXO

### Qué estamos haciendo
Una transacción Bitcoin puede tener múltiples outputs (vout 0, vout 1, etc.). Necesitamos identificar cuál output contiene nuestros fondos del MultiSig para poder gastarlos.

### 1. Detectar VOUT del MultiSig

**Método Automático:**
```bash
# Intentar detección automática
VOUT=$(bitcoin-cli -testnet gettransaction $TXID_FUNDING | jq -r --arg addr "$MULTISIG_ADDR" '.details[] | select(.address == $addr) | .vout')

if [ -n "$VOUT" ] && [ "$VOUT" != "null" ]; then
    echo "VOUT detectado automáticamente: $VOUT"
else
    echo "Detección automática falló - procedimiento manual requerido"
fi
```

**Método Manual (cuando falla la automatización):**
```bash
# 1. Ver detalles de la transacción
bitcoin-cli -testnet gettransaction $TXID_FUNDING | jq '.details'

# 2. Buscar en el output la entrada que coincida con tu dirección MultiSig
echo "Buscar la línea con address: $MULTISIG_ADDR"
echo "Y anotar el número en 'vout': X"

# 3. Asignar manualmente
VOUT=0  # Reemplazar con el número que viste
# O
VOUT=1  # Si viste "vout": 1
```

**Ejemplo de interpretación:**
```json
[
  {
    "address": "tb1qjvelm8azc5z2gqx70fflwc9yxuy6xxmdxjcfs6358xguwfke0tqs7my58r",
    "category": "send",
    "amount": -0.0005,
    "vout": 0,    ← Este número es tu VOUT
    "fee": -1.53e-06
  }
]
```

### 2. Obtener Información del UTXO

```bash
# Verificar el UTXO existe y obtener detalles
UTXO_INFO=$(bitcoin-cli -testnet gettxout $TXID_FUNDING $VOUT true)

if [ "$UTXO_INFO" = "null" ] || [ -z "$UTXO_INFO" ]; then
    echo "ERROR: UTXO no encontrado en vout $VOUT"
    echo "Verificar manualmente y ajustar VOUT"
    exit 1
fi

echo "UTXO encontrado:"
echo "$UTXO_INFO"

# Extraer amount en satoshis para JavaScript
AMOUNT_SATS=$(echo $UTXO_INFO | jq -r '.value * 100000000 | floor')
echo "Amount en satoshis: $AMOUNT_SATS"
```

**Verificación**: Debe mostrar información del UTXO con la dirección MultiSig correcta.

## Gasto desde MultiSig

### Qué estamos haciendo
Aquí usamos JavaScript para crear y firmar una transacción que gasta desde el MultiSig. Bitcoin Core no puede hacer esto solo, pero JavaScript con bitcoinjs-lib sí puede manejar las firmas MultiSig SegWit.

### 1. Crear Dirección de Destino

```bash
# Generar dirección donde enviaremos los fondos
DESTINO=$(bitcoin-cli -testnet getnewaddress "destino_final" "bech32")
echo "Dirección de destino: $DESTINO"

# Calcular amount a enviar (restar fee)
FEE_SATS=15000
SEND_AMOUNT_SATS=$((AMOUNT_SATS - FEE_SATS))

echo "Configuración de la transacción:"
echo "- Input: $TXID_FUNDING:$VOUT ($AMOUNT_SATS sats)"
echo "- Output: $DESTINO ($SEND_AMOUNT_SATS sats)"
echo "- Fee: $FEE_SATS sats"
```

### 2. Crear y Firmar Transacción MultiSig

```bash
# Usar JavaScript para crear y firmar la transacción
echo "Creando transacción MultiSig con JavaScript..."
node multisig.js spend $TXID_FUNDING $VOUT $AMOUNT_SATS $DESTINO $SEND_AMOUNT_SATS
```

**Qué sucede**: JavaScript carga las claves privadas, construye una transacción PSBT (Partially Signed Bitcoin Transaction), la firma con 2 de las 3 claves (suficiente para 2-of-3), y produce una transacción completa lista para transmitir.

**Resultado esperado**: Verás el proceso de firma y un comando `bitcoin-cli sendrawtransaction` al final.

### 3. Transmitir Transacción

```bash
# Copiar el hex completo del output anterior y usarlo así:
TX_HEX="020000000001..."  # Pegar el hex completo aquí

# Transmitir usando Bitcoin Core
FINAL_TXID=$(bitcoin-cli -testnet sendrawtransaction $TX_HEX)

echo "Transacción MultiSig transmitida: $FINAL_TXID"
echo "Verificar en: https://blockstream.info/testnet/tx/$FINAL_TXID"
```

**Verificación**: Debe mostrar un TXID de la transacción exitosa.

## Verificación Final

### Qué estamos haciendo
Confirmamos que todo el proceso funcionó correctamente verificando que los fondos llegaron al destino y revisando el balance final.

```bash
# Verificar balance final del wallet
echo "=== VERIFICACIÓN FINAL ==="
FINAL_BALANCE=$(bitcoin-cli -testnet getbalance)
echo "Balance final del wallet: $FINAL_BALANCE tBTC"

# Verificar que los fondos llegaron al destino
DEST_UTXO=$(bitcoin-cli -testnet listunspent 0 999999 | jq --arg addr "$DESTINO" '.[] | select(.address == $addr)')

if [ -n "$DEST_UTXO" ] && [ "$DEST_UTXO" != "null" ]; then
    DEST_AMOUNT=$(echo "$DEST_UTXO" | jq -r '.amount')
    echo "✅ Fondos recibidos en destino: $DEST_AMOUNT tBTC"
else
    echo "⏳ Fondos aún no confirmados en destino"
fi

# Resumen completo del tutorial
echo ""
echo "=== RESUMEN TUTORIAL COMPLETADO ==="
echo "MultiSig Address: $MULTISIG_ADDR"
echo "TXID Funding: $TXID_FUNDING"
echo "TXID Final: $FINAL_TXID"
echo "Destino: $DESTINO"
echo "Amount enviado: $SEND_AMOUNT_SATS sats"
echo "Fee usado: $FEE_SATS sats"
echo ""
echo "✅ Tutorial MultiSig híbrido completado exitosamente"
```

## Uso en Producción

### Diferencias Importantes para Uso Real

**En este tutorial (prueba):**
- Todas las claves están en la misma máquina
- Usamos testnet (sin valor real)
- Un solo usuario controla las 3 claves
- Configuración simple para aprendizaje

**En producción real:**

#### 1. Separación de Claves
```bash
# Cada participante en su propia máquina/dispositivo
Participante 1: Genera su clave en su dispositivo
Participante 2: Genera su clave en su dispositivo  
Participante 3: Genera su clave en su dispositivo

# Intercambio SOLO de claves públicas (nunca privadas)
# Cada uno crea la misma dirección MultiSig usando las 3 claves públicas
```

#### 2. Uso de Hardware Wallets
```bash
# En lugar de claves en archivos de texto:
# - Ledger, Trezor, Coldcard para cada participante
# - Claves nunca salen del dispositivo
# - Firmas se hacen en el hardware wallet
```

#### 3. Coordinación con PSBTs
```bash
# Flujo de firma distribuida:
# 1. Participante A crea PSBT
# 2. Participante A firma y pasa a B
# 3. Participante B firma y pasa a C (si es necesario)
# 4. Cualquiera transmite la transacción final
```

#### 4. Mainnet (Red Principal)
```bash
# Cambiar configuración a mainnet:
# bitcoin.conf:
# testnet=0  # o remover la línea
# prune=2000  # opcional en mainnet también

# IMPORTANTE: Testear exhaustivamente en testnet primero
```

#### 5. Mejores Prácticas de Seguridad

**Backup y Recuperación:**
- Cada participante debe tener backup de su clave privada
- Guardar el redeemScript/witnessScript por separado
- Documentar el esquema MultiSig (2-of-3, direcciones, etc.)
- Probar recuperación en testnet antes de usar en mainnet

**Verificación:**
- Verificar direcciones en múltiples dispositivos
- Confirmar amounts múltiples veces antes de transmitir
- Usar exploradores de blockchain para verificar transacciones

**Gestión de Claves:**
- Nunca compartir claves privadas
- Usar derivation paths diferentes para cada MultiSig
- Considerar usar Shamir Secret Sharing para backups
- Rotación periódica de MultiSigs para grandes cantidades

#### 6. Herramientas Profesionales

Para uso serio, considerar:
- **Sparrow Wallet**: Interfaz gráfica para MultiSig
- **Electrum**: Soporte robusto para MultiSig
- **BTCPay Server**: Para comercios
- **Specter Desktop**: Especializado en MultiSig con hardware wallets

### Limitaciones del Tutorial

Este tutorial es educativo y demuestra conceptos fundamentales. Para uso en producción:
- Auditar el código JavaScript antes de usar con fondos reales
- Implementar validación adicional de transacciones
- Usar bibliotecas más recientes y mantenidas
- Considerar aspectos legales y de cumplimiento según tu jurisdicción

El MultiSig es una herramienta poderosa para seguridad, pero requiere comprensión profunda y prácticas de seguridad rigurosas para uso seguro con fondos reales.