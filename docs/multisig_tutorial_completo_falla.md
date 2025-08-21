# Tutorial MultiSig Bitcoin que FUNCIONA (Bitcoin Core Moderno)

## Qué es MultiSig

**MultiSig (Multi-Signature)** es un tipo de script Bitcoin que requiere **múltiples firmas** de diferentes claves privadas para gastar fondos.

### Tipos Comunes:
- **2-of-3**: 2 firmas de 3 posibles (más común y práctico)
- **3-of-5**: 3 firmas de 5 posibles (organizaciones)

---

## Implementación que FUNCIONA con Bitcoin Core Moderno

### FASE 0: Preparación

```bash
# Verificar Bitcoin Core funcionando
bitcoin-cli -testnet getblockchaininfo | head -5

# Verificar/cargar wallet
bitcoin-cli -testnet listwallets
bitcoin-cli -testnet loadwallet "multisig_tutorial"  # Si existe
# O crear nuevo: bitcoin-cli -testnet createwallet "multisig_tutorial"

# Verificar fondos (necesitas mínimo 0.002 tBTC)
bitcoin-cli -testnet getbalance
```

---

### FASE 1: Crear MultiSig Manual

#### 1. Generar 3 direcciones y exportar claves privadas:

```bash
# Crear direcciones
bitcoin-cli -testnet getnewaddress "alice" "bech32"
bitcoin-cli -testnet getnewaddress "bob" "bech32"
bitcoin-cli -testnet getnewaddress "charlie" "bech32"
```

#### 2. Obtener claves públicas:

```bash
# Reemplazar con tus direcciones reales
bitcoin-cli -testnet getaddressinfo "DIRECCION_ALICE"
bitcoin-cli -testnet getaddressinfo "DIRECCION_BOB"
bitcoin-cli -testnet getaddressinfo "DIRECCION_CHARLIE"
```

**Guardar de cada resultado:**
- `"pubkey"`: La clave pública
- Verificar `"hdkeypath"`: Derivación BIP32

#### 3. Exportar claves privadas (SOLO para tutorial):

```bash
# ⚠️ SOLO PARA TESTNET - NUNCA en mainnet
bitcoin-cli -testnet dumpprivkey "DIRECCION_ALICE"
bitcoin-cli -testnet dumpprivkey "DIRECCION_BOB" 
bitcoin-cli -testnet dumpprivkey "DIRECCION_CHARLIE"
```

**Guardar las 3 claves privadas - las necesitaremos para firmar.**

#### 4. Crear multisig SegWit:

```bash
# Usar tus claves públicas reales
bitcoin-cli -testnet createmultisig 2 '["PUBKEY_ALICE","PUBKEY_BOB","PUBKEY_CHARLIE"]' "bech32"
```

**Guardar del resultado:**
- `"address"`: Tu dirección multisig (empieza con tb1q...)
- `"redeemScript"`: Necesario para gastar

---

### FASE 2: Enviar fondos al MultiSig

```bash
# Estimar fees
bitcoin-cli -testnet estimatesmartfee 6

# Enviar fondos
bitcoin-cli -testnet sendtoaddress "DIRECCION_MULTISIG" 0.001

# Obtener TXID de la transacción
bitcoin-cli -testnet listtransactions "*" 5
```

**Guardar:**
- **TXID_FUNDING**: El txid de la transacción
- **VOUT_NUMBER**: El vout del multisig (normalmente 0 o 1)

#### Obtener scriptPubKey:

```bash
# Obtener hex de la transacción
bitcoin-cli -testnet gettransaction "TXID_FUNDING"

# Decodificar para obtener scriptPubKey
bitcoin-cli -testnet decoderawtransaction "HEX_DE_LA_TRANSACCION"
```

**Buscar en "vout" y guardar:**
- **SCRIPT_PUB_KEY**: El "hex" del scriptPubKey del multisig

---

### FASE 3: Gastar desde MultiSig (Método que FUNCIONA)

#### 1. Crear transacción de gasto:

```bash
# Crear dirección destino
bitcoin-cli -testnet getnewaddress "recuperado" "bech32"

# Crear transacción raw
bitcoin-cli -testnet createrawtransaction \
'[{"txid":"TXID_FUNDING","vout":VOUT_NUMBER}]' \
'{"DIRECCION_DESTINO":0.0009}'
```

#### 2. Firmar con claves privadas manuales:

**Este es el método que FUNCIONA en Bitcoin Core moderno:**

```bash
# Firmar con 2 de las 3 claves privadas
bitcoin-cli -testnet signrawtransactionwithkey "RAW_TRANSACTION" \
'["CLAVE_PRIVADA_ALICE","CLAVE_PRIVADA_BOB"]' \
'[{
  "txid":"TXID_FUNDING",
  "vout":VOUT_NUMBER,
  "scriptPubKey":"SCRIPT_PUB_KEY",
  "redeemScript":"REDEEM_SCRIPT",
  "amount":0.001
}]'
```

**Resultado esperado:**
```json
{
  "hex": "02000000...completamente_firmada",
  "complete": true
}
```

#### 3. Broadcast:

```bash
bitcoin-cli -testnet sendrawtransaction "HEX_FIRMADA"
```

