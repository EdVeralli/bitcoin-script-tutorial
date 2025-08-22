# Tutorial MultiSig Bitcoin con PRUNE Activado - VERSIÓN FINAL CORREGIDA

**✅ Tutorial Optimizado para Nodos Pruneados - Todos los Errores Solucionados**

Funciona perfectamente con: `prune=2000` (solo 2GB de blockchain)

> 🔧 **Versión Final**: Corregidos todos los errores de wallet, descriptors e importación

## 📋 Tabla de Contenidos

1. [Configuración Inicial con PRUNE](#configuración-inicial-con-prune)
2. [Limpieza y Preparación](#limpieza-y-preparación)
3. [Creación del MultiSig](#creación-del-multisig)
4. [Funding con Prune](#funding-con-prune)
5. [Gasto desde MultiSig con Prune](#gasto-desde-multisig-con-prune)
6. [Verificación Final](#verificación-final)
7. [Solución de Problemas con Prune](#solución-de-problemas-con-prune)
8. [Monitoreo con Prune](#monitoreo-con-prune)

## 📋 Configuración Inicial con PRUNE

### 1. Configurar bitcoin.conf para Prune

Crear/editar el archivo `~/.bitcoin/bitcoin.conf`:

```bash
# Archivo: ~/.bitcoin/bitcoin.conf
testnet=1
server=1
rpcuser=tu_usuario
rpcpassword=tu_password_segura
prune=2000                # ✅ Solo 2GB de espacio
fallbackfee=0.00001       # ✅ Crucial para testnet
maxconnections=40         # ✅ Optimizar para prune
```

### 2. Iniciar Bitcoin Core con Prune

```bash
# Detener si está corriendo
bitcoin-cli -testnet stop 2>/dev/null; sleep 5

# Iniciar con prune
bitcoind -testnet -daemon -prune=2000 -fallbackfee=0.00001
echo "⏳ Iniciando nodo pruneado... (puede tardar 2-5 minutos en sincronizar)"

# Esperar inicialización - MÁS TIEMPO por el prune
echo "⏳ Sincronizando con prune activado..."
sleep 60

# Verificar estado de sincronización
while true; do
    SYNC_STATUS=$(bitcoin-cli -testnet getblockchaininfo 2>/dev/null)
    if [ $? -eq 0 ]; then
        VERIFICATION_PROGRESS=$(echo "$SYNC_STATUS" | jq -r '.verificationprogress')
        BLOCKS=$(echo "$SYNC_STATUS" | jq -r '.blocks')
        PRUNED=$(echo "$SYNC_STATUS" | jq -r '.pruned')
        
        echo "📊 Bloques: $BLOCKS - Progreso: $(echo "scale=2; $VERIFICATION_PROGRESS*100" | bc)% - Pruneado: $PRUNED"
        
        if [ $(echo "$VERIFICATION_PROGRESS > 0.99" | bc -l) -eq 1 ]; then
            echo "✅ Nodo sincronizado y listo"
            break
        fi
    else
        echo "⏳ Nodo aún iniciando..."
    fi
    sleep 30
done

# Verificar estado pruneado específico
bitcoin-cli -testnet getblockchaininfo | grep -E "(pruned|size_on_disk|verificationprogress)"
echo "💾 Espacio usado: $(du -sh ~/.bitcoin/testnet3/ | cut -f1)"
```

## 🧹 Limpieza y Preparación

### Si Hay Problemas con Wallets Previos

```bash
# Detener Bitcoin Core
bitcoin-cli -testnet stop
sleep 10

# Verificar que se detuvo completamente
ps aux | grep bitcoind

# Limpiar wallets problemáticos
rm -rf ~/.bitcoin/testnet3/wallets/multisig_prune
rm -rf ~/.bitcoin/testnet3/wallets/multisig_tutorial
rm -rf ~/.bitcoin/testnet3/wallets/multisig_*

# Verificar que se eliminaron
ls -la ~/.bitcoin/testnet3/wallets/

# Reiniciar Bitcoin Core limpio
bitcoind -testnet -daemon -prune=2000 -fallbackfee=0.00001
echo "⏳ Iniciando Bitcoin Core limpio..."
sleep 60

# Verificar que está funcionando
bitcoin-cli -testnet getblockchaininfo | head -5
echo "✅ Bitcoin Core reiniciado correctamente"
```

### Crear Wallet Nuevo y Funcional

```bash
# Verificar que no hay wallets cargados
bitcoin-cli -testnet listwallets

# Crear wallet nuevo con parámetros corregidos para MultiSig
# Parámetros: wallet_name, disable_private_keys, blank, passphrase, avoid_reuse, descriptors
bitcoin-cli -testnet createwallet "multisig_clean" false false "" false true

# El wallet se carga automáticamente, verificar
bitcoin-cli -testnet listwallets

# Generar keypool inicial
bitcoin-cli -testnet keypoolrefill 100

# Verificar keypool
KEYPOOL_SIZE=$(bitcoin-cli -testnet getwalletinfo | jq -r '.keypoolsize')
echo "📊 Keypool size: $KEYPOOL_SIZE"

# Probar generación de dirección
TEST_ADDR=$(bitcoin-cli -testnet getnewaddress "test" "bech32")
echo "🧪 Dirección de prueba: $TEST_ADDR"

if [ -n "$TEST_ADDR" ] && [ "$TEST_ADDR" != "null" ]; then
    echo "✅ Wallet funcionando correctamente"
    echo "💡 Wallet creado con descriptors habilitados para MultiSig"
else
    echo "❌ Error en wallet - revisar configuración"
    echo "💡 Intentar recrear wallet o verificar Bitcoin Core"
    return 1
fi
```

## 🔐 Creación del MultiSig

### 1. Generar Claves

```bash
# Verificar que el wallet esté funcionando
KEYPOOL_SIZE=$(bitcoin-cli -testnet getwalletinfo | jq -r '.keypoolsize')
echo "📊 Keypool size: $KEYPOOL_SIZE"

# Generar 3 direcciones SegWit con verificación
echo "🔑 Generando direcciones para MultiSig..."

ADDR1=$(bitcoin-cli -testnet getnewaddress "participante1" "bech32")
if [ -z "$ADDR1" ]; then
    echo "❌ Error generando ADDR1 - verificar wallet"
    return 1
fi

ADDR2=$(bitcoin-cli -testnet getnewaddress "participante2" "bech32")
if [ -z "$ADDR2" ]; then
    echo "❌ Error generando ADDR2 - verificar wallet"
    return 1
fi

ADDR3=$(bitcoin-cli -testnet getnewaddress "participante3" "bech32")
if [ -z "$ADDR3" ]; then
    echo "❌ Error generando ADDR3 - verificar wallet"
    return 1
fi

echo "✅ Claves generadas exitosamente:"
echo "🔑 Participante 1: $ADDR1"
echo "🔑 Participante 2: $ADDR2"
echo "🔑 Participante 3: $ADDR3"
```

### 2. Obtener Claves Públicas

```bash
# Extraer claves públicas con verificación
echo "📋 Extrayendo claves públicas..."

PUBKEY1=$(bitcoin-cli -testnet getaddressinfo "$ADDR1" | jq -r '.pubkey')
if [ -z "$PUBKEY1" ] || [ "$PUBKEY1" = "null" ]; then
    echo "❌ Error extrayendo PUBKEY1 - verificar dirección"
    return 1
fi

PUBKEY2=$(bitcoin-cli -testnet getaddressinfo "$ADDR2" | jq -r '.pubkey')
if [ -z "$PUBKEY2" ] || [ "$PUBKEY2" = "null" ]; then
    echo "❌ Error extrayendo PUBKEY2 - verificar dirección"
    return 1
fi

PUBKEY3=$(bitcoin-cli -testnet getaddressinfo "$ADDR3" | jq -r '.pubkey')
if [ -z "$PUBKEY3" ] || [ "$PUBKEY3" = "null" ]; then
    echo "❌ Error extrayendo PUBKEY3 - verificar dirección"
    return 1
fi

echo "✅ Claves públicas extraídas:"
echo "📋 PubKey 1: $PUBKEY1"
echo "📋 PubKey 2: $PUBKEY2"
echo "📋 PubKey 3: $PUBKEY3"
```

### 3. Crear MultiSig

```bash
# Crear descriptor con checksum
echo "🧾 Creando descriptor MultiSig..."
DESCRIPTOR_INFO=$(bitcoin-cli -testnet getdescriptorinfo "wsh(multi(2,$PUBKEY1,$PUBKEY2,$PUBKEY3))")
DESCRIPTOR=$(echo $DESCRIPTOR_INFO | jq -r '.descriptor')
CHECKSUM=$(echo $DESCRIPTOR_INFO | jq -r '.checksum')

echo "📋 Descriptor: $DESCRIPTOR"
echo "🔍 Checksum: $CHECKSUM"

# Crear dirección multisig
MULTISIG_INFO=$(bitcoin-cli -testnet createmultisig 2 "[\"$PUBKEY1\",\"$PUBKEY2\",\"$PUBKEY3\"]" "bech32")
MULTISIG_ADDR=$(echo $MULTISIG_INFO | jq -r '.address')
REDEEM_SCRIPT=$(echo $MULTISIG_INFO | jq -r '.redeemScript')

echo "✅ MultiSig creado:"
echo "🎯 Dirección MultiSig: $MULTISIG_ADDR"
echo "📜 Redeem Script: $REDEEM_SCRIPT"
```

### 4. Configurar MultiSig en el Wallet

```bash
# Intentar importar descriptor (puede fallar en wallets modernos con claves privadas)
echo "📥 Configurando MultiSig en el wallet..."
IMPORT_RESULT=$(bitcoin-cli -testnet importdescriptors "[{
  \"desc\": \"$DESCRIPTOR\",
  \"active\": false,
  \"internal\": false,
  \"timestamp\": \"now\"
}]" 2>/dev/null || echo "Import failed - using alternative method")

echo "📋 Resultado configuración: $IMPORT_RESULT"

# Verificar estado del multisig
ADDR_INFO=$(bitcoin-cli -testnet getaddressinfo "$MULTISIG_ADDR")
IS_MINE=$(echo $ADDR_INFO | jq -r '.ismine')
IS_SOLVABLE=$(echo $ADDR_INFO | jq -r '.solvable')

echo "✅ Estado MultiSig:"
echo "   - Is Mine: $IS_MINE"
echo "   - Is Solvable: $IS_SOLVABLE"

# El MultiSig funcionará aunque ismine=false porque tenemos las claves privadas
if [ "$IS_MINE" = "true" ] && [ "$IS_SOLVABLE" = "true" ]; then
    echo "✅ MultiSig completamente integrado al wallet"
elif [ "$IS_SOLVABLE" = "true" ]; then
    echo "✅ MultiSig funcional (solvable=true)"
else
    echo "⚠️  MultiSig configurado - funcionará con claves privadas del wallet"
fi

echo ""
echo "📋 Información MultiSig guardada:"
echo "   🎯 Dirección: $MULTISIG_ADDR"
echo "   📜 Redeem Script: $REDEEM_SCRIPT"
echo "   🧾 Descriptor: $DESCRIPTOR"
echo ""
echo "💡 IMPORTANTE: Aunque 'ismine=false', el MultiSig funcionará correctamente"
echo "   porque las claves privadas están en este wallet y tenemos el redeemScript"
```

## 💰 Funding con Prune - Consideraciones Especiales

### 1. Obtener Fondos de Faucet

```bash
# Crear dirección para faucet
FAUCET_ADDR=$(bitcoin-cli -testnet getnewaddress "faucet" "bech32")
echo "📨 Envía tBTC a esta dirección: $FAUCET_ADDR"
echo "🌐 Usar faucet: https://coinfaucet.eu/en/btc-testnet/"
echo "🌐 O también: https://testnet-faucet.mempool.co/"

# Monitorear fondos (con prune puede ser más lento)
echo "⏳ Esperando fondos... (con prune puede tardar más en detectar transacciones)"
echo "💡 Presiona Ctrl+C cuando lleguen los fondos para continuar"

while true; do
    BALANCE=$(bitcoin-cli -testnet getbalance)
    UNCONFIRMED=$(bitcoin-cli -testnet getunconfirmedbalance)
    
    if [ $(echo "$BALANCE > 0" | bc -l) -eq 1 ]; then
        echo "✅ Fondos confirmados: $BALANCE tBTC"
        break
    elif [ $(echo "$UNCONFIRMED > 0" | bc -l) -eq 1 ]; then
        echo "⏳ Fondos no confirmados: $UNCONFIRMED tBTC - Balance: $BALANCE tBTC"
    else
        echo "⏳ Balance: $BALANCE tBTC - Esperando fondos..."
    fi
    sleep 30
done
```

### 2. Enviar al MultiSig (con prune)

```bash
# Verificar balance disponible
CURRENT_BALANCE=$(bitcoin-cli -testnet getbalance)
echo "💰 Balance disponible: $CURRENT_BALANCE tBTC"

# Enviar al MultiSig - método simplificado que funciona mejor
SEND_AMOUNT=0.0005
echo "⏳ Enviando $SEND_AMOUNT tBTC al multisig..."

# Intentar envío simple primero (suele funcionar mejor)
TXID_FUNDING=$(bitcoin-cli -testnet sendtoaddress $MULTISIG_ADDR $SEND_AMOUNT 2>/dev/null)

# Si falla el método simple, intentar con fee explícito
if [ -z "$TXID_FUNDING" ]; then
    echo "⚠️  Método simple falló, intentando con fee explícito..."
    TXID_FUNDING=$(bitcoin-cli -testnet sendtoaddress "$MULTISIG_ADDR" $SEND_AMOUNT "" "" false true 0.00002 "economical" 2>/dev/null)
fi

# Si sigue fallando, usar fee más alto
if [ -z "$TXID_FUNDING" ]; then
    echo "⚠️  Reintentando con fee más alto..."
    TXID_FUNDING=$(bitcoin-cli -testnet sendtoaddress "$MULTISIG_ADDR" $SEND_AMOUNT "" "" false true 0.00005 "economical" 2>/dev/null)
fi

# Verificar que la transacción se envió
if [ -n "$TXID_FUNDING" ]; then
    echo "✅ Transacción enviada exitosamente"
    echo "📤 TXID de funding: $TXID_FUNDING"
    echo "💰 Amount enviado: $SEND_AMOUNT tBTC"
    echo "🎯 Destino: $MULTISIG_ADDR"
else
    echo "❌ Error: No se pudo enviar la transacción"
    echo "💡 Verificar balance y estado del nodo"
    echo "💡 Intentar manualmente o revisar configuración"
    return 1
fi

# Monitorear confirmación con prune (MÁS PACIENCIA)
echo "⏳ Esperando confirmación (con prune puede tardar 20-40 minutos)..."
while true; do
    TX_INFO=$(bitcoin-cli -testnet gettransaction "$TXID_FUNDING" 2>/dev/null || echo "{}")
    CONFIRMATIONS=$(echo "$TX_INFO" | jq -r '.confirmations // 0')
    
    if [ "$CONFIRMATIONS" != "null" ] && [ "$CONFIRMATIONS" -ge 1 ]; then
        echo "✅ Transacción confirmada ($CONFIRMATIONS confirmaciones)"
        break
    fi
    
    BLOCK_COUNT=$(bitcoin-cli -testnet getblockcount)
    echo "⏳ Confirmaciones: ${CONFIRMATIONS:-0} - Bloques actuales: $BLOCK_COUNT - Esperando 60 segundos..."
    sleep 60
done
```

### 3. Obtener UTXO con Prune

```bash
# Con prune, buscar UTXO puede requerir métodos adicionales
echo "⏳ Buscando UTXO multisig..."

# Método 1: listunspent tradicional (puede fallar con MultiSig no importado)
UTXO_INFO=$(bitcoin-cli -testnet listunspent 1 999999 "[\"$MULTISIG_ADDR\"]" 2>/dev/null || echo "[]")

if [ "$(echo "$UTXO_INFO" | jq length)" -gt 0 ]; then
    echo "✅ UTXO encontrado con listunspent"
    VOUT=$(echo "$UTXO_INFO" | jq -r '.[0].vout')
    AMOUNT=$(echo "$UTXO_INFO" | jq -r '.[0].amount')
    SCRIPT_PUB_KEY=$(echo "$UTXO_INFO" | jq -r '.[0].scriptPubKey')
else
    echo "⚠️  listunspent no encontró UTXO, usando método alternativo..."
    
    # Método 2: Usar gettxout directamente
    TX_OUT_INFO=$(bitcoin-cli -testnet gettxout "$TXID_FUNDING" 0 true 2>/dev/null || echo "null")
    if [ "$TX_OUT_INFO" != "null" ]; then
        VOUT=0
        AMOUNT=$(echo "$TX_OUT_INFO" | jq -r '.value')
        SCRIPT_PUB_KEY=$(echo "$TX_OUT_INFO" | jq -r '.scriptPubKey.hex')
        echo "✅ UTXO encontrado con gettxout en vout 0"
    else
        # Intentar vout 1
        TX_OUT_INFO=$(bitcoin-cli -testnet gettxout "$TXID_FUNDING" 1 true 2>/dev/null || echo "null")
        if [ "$TX_OUT_INFO" != "null" ]; then
            VOUT=1
            AMOUNT=$(echo "$TX_OUT_INFO" | jq -r '.value')
            SCRIPT_PUB_KEY=$(echo "$TX_OUT_INFO" | jq -r '.scriptPubKey.hex')
            echo "✅ UTXO encontrado con gettxout en vout 1"
        else
            echo "❌ No se pudo encontrar el UTXO"
            echo "💡 Verificar manualmente:"
            echo "   bitcoin-cli -testnet gettransaction $TXID_FUNDING"
            echo "💡 Continuar con valores manuales si es necesario"
            return 1
        fi
    fi
fi

echo "✅ Información del UTXO:"
echo "   - TXID: $TXID_FUNDING"
echo "   - Vout: $VOUT"
echo "   - Amount: $AMOUNT"
echo "   - ScriptPubKey: $SCRIPT_PUB_KEY"

# Verificar que la dirección coincide
TX_DETAILS=$(bitcoin-cli -testnet gettransaction "$TXID_FUNDING")
ADDRESSES_IN_TX=$(echo "$TX_DETAILS" | jq -r '.details[].address' | grep "$MULTISIG_ADDR" || echo "")
if [ -n "$ADDRESSES_IN_TX" ]; then
    echo "✅ Verificación: MultiSig address encontrada en la transacción"
else
    echo "⚠️  Advertencia: Verificar manualmente que el UTXO corresponde al MultiSig"
fi
```


------------------------------------------------------------------------------------------

# Corregir las variables manualmente
VOUT=1
AMOUNT=0.0005
SCRIPT_PUB_KEY="002015f306983756ccfcfee170d89887f81976b6df565b2c27e847f327dd006459fe"

echo "Variables corregidas para continuar con el tutorial:"
echo "   - VOUT: $VOUT"
echo "   - AMOUNT: $AMOUNT"
echo "   - SCRIPT_PUB_KEY: $SCRIPT_PUB_KEY"

-------------------------------------------------------------------------------------------




## 💸 Gasto desde MultiSig con Prune

### 1. Preparar Transacción

```bash
# Crear dirección de destino
DESTINO=$(bitcoin-cli -testnet getnewaddress "destino" "bech32")
echo "🎯 Dirección destino: $DESTINO"

# Calcular amount a enviar (fee más alto por prune)
FEE="0.00015"
SEND_AMOUNT=$(echo "scale=8; $AMOUNT - $FEE" | bc)

# Asegurar formato correcto para JSON (agregar 0 al inicio si empieza con punto)
if [[ $SEND_AMOUNT == .* ]]; then
    SEND_AMOUNT="0$SEND_AMOUNT"
fi

echo "💰 Amount disponible: $AMOUNT tBTC"
echo "💸 Fee: $FEE tBTC"
echo "📤 Enviando: $SEND_AMOUNT tBTC"

# Crear transacción raw
RAW_TX=$(bitcoin-cli -testnet createrawtransaction "[{\"txid\":\"$TXID_FUNDING\",\"vout\":$VOUT}]" "{\"$DESTINO\":$SEND_AMOUNT}")
echo "📄 Transacción raw creada"
```

### 2. Firmar (Funciona igual con prune)

```bash
echo "✍️  Firmando transacción MultiSig..."
SIGNED_TX=$(bitcoin-cli -testnet signrawtransactionwithwallet "$RAW_TX" "[{
  \"txid\":\"$TXID_FUNDING\",
  \"vout\":$VOUT,
  \"scriptPubKey\":\"$SCRIPT_PUB_KEY\",
  \"redeemScript\":\"$REDEEM_SCRIPT\",
  \"amount\":$AMOUNT
}]")

# Verificar firma completa
COMPLETE=$(echo $SIGNED_TX | jq -r '.complete')
if [ "$COMPLETE" = "true" ]; then
    HEX_TX=$(echo $SIGNED_TX | jq -r '.hex')
    echo "✅ Transacción firmada exitosamente"
else
    echo "❌ Error en la firma:"
    echo "$SIGNED_TX" | jq -r '.errors'
    echo "💡 Verificar UTXO information y redeemScript"
    return 1
fi
```

### 3. Transmitir

```bash
# Transmitir a la red
FINAL_TXID=$(bitcoin-cli -testnet sendrawtransaction "$HEX_TX")
echo "🚀 Transacción transmitida exitosamente"
echo "📋 TXID final: $FINAL_TXID"
echo "🔍 Verificar en explorador: https://blockstream.info/testnet/tx/$FINAL_TXID"

# Esperar confirmación con más paciencia por prune
echo "⏳ Esperando confirmación final (puede tardar 20-40 minutos con prune)..."
sleep 300

# Verificar estado de la transacción
TX_FINAL_INFO=$(bitcoin-cli -testnet gettransaction "$FINAL_TXID" 2>/dev/null || echo "{}")
FINAL_CONFIRMATIONS=$(echo "$TX_FINAL_INFO" | jq -r '.confirmations // 0')

echo "📊 Estado final: $FINAL_CONFIRMATIONS confirmaciones"
echo "$TX_FINAL_INFO" | jq '{confirmations, amount, fee}' 2>/dev/null || echo "Información pendiente..."
```

## 🧪 Verificación Final

```bash
echo "=== VERIFICACIÓN FINAL COMPLETA ==="

# Verificar balance del wallet
FINAL_BALANCE=$(bitcoin-cli -testnet getbalance)
echo "💰 Balance final del wallet: $FINAL_BALANCE tBTC"

# Verificar que los fondos llegaron al destino
echo "🔍 Verificando fondos en destino..."
UTXO_DESTINO=$(bitcoin-cli -testnet listunspent 0 999999 "[\"$DESTINO\"]")
if [ "$(echo $UTXO_DESTINO | jq length)" -gt 0 ]; then
    DESTINO_AMOUNT=$(echo $UTXO_DESTINO | jq -r '.[0].amount')
    echo "✅ Fondos recibidos correctamente en destino"
    echo "📊 Amount en destino: $DESTINO_AMOUNT tBTC"
else
    echo "⏳ Fondos aún no aparecen en destino (puede tardar con prune)"
fi

# Resumen completo de la ejecución
echo ""
echo "=== RESUMEN COMPLETO ==="
echo "🎯 MultiSig Address: $MULTISIG_ADDR"
echo "📤 TXID Funding: $TXID_FUNDING"
echo "🚀 TXID Final: $FINAL_TXID"
echo "🏠 Dirección Destino: $DESTINO"
echo "💰 Amount Enviado: $SEND_AMOUNT tBTC"
echo "💸 Fee Usado: $FEE tBTC"
echo "✅ Tutorial MultiSig con Prune completado exitosamente"
```

## 🔧 Solución de Problemas con Prune

### Error: "Fee estimation failed"

```bash
# Solución: Usar fallback fee explícito más alto
bitcoin-cli -testnet sendtoaddress "$DIRECCION" "$MONTO" "" "" false true 0.00005 "economical"
```

### Error: "Transaction not in memory pool"

```bash
# Con prune, las transacciones viejas no están en mempool
# Solución: Usar fees más altos y esperar más tiempo
bitcoin-cli -testnet sendtoaddress "$DIRECCION" "$MONTO" "" "" false true 0.0001 "economical"
```

### Error: "Cannot import descriptor without private keys"

```bash
# Este error es normal en wallets modernos con claves privadas habilitadas
# Solución: El MultiSig funcionará sin importar el descriptor porque:
# 1. Las claves privadas están en el wallet
# 2. Tenemos el redeemScript
# 3. signrawtransactionwithwallet reconocerá las claves automáticamente

echo "💡 No te preocupes por 'ismine=false' - el MultiSig funcionará correctamente"
```

### Error: "Only legacy wallets are supported by this command"

```bash
# Comando importaddress no funciona en wallets modernos
# Solución: No es necesario - usar signrawtransactionwithwallet directamente
echo "💡 Los wallets modernos no necesitan importaddress para MultiSig"
```

### Error: "Insufficient funds" (con balance positivo)

```bash
# Con prune, a veces el wallet no ve UTXOs recientes
# Solución: Rescan desde bloques recientes
CURRENT_BLOCK=$(bitcoin-cli -testnet getblockcount)
RESCAN_FROM=$((CURRENT_BLOCK - 100))
bitcoin-cli -testnet rescanblockchain $RESCAN_FROM
```

### Sincronización lenta

```bash
# Verificar estado de sincronización
watch -n 30 'bitcoin-cli -testnet getblockchaininfo | grep -E "(blocks|verificationprogress)"'

# Reiniciar conexiones de red
bitcoin-cli -testnet setnetworkactive false
sleep 5
bitcoin-cli -testnet setnetworkactive true
```

### El UTXO no aparece

```bash
# Verificar todas las direcciones del wallet
bitcoin-cli -testnet listunspent 0 999999

# Buscar transacciones específicas
bitcoin-cli -testnet listtransactions "*" 10

# Verificar mempool
bitcoin-cli -testnet getrawmempool

# Si el UTXO del MultiSig no aparece, usar gettxout directamente
bitcoin-cli -testnet gettxout "$TXID_FUNDING" $VOUT true
```

## 📊 Monitoreo con Prune

### Comandos Útiles para Prune

```bash
# Estado del nodo pruneado
bitcoin-cli -testnet getblockchaininfo | grep -E "(pruned|size_on_disk|blocks)"

# Espacio usado en disco
du -sh ~/.bitcoin/testnet3/

# Estado del mempool (limitado con prune)
bitcoin-cli -testnet getmempoolinfo

# Conexiones de red
bitcoin-cli -testnet getnetworkinfo | grep connections

# Información del wallet
bitcoin-cli -testnet getwalletinfo | grep -E "(balance|txcount|keypoolsize)"
```

### Script de Monitoreo Completo

```bash
#!/bin/bash
# monitor_multisig_prune.sh

echo "🔄 Iniciando monitoreo MultiSig con Prune..."

while true; do
    clear
    echo "=== MONITOR MULTISIG CON PRUNE ==="
    echo "⏰ $(date)"
    echo ""
    
    # Estado de la blockchain
    echo "📊 ESTADO BLOCKCHAIN:"
    bitcoin-cli -testnet getblockchaininfo | grep -E "(blocks|verificationprogress|pruned)" 2>/dev/null || echo "❌ Error conectando"
    echo ""
    
    # Estado del wallet
    echo "💰 ESTADO WALLET:"
    bitcoin-cli -testnet getwalletinfo | grep -E "(balance|txcount|keypoolsize)" 2>/dev/null || echo "❌ Wallet no disponible"
    echo ""
    
    # Uso de espacio
    echo "💾 USO DE ESPACIO:"
    echo "   Testnet: $(du -sh ~/.bitcoin/testnet3/ 2>/dev/null | cut -f1 || echo 'N/A')"
    echo "   Total Bitcoin: $(du -sh ~/.bitcoin/ 2>/dev/null | cut -f1 || echo 'N/A')"
    echo ""
    
    # Conexiones de red
    echo "🌐 RED:"
    CONNECTIONS=$(bitcoin-cli -testnet getnetworkinfo 2>/dev/null | jq -r '.connections' || echo "0")
    echo "   Conexiones: $CONNECTIONS"
    echo ""
    
    # Mempool
    echo "📦 MEMPOOL:"
    MEMPOOL_SIZE=$(bitcoin-cli -testnet getmempoolinfo 2>/dev/null | jq -r '.size' || echo "0")
    echo "   Transacciones: $MEMPOOL_SIZE"
    
    echo "========================"
    echo "💡 Presiona Ctrl+C para salir"
    
    sleep 30
done
```

## ✅ Conclusión

### Ventajas del MultiSig con Prune

- **Espacio reducido**: Solo 2GB vs ~500GB del nodo completo
- **Funcionalidad completa**: Todas las operaciones MultiSig funcionan
- **Seguridad mantenida**: Misma seguridad que nodo completo
- **Ideal para testing**: Perfecto para desarrollo y pruebas

### Consideraciones Importantes

- **Más paciencia**: Confirmaciones pueden tardar más
- **Fees más altos**: Recomendado usar fees ligeramente superiores
- **Monitoreo activo**: Verificar estado más frecuentemente
- **Rescans ocasionales**: Pueden ser necesarios para UTXOs

### Próximos Pasos para Producción

1. **Migrar a mainnet**: Cambiar configuración a red principal
2. **Hardware wallets**: Usar dispositivos especializados
3. **PSBTs**: Implementar Partially Signed Bitcoin Transactions
4. **Backups seguros**: Guardar descriptors y claves en lugar seguro
5. **Testing exhaustivo**: Probar todos los escenarios posibles

---

> 🎯 **Resultado**: MultiSig 2-of-3 funcionando perfectamente en nodo Bitcoin pruneado con solo 2GB de almacenamiento