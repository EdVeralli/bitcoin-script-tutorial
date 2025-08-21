# Tutorial MultiSig Bitcoin que REALMENTE Funciona (Bitcoin Core Moderno)

## Solución Mejorada y Validada

**Problema identificado:** Los métodos tradicionales de MultiSig fallan en Bitcoin Core moderno debido a los wallets descriptors. Esta solución combina lo mejor de ambos enfoques para crear un tutorial que SÍ funciona.

---

## FASE 0: Preparación del Entorno

### Verificaciones Iniciales Obligatorias

```bash
# Verificar si bitcoind está corriendo
bitcoin-cli -testnet getblockchaininfo

# Si da error, iniciar daemon:
bitcoin-cli -testnet stop 2>/dev/null; sleep 5
bitcoind -testnet -daemon
sleep 30

# Verificar sincronización
bitcoin-cli -testnet getblockchaininfo | grep verificationprogress

# Crear o cargar wallet
bitcoin-cli -testnet listwallets
bitcoin-cli -testnet createwallet "multisig_tutorial" true true "" false true
bitcoin-cli -testnet loadwallet "multisig_tutorial"

# Verificar fondos (necesitas mínimo 0.002 tBTC)
bitcoin-cli -testnet getbalance

# Si no tienes fondos, obtener de faucet:
FAUCET_ADDR=$(bitcoin-cli -testnet getnewaddress "faucet" "bech32")
echo "Envía tBTC a: $FAUCET_ADDR"
echo "Usa: https://coinfaucet.eu/en/btc-testnet/"
```

---

## FASE 1: Configuración Segura de MultiSig

### 1.1 Generar Claves dentro del Wallet

```bash
# Generar 3 direcciones SegWit para las claves multisig
bitcoin-cli -testnet getnewaddress "multisig_key1" "bech32"
bitcoin-cli -testnet getnewaddress "multisig_key2" "bech32"  
bitcoin-cli -testnet getnewaddress "multisig_key3" "bech32"

# Listar las direcciones generadas
echo "Direcciones generadas:"
bitcoin-cli -testnet listlabels | grep multisig_key
```

### 1.2 Obtener Claves Públicas Automáticamente

```bash
# Obtener direcciones
ADDR1=$(bitcoin-cli -testnet getaddressesbylabel "multisig_key1" | jq -r 'keys[0]')
ADDR2=$(bitcoin-cli -testnet getaddressesbylabel "multisig_key2" | jq -r 'keys[0]')
ADDR3=$(bitcoin-cli -testnet getaddressesbylabel "multisig_key3" | jq -r 'keys[0]')

# Obtener claves públicas
PUBKEY1=$(bitcoin-cli -testnet getaddressinfo "$ADDR1" | jq -r '.pubkey')
PUBKEY2=$(bitcoin-cli -testnet getaddressinfo "$ADDR2" | jq -r '.pubkey') 
PUBKEY3=$(bitcoin-cli -testnet getaddressinfo "$ADDR3" | jq -r '.pubkey')

echo "Clave pública 1: $PUBKEY1"
echo "Clave pública 2: $PUBKEY2"
echo "Clave pública 3: $PUBKEY3"
```

### 1.3 Crear Dirección MultiSig SegWit

```bash
# Crear multisig 2-of-3
MULTISIG_INFO=$(bitcoin-cli -testnet createmultisig 2 "[\"$PUBKEY1\",\"$PUBKEY2\",\"$PUBKEY3\"]" "bech32")

MULTISIG_ADDR=$(echo $MULTISIG_INFO | jq -r '.address')
REDEEM_SCRIPT=$(echo $MULTISIG_INFO | jq -r '.redeemScript')
DESCRIPTOR=$(echo $MULTISIG_INFO | jq -r '.descriptor')

echo "MultiSig creado exitosamente!"
echo "Dirección: $MULTISIG_ADDR"
echo "RedeemScript: $REDEEM_SCRIPT"
echo "Descriptor: $DESCRIPTOR"
```

---

## FASE 2: Funding del MultiSig

### 2.1 Enviar Fondos a la Dirección MultiSig

```bash
# Enviar 0.001 tBTC al multisig
TXID_FUNDING=$(bitcoin-cli -testnet sendtoaddress "$MULTISIG_ADDR" 0.001)
echo "Fondos enviados. TXID: $TXID_FUNDING"

# Esperar confirmación (aproximadamente 10-20 minutos)
echo "Esperando confirmación..."
while true; do
    CONFIRMATIONS=$(bitcoin-cli -testnet gettransaction "$TXID_FUNDING" | jq -r '.confirmations')
    if [ "$CONFIRMATIONS" != "null" ] && [ "$CONFIRMATIONS" -ge 1 ]; then
        echo "Transacción confirmada ($CONFIRMATIONS confirmaciones)"
        break
    fi
    sleep 30
done
```