---

## Ejemplo Completo con Datos Reales

### Paso a paso con comandos reales:

#### 1. Crear direcciones:
```bash
alice=$(bitcoin-cli -testnet getnewaddress "alice" "bech32")
bob=$(bitcoin-cli -testnet getnewaddress "bob" "bech32")
charlie=$(bitcoin-cli -testnet getnewaddress "charlie" "bech32")
echo "Alice: $alice"
echo "Bob: $bob"
echo "Charlie: $charlie"
```

#### 2. Obtener claves públicas:
```bash
pubkey_alice=$(bitcoin-cli -testnet getaddressinfo "$alice" | jq -r '.pubkey')
pubkey_bob=$(bitcoin-cli -testnet getaddressinfo "$bob" | jq -r '.pubkey')
pubkey_charlie=$(bitcoin-cli -testnet getaddressinfo "$charlie" | jq -r '.pubkey')
echo "Alice pubkey: $pubkey_alice"
echo "Bob pubkey: $pubkey_bob"
echo "Charlie pubkey: $pubkey_charlie"
```

#### 3. Exportar claves privadas:
```bash
privkey_alice=$(bitcoin-cli -testnet dumpprivkey "$alice")
privkey_bob=$(bitcoin-cli -testnet dumpprivkey "$bob")
privkey_charlie=$(bitcoin-cli -testnet dumpprivkey "$charlie")
```

#### 4. Crear multisig:
```bash
multisig=$(bitcoin-cli -testnet createmultisig 2 "[\"$pubkey_alice\",\"$pubkey_bob\",\"$pubkey_charlie\"]" "bech32")
address=$(echo $multisig | jq -r '.address')
redeemScript=$(echo $multisig | jq -r '.redeemScript')
echo "Multisig address: $address"
echo "RedeemScript: $redeemScript"
```

#### 5. Enviar fondos:
```bash
txid=$(bitcoin-cli -testnet sendtoaddress "$address" 0.001)
echo "TXID: $txid"
```

#### 6. Esperar confirmación y obtener scriptPubKey:
```bash
# Esperar 1 confirmación
bitcoin-cli -testnet getrawtransaction "$txid" true | jq '.vout[] | select(.scriptPubKey.address == "'$address'")'
```

#### 7. Crear y firmar transacción de gasto:
```bash
# Crear dirección destino
destino=$(bitcoin-cli -testnet getnewaddress "recuperado" "bech32")

# Crear transacción raw (asumiendo vout=0)
raw=$(bitcoin-cli -testnet createrawtransaction "[{\"txid\":\"$txid\",\"vout\":0}]" "{\"$destino\":0.0009}")

# Obtener scriptPubKey (reemplazar con el valor real obtenido en paso 6)
scriptPubKey="SCRIPT_PUB_KEY_AQUI"

# Firmar con 2 claves
signed=$(bitcoin-cli -testnet signrawtransactionwithkey "$raw" "[\"$privkey_alice\",\"$privkey_bob\"]" "[{\"txid\":\"$txid\",\"vout\":0,\"scriptPubKey\":\"$scriptPubKey\",\"redeemScript\":\"$redeemScript\",\"amount\":0.001}]")

# Broadcast
final_txid=$(echo $signed | jq -r '.hex' | xargs bitcoin-cli -testnet sendrawtransaction)
echo "Final TXID: $final_txid"
```

---

## Por qué este método FUNCIONA

1. **Usa claves privadas directamente**: No depende de que el wallet "reconozca" el multisig
2. **signrawtransactionwithkey**: Funciona con cualquier clave privada válida
3. **No requiere importar descriptors**: Evita limitaciones de wallets modernos
4. **Compatible con SegWit**: Usa direcciones bech32 eficientes

## Limitaciones y Consideraciones

### Seguridad:
- **Solo para testnet**: Nunca exportes claves privadas en mainnet
- **En producción**: Usar PSBTs y hardware wallets
- **Claves expuestas**: Las claves privadas quedan en historial de comandos

### Para uso real:
- Cada participante mantiene sus claves en dispositivos separados
- Usar format PSBT para coordinar firmas
- Software especializado: Electrum, Sparrow, Specter

---

## Verificación del Éxito

```bash
# Verificar transacción final
bitcoin-cli -testnet gettransaction "FINAL_TXID"

# Verificar saldo actualizado
bitcoin-cli -testnet getbalance

# Ver en explorador
echo "Ver en: https://blockstream.info/testnet/tx/FINAL_TXID"
```

---

## Diferencias con Tutoriales que Fallan

### Lo que NO funciona en Bitcoin Core moderno:
- `addmultisigaddress` (solo wallets legacy)
- `importmulti` (solo wallets legacy)  
- `importdescriptors` con claves privadas habilitadas
- `signrawtransactionwithwallet` con multisig externo

### Lo que SÍ funciona:
- `createmultisig` para generar dirección
- `signrawtransactionwithkey` con claves privadas manuales
- Direcciones SegWit nativas (bech32)
- PSBTs para coordinación real

Este tutorial funciona porque usa métodos compatibles con la arquitectura moderna de Bitcoin Core mientras mantiene las ventajas de SegWit.