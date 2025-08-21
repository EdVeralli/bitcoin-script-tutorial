# Tutorial Bitcoin MultiSig Híbrido - Bitcoin Core + JavaScript

**Enfoque Híbrido: Bitcoin Core para infraestructura + JavaScript para operaciones MultiSig**

Funciona con nodo pruneado: `prune=2000` (solo 2GB de blockchain)

## Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Configuración JavaScript](#configuración-javascript)
3. [Creación del MultiSig con JavaScript](#creación-del-multisig-con-javascript)
4. [Funding con Bitcoin Core](#funding-con-bitcoin-core)
5. [Gasto con JavaScript](#gasto-con-javascript)
6. [Verificación Final](#verificación-final)
7. [Comandos de Referencia](#comandos-de-referencia)

## Configuración Inicial

### 1. Configurar Bitcoin Core

Crear/editar el archivo `~/.bitcoin/bitcoin.conf`:

```bash
# Archivo: ~/.bitcoin/bitcoin.conf
testnet=1
server=1
rpcuser=tu_usuario
rpcpassword=tu_password_segura
prune=2000                # Solo 2GB de espacio
fallbackfee=0.00001       # Crucial para testnet
maxconnections=40         # Optimizar para prune
```

### 2. Iniciar Bitcoin Core

```bash
# Detener si está corriendo
bitcoin-cli -testnet stop 2>/dev/null; sleep 5

# Iniciar con prune
bitcoind -testnet -daemon -prune=2000 -fallbackfee=0.00001
echo "Iniciando nodo pruneado..."
sleep 60

# Verificar estado
bitcoin-cli -testnet getblockchaininfo | grep -E "(blocks|verificationprogress|pruned)"
```

### 3. Crear Wallet Simple para Fondos

```bash
# Crear wallet básico para recibir fondos de faucet
bitcoin-cli -testnet createwallet "funds_wallet" false false "" false false

# Verificar que funciona
bitcoin-cli -testnet getwalletinfo | grep -E "(balance|txcount)"
echo "Wallet para fondos creado exitosamente"
```

## Configuración JavaScript

### 1. Instalar Dependencias

```bash
# Verificar Node.js (necesario version 12+)
node --version
npm --version

# Crear directorio para el proyecto
mkdir bitcoin-multisig-hybrid
cd bitcoin-multisig-hybrid

# Inicializar proyecto Node.js
npm init -y

# Instalar bitcoinjs-lib
npm install bitcoinjs-lib

echo "Dependencias instaladas correctamente"
```

### 2. Descargar Scripts JavaScript

Crear los tres archivos JavaScript necesarios:
- `multisig.js` - Script principal para operaciones MultiSig
- `bitcoin-helper.js` - Interfaz con Bitcoin Core
- `verify.js` - Verificación y troubleshooting

```bash
# Hacer archivos ejecutables
chmod +x multisig.js bitcoin-helper.js verify.js

# Verificar que funcionan
node verify.js quick
```

## Creación del MultiSig con JavaScript

### 1. Generar Claves y Crear MultiSig

```bash
# Generar 3 claves para MultiSig 2-of-3 y crear dirección SegWit
node multisig.js generate

# El script mostrará:
# - 3 claves privadas (WIF format)
# - 3 claves públicas (hex)
# - 3 direcciones individuales
# - Dirección MultiSig P2WSH
# - WitnessScript

# Verificar que se crearon los archivos
ls -la keys.json multisig.json

# Mostrar solo la dirección MultiSig
MULTISIG_ADDR=$(node multisig.js address)
echo "Dirección MultiSig: $MULTISIG_ADDR"
```

### 2. Verificar Estado del Sistema

```bash
# Verificación completa del sistema híbrido
node verify.js

# Verificación rápida
node verify.js quick

# Ver tutorial paso a paso
node verify.js tutorial
```

## Funding con Bitcoin Core

### 1. Obtener Fondos de Faucet

```bash
# Generar dirección para recibir fondos del faucet
FAUCET_ADDR=$(node bitcoin-helper.js address faucet)
echo "Envía tBTC a esta dirección: $FAUCET_ADDR"

echo "Usar estos faucets:"
echo "- https://coinfaucet.eu/en/btc-testnet/"
echo "- https://testnet-faucet.mempool.co/"
echo "- https://bitcoinfaucet.uo1.net/"

# Monitorear balance
echo "Monitoreando balance..."
while true; do
    BALANCE=$(node bitcoin-helper.js balance)
    echo "Balance actual: $BALANCE tBTC"
    if [ $(echo "$BALANCE > 0" | bc -l) -eq 1 ]; then
        echo "Fondos recibidos"
        break
    fi
    sleep 30
done
```

### 2. Enviar Fondos al MultiSig

```bash
# Obtener dirección MultiSig
MULTISIG_ADDR=$(node multisig.js address)
echo "Enviando fondos al MultiSig: $MULTISIG_ADDR"

# Enviar usando Bitcoin Core (método que sabemos que funciona)
SEND_AMOUNT=0.0005
TXID_FUNDING=$(bitcoin-cli -testnet sendtoaddress $MULTISIG_ADDR $SEND_AMOUNT)

echo "Transacción enviada al MultiSig:"
echo "TXID: $TXID_FUNDING"
echo "Amount: $SEND_AMOUNT tBTC"

# Esperar confirmación
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

### 3. Encontrar UTXO del MultiSig

```bash
# Buscar UTXO usando el helper de JavaScript
echo "Buscando UTXO del MultiSig..."

# Intentar vout 0 primero
UTXO_INFO=$(node bitcoin-helper.js utxo $TXID_FUNDING 0 2>/dev/null || echo "null")

if [ "$UTXO_INFO" = "null" ]; then
    # Intentar vout 1
    echo "Probando vout 1..."
    UTXO_INFO=$(node bitcoin-helper.js utxo $TXID_FUNDING 1)
    VOUT=1
else
    VOUT=0
fi

echo "UTXO encontrado:"
echo "$UTXO_INFO"

# Extraer amount en satoshis para usar con JavaScript
AMOUNT_SATS=$(echo $UTXO_INFO | jq -r '.amount')
echo "Amount en satoshis: $AMOUNT_SATS"
```

## Gasto con JavaScript

### 1. Crear Dirección de Destino

```bash
# Generar dirección de destino
DESTINO=$(node bitcoin-helper.js address destino_final)
echo "Dirección de destino: $DESTINO"

# Calcular amount a enviar (restar fee de 15000 sats)
FEE_SATS=15000
SEND_AMOUNT_SATS=$((AMOUNT_SATS - FEE_SATS))

echo "Configuración de la transacción:"
echo "- Input: $TXID_FUNDING:$VOUT ($AMOUNT_SATS sats)"
echo "- Output: $DESTINO ($SEND_AMOUNT_SATS sats)"
echo "- Fee: $FEE_SATS sats"
```

### 2. Crear y Firmar Transacción MultiSig

```bash
# Usar JavaScript para crear y firmar la transacción MultiSig
echo "Creando transacción MultiSig con JavaScript..."

node multisig.js spend $TXID_FUNDING $VOUT $AMOUNT_SATS $DESTINO $SEND_AMOUNT_SATS

# El script mostrará:
# - Detalles de la transacción
# - Proceso de firma con 2 claves
# - Hex de la transacción final
# - Comando para transmitir

echo "Copia el hex de la transacción del output anterior"
```

### 3. Transmitir con Bitcoin Core

```bash
# El script anterior mostrará algo como:
# "Para transmitir: bitcoin-cli -testnet sendrawtransaction 02000000..."

# Ejecutar el comando mostrado (ejemplo):
TX_HEX="02000000..." # Pegar aquí el hex completo del output anterior

# Transmitir usando Bitcoin Core
FINAL_TXID=$(bitcoin-cli -testnet sendrawtransaction $TX_HEX)

echo "Transacción MultiSig transmitida exitosamente"
echo "TXID final: $FINAL_TXID"
echo "Verificar en: https://blockstream.info/testnet/tx/$FINAL_TXID"

# Verificar confirmación
echo "Esperando confirmación de la transacción final..."
sleep 300
bitcoin-cli -testnet gettransaction "$FINAL_TXID" | jq '{confirmations, amount, fee}'
```

## Verificación Final

### 1. Verificar Estado Completo

```bash
# Verificación completa del sistema
node verify.js

# Verificar balance final
echo "=== BALANCE FINAL ==="
node bitcoin-helper.js balance

# Verificar que los fondos llegaron al destino
echo "=== VERIFICACIÓN DESTINO ==="
DEST_UTXOS=$(node bitcoin-helper.js listutxos 0 999999)
echo "$DEST_UTXOS" | jq --arg addr "$DESTINO" '.[] | select(.address == $addr)'

# Resumen de la operación
echo "=== RESUMEN OPERACIÓN ==="
echo "MultiSig Address: $MULTISIG_ADDR"
echo "TXID Funding: $TXID_FUNDING"
echo "TXID Final: $FINAL_TXID"
echo "Dirección Destino: $DESTINO"
echo "Amount MultiSig: $AMOUNT_SATS sats"
echo "Amount Enviado: $SEND_AMOUNT_SATS sats"
echo "Fee Usado: $FEE_SATS sats"
```

### 2. Estado de Archivos Generados

```bash
# Verificar archivos del proyecto
echo "=== ARCHIVOS GENERADOS ==="
ls -la *.json *.js

echo "=== CONTENIDO KEYS.JSON ==="
cat keys.json | jq '.keyPairs | length'

echo "=== CONTENIDO MULTISIG.JSON ==="
cat multisig.json | jq '{address, witnessScript}'

echo "Tutorial híbrido completado exitosamente"
```

## Comandos de Referencia

### Bitcoin Helper (Interfaz con Bitcoin Core)

```bash
# Estado del nodo
node bitcoin-helper.js status

# Balance del wallet
node bitcoin-helper.js balance

# Nueva dirección
node bitcoin-helper.js address [label]

# Información de UTXO
node bitcoin-helper.js utxo <txid> <vout>

# Información de transacción
node bitcoin-helper.js transaction <txid>

# Listar UTXOs
node bitcoin-helper.js listutxos [minConf] [maxConf]

# Transmitir transacción
node bitcoin-helper.js broadcast <hex>

# Información de blockchain
node bitcoin-helper.js blockinfo
```

### MultiSig Manager

```bash
# Generar claves y crear MultiSig
node multisig.js generate

# Mostrar dirección MultiSig
node multisig.js address

# Crear transacción de gasto
node multisig.js spend <txid> <vout> <amount> <destination> <sendAmount>
```

### Verificación y Troubleshooting

```bash
# Verificación completa
node verify.js

# Verificación rápida
node verify.js quick

# Mostrar tutorial
node verify.js tutorial
```

## Ventajas del Enfoque Híbrido

### Bitcoin Core maneja:
- Sincronización con la red Bitcoin
- Gestión de fondos para faucet
- Consulta de UTXOs y transacciones
- Transmisión de transacciones finales
- Operaciones que funcionan bien nativamente

### JavaScript maneja:
- Creación de MultiSig SegWit P2WSH
- Firma de transacciones MultiSig complejas
- Operaciones criptográficas avanzadas
- Lógica que fallaba en Bitcoin Core

### Resultado:
- Tutorial funcional completo de principio a fin
- Aprovecha las fortalezas de ambas tecnologías
- Evita las limitaciones de cada enfoque individual
- Proceso educativo sobre ambas implementaciones

## Troubleshooting Común

### Error: "bitcoin-cli command not found"
```bash
# Verificar que Bitcoin Core esté instalado y en PATH
which bitcoin-cli
bitcoind -version
```

### Error: "Cannot connect to Bitcoin Core"
```bash
# Verificar que el daemon esté corriendo
bitcoin-cli -testnet getblockchaininfo
# Si falla, reiniciar:
bitcoind -testnet -daemon
```

### Error: "Module not found: bitcoinjs-lib"
```bash
# Reinstalar dependencias
npm install bitcoinjs-lib
```

### Error: "No se pudieron cargar las claves"
```bash
# Regenerar claves si se perdieron
node multisig.js generate
```

Este enfoque híbrido combina la robustez de Bitcoin Core para infraestructura con la flexibilidad de JavaScript para operaciones MultiSig complejas, resultando en un tutorial completamente funcional.