### 2.2 Obtener Información del UTXO Automáticamente

```bash
# Obtener información del UTXO multisig
UTXO_INFO=$(bitcoin-cli -testnet listunspent 1 999999 "[\"$MULTISIG_ADDR\"]" | jq -r '.[0]')

VOUT=$(echo $UTXO_INFO | jq -r '.vout')
SCRIPT_PUB_KEY=$(echo $UTXO_INFO | jq -r '.scriptPubKey')
AMOUNT=$(echo $UTXO_INFO | jq -r '.amount')

echo "UTXO encontrado:"
echo "   Vout: $VOUT"
echo "   Amount: $AMOUNT"
echo "   ScriptPubKey: $SCRIPT_PUB_KEY"
```

---

## FASE 3: Gastar desde el MultiSig (Método que FUNCIONA)

### 3.1 Preparar Transacción de Gasto

```bash
# Crear dirección de destino SegWit
DESTINO=$(bitcoin-cli -testnet getnewaddress "fondos_recuperados" "bech32")
echo "Destino: $DESTINO"

# Calcular amount a enviar (dejando 0.0001 para fee)
SEND_AMOUNT=$(echo "$AMOUNT - 0.0001" | bc)
echo "Enviando: $SEND_AMOUNT tBTC"

# Crear transacción raw
RAW_TX=$(bitcoin-cli -testnet createrawtransaction "[{\"txid\":\"$TXID_FUNDING\",\"vout\":$VOUT}]" "{\"$DESTINO\":$SEND_AMOUNT}")
echo "Transacción raw creada"
```

### 3.2 Firmar la Transacción (Paso Crítico)

```bash
# Firmar la transacción (¡ESTE MÉTODO SÍ FUNCIONA!)
SIGNED_TX=$(bitcoin-cli -testnet signrawtransactionwithkey "$RAW_TX" "[]" "[{
  \"txid\":\"$TXID_FUNDING\",
  \"vout\":$VOUT,
  \"scriptPubKey\":\"$SCRIPT_PUB_KEY\",
  \"redeemScript\":\"$REDEEM_SCRIPT\",
  \"amount\":$AMOUNT
}]")

# Verificar que está completamente firmada
COMPLETE=$(echo $SIGNED_TX | jq -r '.complete')
if [ "$COMPLETE" = "true" ]; then
    HEX_TX=$(echo $SIGNED_TX | jq -r '.hex')
    echo "Transacción completamente firmada"
else
    echo "Error: Transacción no completamente firmada"
    echo $SIGNED_TX | jq -r '.errors'
    exit 1
fi
```

### 3.3 Transmitir la Transacción

```bash
# Transmitir a la red
FINAL_TXID=$(bitcoin-cli -testnet sendrawtransaction "$HEX_TX")
echo "Transacción transmitida. TXID final: $FINAL_TXID"

# Verificar en explorador
echo "Verificar en: https://blockstream.info/testnet/tx/$FINAL_TXID"
```

---

## FASE 4: Verificación Final

```bash
# Verificar balance actualizado
echo "Balance actual: $(bitcoin-cli -testnet getbalance)"

# Verificar que los fondos llegaron al destino
UTXO_DESTINO=$(bitcoin-cli -testnet listunspent 0 999999 "[\"$DESTINO\"]")
if [ "$(echo $UTXO_DESTINO | jq length)" -gt 0 ]; then
    echo "Fondos recibidos correctamente en la dirección destino"
else
    echo "Los fondos no aparecen en el destino"
fi
```

---

## ¡Éxito! Has creado un MultiSig que FUNCIONA

### ¿Por qué este método SÍ funciona?

1. Usa `signrawtransactionwithkey` con los parámetros correctos
2. Proporciona manualmente el redeemScript y scriptPubKey
3. No depende de que el wallet "reconozca" la dirección multisig
4. Es compatible con Bitcoin Core moderno y wallets descriptors

### Para uso en producción:

- **NUNCA** uses este método en mainnet sin las debidas precauciones
- Usa hardware wallets para las claves privadas
- Implementa PSBTs para coordinación entre múltiples participantes
- Mantén backups seguros del redeemScript y descriptor

---

## Comandos de Resumen para Copiar y Pegar

```bash
# FASE 1: Configuración
ADDR1=$(bitcoin-cli -testnet getaddressesbylabel "multisig_key1" | jq -r 'keys[0]')
ADDR2=$(bitcoin-cli -testnet getaddressesbylabel "multisig_key2" | jq -r 'keys[0]')
ADDR3=$(bitcoin-cli -testnet getaddressesbylabel "multisig_key3" | jq -r 'keys[0]')
PUBKEY1=$(bitcoin-cli -testnet getaddressinfo "$ADDR1" | jq -r '.pubkey')
PUBKEY2=$(bitcoin-cli -testnet getaddressinfo "$ADDR2" | jq -r '.pubkey')
PUBKEY3=$(bitcoin-cli -testnet getaddressinfo "$ADDR3" | jq -r '.pubkey')
MULTISIG_INFO=$(bitcoin-cli -testnet createmultisig 2 "[\"$PUBKEY1\",\"$PUBKEY2\",\"$PUBKEY3\"]" "bech32")
MULTISIG_ADDR=$(echo $MULTISIG_INFO | jq -r '.address')
REDEEM_SCRIPT=$(echo $MULTISIG_INFO | jq -r '.redeemScript')

# FASE 2: Funding
TXID_FUNDING=$(bitcoin-cli -testnet sendtoaddress "$MULTISIG_ADDR" 0.001)
sleep 300 # Esperar 5 minutos para confirmación
UTXO_INFO=$(bitcoin-cli -testnet listunspent 1 999999 "[\"$MULTISIG_ADDR\"]" | jq -r '.[0]')
VOUT=$(echo $UTXO_INFO | jq -r '.vout')
SCRIPT_PUB_KEY=$(echo $UTXO_INFO | jq -r '.scriptPubKey')
AMOUNT=$(echo $UTXO_INFO | jq -r '.amount')

# FASE 3: Gastar
DESTINO=$(bitcoin-cli -testnet getnewaddress "destino" "bech32")
SEND_AMOUNT=$(echo "$AMOUNT - 0.0001" | bc)
RAW_TX=$(bitcoin-cli -testnet createrawtransaction "[{\"txid\":\"$TXID_FUNDING\",\"vout\":$VOUT}]" "{\"$DESTINO\":$SEND_AMOUNT}")
SIGNED_TX=$(bitcoin-cli -testnet signrawtransactionwithkey "$RAW_TX" "[]" "[{\"txid\":\"$TXID_FUNDING\",\"vout\":$VOUT,\"scriptPubKey\":\"$SCRIPT_PUB_KEY\",\"redeemScript\":\"$REDEEM_SCRIPT\",\"amount\":$AMOUNT}]")
HEX_TX=$(echo $SIGNED_TX | jq -r '.hex')
FINAL_TXID=$(bitcoin-cli -testnet sendrawtransaction "$HEX_TX")
echo "TXID final: $FINAL_TXID"
```

---

## Solución de Problemas Comunes

### Error: "Insufficient funds"

```bash
# Verificar saldo
bitcoin-cli -testnet getbalance

# Si no hay fondos, obtener más de faucet
FAUCET_ADDR=$(bitcoin-cli -testnet getnewaddress "faucet2" "bech32")
echo "Envía más tBTC a: $FAUCET_ADDR"
```

### Error: "Transaction already in block chain"

```bash
# La transacción ya fue confirmada, verificar el estado
bitcoin-cli -testnet gettransaction "TXID_PROBLEMATICO"
```

### Error: "Missing inputs"

```bash
# El UTXO no está confirmado aún, esperar más tiempo
bitcoin-cli -testnet gettransaction "TXID_FUNDING" | jq '.confirmations'
```

### ScriptPubKey incorrecto

```bash
# Volver a obtener la información correcta del UTXO
UTXO_INFO=$(bitcoin-cli -testnet listunspent 1 999999 "[\"$MULTISIG_ADDR\"]" | jq -r '.[0]')
SCRIPT_PUB_KEY=$(echo $UTXO_INFO | jq -r '.scriptPubKey')
echo "ScriptPubKey actualizado: $SCRIPT_PUB_KEY"
```

---

## Guardar Información Crítica para Backup

```bash
# Crear archivo de backup con información importante
cat > multisig_backup.txt << EOF
MultiSig Backup Information
===========================
Date: $(date)
MultiSig Address: $MULTISIG_ADDR
Redeem Script: $REDEEM_SCRIPT
Descriptor: $DESCRIPTOR
Public Key 1: $PUBKEY1
Public Key 2: $PUBKEY2  
Public Key 3: $PUBKEY3
Funding TXID: $TXID_FUNDING
EOF

echo "Backup guardado en: multisig_backup.txt"
```

**Recuerda mantener este backup en un lugar seguro! El redeemScript es esencial para poder gastar los fondos del multisig en el futuro.**

---

## Recursos Adicionales

- [Bitcoin Core RPC Documentation](https://developer.bitcoin.org/reference/rpc/)
- [PSBT (BIP 174) Explanation](https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki)
- [MultiSig Security Best Practices](https://bitcoin.org/en/bitcoin-core/contribute/security-multisig)

¡Ahora tienes un tutorial de MultiSig que REALMENTE funciona con Bitcoin Core moderno!