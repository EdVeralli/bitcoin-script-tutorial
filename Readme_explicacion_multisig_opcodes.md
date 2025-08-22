# Proceso Detallado del MultiSig Bitcoin - Paso a Paso (Con Análisis de Opcodes)

Este documento explica en detalle técnico cómo funciona cada etapa del proceso MultiSig, desde la creación hasta el gasto, mostrando exactamente qué sucede en la red Bitcoin, incluyendo análisis profundo de opcodes.

## Paso 1: Generación de Claves (Offline)

### Qué sucede técnicamente:
```javascript
// Para cada participante (3 en total):
const keyPair = bitcoin.ECPair.makeRandom({ network: testnet });
```

### Proceso interno:
1. **Generación de entropía**: Se genera un número aleatorio de 256 bits
2. **Clave privada**: Este número se convierte en la clave privada
3. **Clave pública**: Se calcula usando multiplicación de curva elíptica
   ```
   publicKey = privateKey * G (punto generador secp256k1)
   ```

### Resultado:
```
Participante 1:
- Private: cNHQVXQx6Lz4PL8mUVfspKWnU1x9jimXQ6ZwuQUgcxv2XnGXkX78
- Public:  02c7defb97aa6ed2a9b044b062a3f14b75d725773bfbec8339463100515bc05360

Participante 2:
- Private: cNhmqC3UoiCBffZjr9rktoXjRDqKtwGRix1btfjk87BgejXnsZ8K  
- Public:  033823984c002d0e02a26d56a7a228330141468cecc61c6618dbcb98bd52c43ad5

Participante 3:
- Private: cVkw3ieoRoVuZMuL2Kcn93uWC2mQPTKKsCq5mBTc3BgUta5dJmVX
- Public:  0324216b030f68ce3aa1e33e039984d39339f968f436e6b1c1b0fb18d480f2b6ad
```

**🌐 ESTADO EN LA RED**: 
- ❌ **Nada se sube a la red** - Este proceso es completamente offline
- ⚡ **Ubicación**: Solo en dispositivos locales de cada participante
- 🔒 **Privacidad**: Las claves permanecen completamente privadas

## Paso 2: Creación del Script MultiSig (Offline) - ANÁLISIS DE OPCODES

### Construcción del WitnessScript:
```javascript
const witnessScript = bitcoin.script.compile([
    bitcoin.opcodes.OP_2,        // 0x52
    publicKey1,                  // 33 bytes
    publicKey2,                  // 33 bytes  
    publicKey3,                  // 33 bytes
    bitcoin.opcodes.OP_3,        // 0x53
    bitcoin.opcodes.OP_CHECKMULTISIG  // 0xae
]);
```

### Script en hexadecimal:
```
522102c7defb97aa6ed2a9b044b062a3f14b75d725773bfbec8339463100515bc0536021033823984c002d0e02a26d56a7a228330141468cecc61c6618dbcb98bd52c43ad5210324216b030f68ce3aa1e33e039984d39339f968f436e6b1c1b0fb18d480f2b6ad53ae
```

### 🔍 ANÁLISIS DETALLADO DE OPCODES - Desglose byte por byte:

| Bytes | Opcode | Descripción | Valor/Datos |
|-------|--------|-------------|-------------|
| `52` | `OP_2` | Push el número 2 al stack | Requiere 2 firmas |
| `21` | `OP_PUSHDATA(33)` | Push siguientes 33 bytes | Tamaño de clave pública |
| `02c7defb...05360` | **DATOS** | Clave pública 1 (comprimida) | 33 bytes |
| `21` | `OP_PUSHDATA(33)` | Push siguientes 33 bytes | Tamaño de clave pública |
| `033823984...43ad5` | **DATOS** | Clave pública 2 (comprimida) | 33 bytes |
| `21` | `OP_PUSHDATA(33)` | Push siguientes 33 bytes | Tamaño de clave pública |
| `0324216b0...b6ad` | **DATOS** | Clave pública 3 (comprimida) | 33 bytes |
| `53` | `OP_3` | Push el número 3 al stack | Total de 3 claves |
| `ae` | `OP_CHECKMULTISIG` | Verificar firmas múltiples | Opcode de validación |

### Estado del stack durante construcción:
```
Inicio: []
OP_2: [2]
OP_PUSHDATA+Key1: [2, key1]
OP_PUSHDATA+Key2: [2, key1, key2]  
OP_PUSHDATA+Key3: [2, key1, key2, key3]
OP_3: [2, key1, key2, key3, 3]
OP_CHECKMULTISIG: [resultado_booleano]
```

### Generación de la dirección:
```javascript
const scriptHash = bitcoin.crypto.sha256(witnessScript);
const address = bitcoin.address.toBech32(scriptHash, 0, network.bech32);
```

### Proceso de hash:
```
witnessScript = 522102c7defb9...53ae
SHA256(witnessScript) = 9333fd9fa2c504a400de7a53f760a43709a31b6d34b0986a343991c726d97ac1
Dirección P2WSH = tb1qjvelm8azc5z2gqx70fflwc9yxuy6xxmdxjcfs6358xguwfke0tqs7my58r
```

**🌐 ESTADO EN LA RED**: 
- ❌ **Nada se sube a la red** - Solo se calcula la dirección localmente
- ⚡ **Ubicación**: Cálculo de hash offline en cada dispositivo
- 🔒 **Privacidad**: El script MultiSig permanece completamente oculto
- 🎯 **Resultado**: Solo se genera la dirección Bech32 para recibir fondos

## Paso 3: Envío de Fondos al MultiSig (On-chain) - ANÁLISIS DE OPCODES

### Transacción de funding:
```json
{
  "txid": "607a5c1b0ac6c27cfd37387d6c0619fe8bab8ccaa52f6b635fa57b79fd21e79f",
  "inputs": [{
    "previous_output": "460f3b27...:0",
    "value": 156417,
    "scriptSig": "...",
    "sequence": 4294967293
  }],
  "outputs": [{
    "value": 50000,
    "scriptPubKey": {
      "asm": "0 9333fd9fa2c504a400de7a53f760a43709a31b6d34b0986a343991c726d97ac1",
      "hex": "00209333fd9fa2c504a400de7a53f760a43709a31b6d34b0986a343991c726d97ac1",
      "address": "tb1qjvelm8azc5z2gqx70fflwc9yxuy6xxmdxjcfs6358xguwfke0tqs7my58r",
      "type": "witness_v0_scripthash"
    }
  }, {
    "value": 83642,
    "scriptPubKey": {
      "address": "tb1q2h0846ceu5tzjp4q4gdk35t5cuj47dga3w2s7s",
      "type": "witness_v0_keyhash"
    }
  }]
}
```

### 🔍 ANÁLISIS DETALLADO DE OPCODES EN SCRIPTPUBKEY:

#### Output 0 (MultiSig):
```
ScriptPubKey hex: 00209333fd9fa2c504a400de7a53f760a43709a31b6d34b0986a343991c726d97ac1
```

**Desglose byte por byte:**

| Bytes | Opcode | Descripción | Significado |
|-------|--------|-------------|-------------|
| `00` | `OP_0` | Push bytes vacío | Witness versión 0 |
| `20` | `OP_PUSHDATA(32)` | Push siguientes 32 bytes | Tamaño del hash |
| `9333fd9f...97ac1` | **DATOS** | SHA256 del witnessScript | Hash de identificación |

**Traducción a ASM (Assembly Script):**
```
asm: "0 9333fd9fa2c504a400de7a53f760a43709a31b6d34b0986a343991c726d97ac1"
```

**Interpretación por la VM de Bitcoin:**
```python
def validate_p2wsh_output(scriptPubKey):
    if scriptPubKey[0] == 0x00:  # OP_0
        if scriptPubKey[1] == 0x20:  # 32 bytes
            witness_program = scriptPubKey[2:34]  # Los 32 bytes del hash
            return {
                'type': 'P2WSH',
                'witness_version': 0,
                'script_hash': witness_program,
                'spending_rule': 'witness_must_contain_script_that_hashes_to_this'
            }
```

#### Output 1 (Cambio regular):
```
ScriptPubKey hex: 001455de7aeb19e5162906a0aa1b68d174c7255f351d
```

**Decodificación:**
```
00 = OP_0 (versión de witness 0)
14 = OP_PUSHDATA (push 20 bytes)
55de7aeb19e5162906a0aa1b68d174c7255f351d = Hash de la clave pública (20 bytes)
```

**Interpretación:**
```python
if scriptPubKey.startswith("00 14"):
    witness_version = 0
    witness_program = "55de7aeb19e5162906a0aa1b68d174c7255f351d"
    script_type = "witness_v0_keyhash"  # P2WPKH
    
    # Regla de consenso:
    # "Para gastar este output, el witness debe contener una firma
    #  y clave pública cuyo HASH160 sea igual a este witness_program"
```

### 🔍 DETECCIÓN DE PATRONES POR OPCODES:

```python
def identify_script_type(scriptPubKey_hex):
    if scriptPubKey_hex.startswith("00"):  # OP_0
        if len(scriptPubKey_hex) == 44:     # 22 bytes total
            return "P2WPKH"  # 00 + 14 + 20_bytes_pubkey_hash
        elif len(scriptPubKey_hex) == 68:   # 34 bytes total  
            return "P2WSH"   # 00 + 20 + 32_bytes_script_hash
    elif scriptPubKey_hex.startswith("a914"):  # OP_HASH160 + PUSHDATA(20)
        return "P2SH"
    elif scriptPubKey_hex.startswith("76a914"):  # OP_DUP + OP_HASH160 + PUSHDATA(20)
        return "P2PKH"
```

### Lo que almacena la red en el UTXO set:

```python
# Para el output MultiSig:
utxo_set["607a5c1b...79f:0"] = {
    'value': 50000,
    'scriptPubKey': "00209333fd9fa2c504a400de7a53f760a43709a31b6d34b0986a343991c726d97ac1",
    'opcodes': [OP_0, OP_PUSHDATA_32],
    'witness_version': 0,
    'witness_program': "9333fd9fa2c504a400de7a53f760a43709a31b6d34b0986a343991c726d97ac1",
    'type': 'P2WSH',
    'spending_requirements': {
        'witness_must_contain': 'script_that_hashes_to_witness_program',
        'script_execution': 'must_evaluate_to_true'
    }
}
```

### Interpretación: Nada revelado aún

El script que se almacena en la blockchain es minimalista:
- `OP_0`: "Esto es witness versión 0"
- `OP_PUSHDATA_32`: "Los próximos 32 bytes son datos"
- `32 bytes de hash`: El fingerprint del script real

**Lo que NO está en la blockchain aún:**
- El script MultiSig completo
- Las claves públicas
- El requisito 2-of-3
- Los opcodes OP_2, OP_3, OP_CHECKMULTISIG

**Reglas de consenso activas:**
La red aplica esta regla para el UTXO:
```
Para gastar 607a5c1b...79f:0:
1. El witness DEBE contener un script
2. SHA256(script) DEBE ser igual a 9333fd9fa2c504a400de7a53f760a43709a31b6d34b0986a343991c726d97ac1
3. El script DEBE ejecutarse exitosamente y devolver TRUE
```

### Interpretación:
- **Input**: Gastamos un UTXO de 156,417 satoshis
- **Output 0**: 50,000 satoshis van al hash del MultiSig (P2WSH)
- **Output 1**: 83,642 satoshis regresan como cambio (P2WPKH)
- **Fee**: 156,417 - 50,000 - 83,642 = 22,775 satoshis

### Lo que ve la red:
```
"Se creó un UTXO P2WSH con valor 50,000 sats.
Para gastarlo, alguien debe presentar un script que haga hash a:
9333fd9fa2c504a400de7a53f760a43709a31b6d34b0986a343991c726d97ac1
y ese script debe ejecutarse exitosamente."
```

La red NO sabe:
- Qué tipo de script es (podría ser MultiSig, timelock, hash preimage, etc.)
- Cuántas firmas requiere
- Qué claves están involucradas
- Cualquier detalle de la lógica interna

**🌐 ESTADO EN LA RED**: 
- ✅ **SE SUBE A LA RED** - Primera interacción con la blockchain
- ⚡ **Qué se almacena**: 
  - UTXO con valor 50,000 sats en dirección P2WSH
  - Script minimalista: `OP_0 OP_PUSHDATA_32 <hash>`
  - Hash del script (32 bytes): `9333fd9f...97ac1`
- 🔒 **Privacidad**: Script MultiSig AÚN OCULTO
- 📊 **Red ve**: "Hay fondos bloqueados que requieren un script válido"
- 🚫 **Red NO ve**: Tipo de script, número de firmas, claves públicas
- 💾 **Almacenado en**: UTXO set de todos los nodos

## Paso 4: Construcción de la Transacción de Gasto (Offline)

### PSBT (Partially Signed Bitcoin Transaction):
```javascript
const psbt = new bitcoin.Psbt({ network });

psbt.addInput({
    hash: "607a5c1b0ac6c27cfd37387d6c0619fe8bab8ccaa52f6b635fa57b79fd21e79f",
    index: 0,
    witnessUtxo: {
        script: Buffer.from("00209333fd9fa2c504a400de7a53f760a43709a31b6d34b0986a343991c726d97ac1", "hex"),
        value: 50000
    },
    witnessScript: witnessScript
});

psbt.addOutput({
    address: "tb1qdgz30uqwscfcr3nyxngflugu5ymv92mqgyugus",
    value: 35000
});
```

### Proceso de firma:
```javascript
// Firma con la primera clave
psbt.signInput(0, keyPair1);
// Resultado: firma1 = 3045022100a4671cab2f9c76be3348a4372da1127b7cd1c779058dd7e72963ffda5b771f70022015b3d0f59e48b34b38cd70c949ecf0cc713c901d59a80425d4eed10ad49712a5

// Firma con la segunda clave  
psbt.signInput(0, keyPair2);
// Resultado: firma2 = 3045022100b65c7cb6c559cddb0e65872a4da56499d5eddff1229b157d3d418cd6f110e7e002207d79fd0bc43b3a4f60b37d344a3d257e5a5df952b61a5f57ff6a348d7993b2d4
```

### Finalización:
```javascript
psbt.finalizeAllInputs();
const finalTx = psbt.extractTransaction();
```

**🌐 ESTADO EN LA RED**: 
- ❌ **Nada se sube a la red** - Construcción offline de transacción
- ⚡ **Ubicación**: PSBT construido localmente
- 🔄 **Proceso**: Firmas agregadas offline por cada participante
- 📝 **Preparación**: Transacción lista para broadcast pero no enviada
- 🔒 **Privacidad**: Script aún no revelado

## Paso 5: Revelación y Gasto (On-chain) - ANÁLISIS COMPLETO DE OPCODES

### Transacción de gasto completa:
```json
{
  "txid": "49f5c4923a4b95951463e96bdf1200978297f2ece71fb7717d5893cc54dac932",
  "version": 2,
  "inputs": [{
    "previous_output": "607a5c1b0ac6c27cfd37387d6c0619fe8bab8ccaa52f6b635fa57b79fd21e79f:0",
    "sequence": 4294967295,
    "scriptSig": ""
  }],
  "outputs": [{
    "value": 35000,
    "scriptPubKey": {
      "address": "tb1qdgz30uqwscfcr3nyxngflugu5ymv92mqgyugus"
    }
  }],
  "witness": [[
    "",
    "3045022100a4671cab2f9c76be3348a4372da1127b7cd1c779058dd7e72963ffda5b771f70022015b3d0f59e48b34b38cd70c949ecf0cc713c901d59a80425d4eed10ad49712a5",
    "3045022100b65c7cb6c559cddb0e65872a4da56499d5eddff1229b157d3d418cd6f110e7e002207d79fd0bc43b3a4f60b37d344a3d257e5a5df952b61a5f57ff6a348d7993b2d4",
    "522102c7defb97aa6ed2a9b044b062a3f14b75d725773bfbec8339463100515bc0536021033823984c002d0e02a26d56a7a228330141468cecc61c6618dbcb98bd52c43ad5210324216b030f68ce3aa1e33e039984d39339f968f436e6b1c1b0fb18d480f2b6ad53ae"
  ]]
}
```

### 🔍 ANÁLISIS DETALLADO DEL WITNESS:

| Posición | Contenido | Propósito | Opcode Equivalente |
|----------|-----------|-----------|-------------------|
| `witness[0]` | `""` (vacío) | Bug de OP_CHECKMULTISIG | `OP_0` dummy |
| `witness[1]` | `3045022100a467...` | Primera firma válida | Firma DER |
| `witness[2]` | `3045022100b65c...` | Segunda firma válida | Firma DER |
| `witness[3]` | `522102c7defb...` | Script completo | WitnessScript |

### Proceso de validación de la red:

#### 1. Extracción del witness:
```
witness[0] = "" (campo vacío requerido)
witness[1] = "3045022100a4671cab..." (firma1)
witness[2] = "3045022100b65c7cb6c..." (firma2)  
witness[3] = "522102c7defb97aa6ed..." (witnessScript completo)
```

#### 2. Verificación del hash:
```python
# La red calcula:
script_from_witness = "522102c7defb97aa6ed2a9b044b062a3f14b75d725773bfbec8339463100515bc0536021033823984c002d0e02a26d56a7a228330141468cecc61c6618dbcb98bd52c43ad5210324216b030f68ce3aa1e39984d39339f968f436e6b1c1b0fb18d480f2b6ad53ae"

computed_hash = sha256(script_from_witness)
# Resultado: 9333fd9fa2c504a400de7a53f760a43709a31b6d34b0986a343991c726d97ac1

# Compara con la dirección original:
original_hash = "9333fd9fa2c504a400de7a53f760a43709a31b6d34b0986a343991c726d97ac1"

if computed_hash == original_hash:
    print("Script auténtico - proceder con validación")
```

#### 3. 🔍 DECODIFICACIÓN Y EJECUCIÓN DEL SCRIPT - PASO A PASO:

```python
# La red decodifica el witnessScript por primera vez:
script_decoded = {
    'type': 'multisig',
    'required_signatures': 2,
    'public_keys': [
        '02c7defb97aa6ed2a9b044b062a3f14b75d725773bfbec8339463100515bc05360',
        '033823984c002d0e02a26d56a7a228330141468cecc61c6618dbcb98bd52c43ad5', 
        '0324216b030f68ce3aa1e33e039984d39339f968f436e6b1c1b0fb18d480f2b6ad'
    ]
}

# Ahora la red entiende: "Esta dirección requiere 2 de 3 firmas"
```

#### 4. 🔍 EJECUCIÓN COMPLETA DEL SCRIPT POR LA VM:

**Estado inicial del stack:**
```
Stack inicial: [witness[0], witness[1], witness[2]]
Stack inicial: ["", sig1, sig2]
```

**Ejecución opcode por opcode:**

| Paso | Opcode | Stack Antes | Acción | Stack Después |
|------|--------|-------------|--------|---------------|
| 1 | `OP_2` | `["", sig1, sig2]` | Push 2 | `["", sig1, sig2, 2]` |
| 2 | `OP_PUSHDATA+key1` | `["", sig1, sig2, 2]` | Push key1 | `["", sig1, sig2, 2, key1]` |
| 3 | `OP_PUSHDATA+key2` | `["", sig1, sig2, 2, key1]` | Push key2 | `["", sig1, sig2, 2, key1, key2]` |
| 4 | `OP_PUSHDATA+key3` | `["", sig1, sig2, 2, key1, key2]` | Push key3 | `["", sig1, sig2, 2, key1, key2, key3]` |
| 5 | `OP_3` | `["", sig1, sig2, 2, key1, key2, key3]` | Push 3 | `["", sig1, sig2, 2, key1, key2, key3, 3]` |
| 6 | `OP_CHECKMULTISIG` | `["", sig1, sig2, 2, key1, key2, key3, 3]` | **Verificar** | `[True/False]` |

#### 5. 🔍 LÓGICA INTERNA DE OP_CHECKMULTISIG:

```python
def execute_checkmultisig(stack):
    # Pop número de claves públicas
    num_pubkeys = stack.pop()  # 3
    
    # Pop claves públicas
    pubkeys = []
    for i in range(num_pubkeys):
        pubkeys.append(stack.pop())  # [key3, key2, key1]
    pubkeys.reverse()  # [key1, key2, key3]
    
    # Pop número de firmas requeridas
    num_sigs_required = stack.pop()  # 2
    
    # Pop firmas (incluyendo dummy)
    signatures = []
    for i in range(num_sigs_required + 1):  # +1 por el bug
        signatures.append(stack.pop())  # ["", sig2, sig1]
    signatures.reverse()  # [sig1, sig2, ""]
    signatures = signatures[1:]  # [sig1, sig2] (remover dummy)
    
    # Verificar firmas contra claves
    valid_count = 0
    sig_index = 0
    
    for pubkey in pubkeys:
        if sig_index < len(signatures):
            if verify_signature(signatures[sig_index], tx_hash, pubkey):
                valid_count += 1
                sig_index += 1
    
    # Resultado final
    return valid_count >= num_sigs_required
```

### 🔍 DEBUGGING DE LA EJECUCIÓN:

```python
def debug_script_execution(script_hex, witness_data):
    stack = ["", "sig1", "sig2"]  # Estado inicial
    opcodes = parse_script(script_hex)
    
    print("=== SCRIPT EXECUTION DEBUG ===")
    for i, opcode in enumerate(opcodes):
        print(f"Step {i+1}: {opcode}")
        print(f"Stack antes: {stack}")
        
        execute_opcode(opcode, stack)
        
        print(f"Stack después: {stack}")
        print("---")
    
    return stack[-1] if stack else False

# Ejemplo de salida:
# === SCRIPT EXECUTION DEBUG ===
# Step 1: OP_2
# Stack antes: ['', 'sig1', 'sig2'] 
# Stack después: ['', 'sig1', 'sig2', 2]
# ---
# Step 2: OP_PUSHDATA(33) key1
# Stack antes: ['', 'sig1', 'sig2', 2]
# Stack después: ['', 'sig1', 'sig2', 2, 'key1']
# ---
# ...
# Step 6: OP_CHECKMULTISIG  
# Stack antes: ['', 'sig1', 'sig2', 2, 'key1', 'key2', 'key3', 3]
# Stack después: [True]
# ---
# RESULT: Transaction VALID
```

#### 6. Validación de firmas:
```python
# Para cada firma en el witness:
signature1 = "3045022100a4671cab2f9c76be3348a4372da1127b7cd1c779058dd7e72963ffda5b771f70022015b3d0f59e48b34b38cd70c949ecf0cc713c901d59a80425d4eed10ad49712a5"
signature2 = "3045022100b65c7cb6c559cddb0e65872a4da56499d5eddff1229b157d3d418cd6f110e7e002207d79fd0bc43b3a4f60b37d344a3d257e5a5df952b61a5f57ff6a348d7993b2d4"

# La red verifica:
transaction_hash = sha256(transaction_data)

# Verificar firma1 contra todas las claves públicas:
for pubkey in public_keys:
    if verify_signature(signature1, transaction_hash, pubkey):
        valid_signatures += 1
        break

# Verificar firma2 contra las claves restantes:
for pubkey in remaining_public_keys:
    if verify_signature(signature2, transaction_hash, pubkey):
        valid_signatures += 1
        break

# Resultado: valid_signatures = 2
# Requerido: 2
# Conclusión: Transacción válida
```

### Estado final del stack:
```
Si valid_count >= 2: stack = [True]  → Transacción válida
Si valid_count < 2:  stack = [False] → Transacción inválida
```

#### 7. Actualización del estado:
```python
# La red actualiza el UTXO set:
utxo_set.remove("607a5c1b0ac6c27cfd37387d6c0619fe8bab8ccaa52f6b635fa57b79fd21e79f:0")
utxo_set.add("49f5c4923a4b95951463e96bdf1200978297f2ece71fb7717d5893cc54dac932:0", {
    'value': 35000,
    'address': 'tb1qdgz30uqwscfcr3nyxngflugu5ymv92mqgyugus'
})
```

**🌐 ESTADO EN LA RED**: 
- ✅ **SE SUBE A LA RED** - Transacción broadcast y confirmada
- ⚡ **Qué se almacena**: 
  - Transacción completa con witness data
  - **SCRIPT MULTISIG REVELADO**: `OP_2 key1 key2 key3 OP_3 OP_CHECKMULTISIG`
  - Firmas válidas de 2 participantes
  - UTXO anterior gastado y removido del UTXO set
  - Nuevo UTXO creado con 35,000 sats
- 🔓 **Privacidad PERDIDA**: Script ahora público permanentemente
- 📊 **Red ve**: Tipo MultiSig 2-of-3, claves públicas, firmas usadas
- 💾 **Almacenado en**: Blockchain permanentemente + nuevos UTXOs
- 📈 **Fees**: 15,000 sats pagados a mineros

## Paso 6: Resultado Final

### Lo que cambió en la blockchain:

**Antes:**
- UTXO: `607a5c1b...79f:0` con 50,000 sats en dirección hash (script oculto)

**Después:**  
- UTXO gastado: La red sabe que era un MultiSig 2-of-3 con 3 claves específicas
- Nuevo UTXO: `49f5c492...932:0` con 35,000 sats en dirección regular
- Historia permanente: Cualquiera puede ver el script MultiSig en el witness

### Información ahora pública:
- La dirección `tb1qjvelm8azc5z2gqx70fflwc9yxuy6xxmdxjcfs6358xguwfke0tqs7my58r` era un MultiSig
- Requería 2 de 3 firmas específicas
- Las 3 claves públicas involucradas
- Cómo se gastó y cuándo
- **Los opcodes exactos**: `OP_2 key1 key2 key3 OP_3 OP_CHECKMULTISIG`

La "revelación" es irreversible - una vez gastado, el script queda expuesto para siempre en la blockchain.

## 🔍 COMPARACIÓN DE OPCODES: P2WSH vs P2SH

### P2SH tradicional (no usado aquí):
```
ScriptPubKey: a914<20-byte-hash>87
```
- `a9` = `OP_HASH160`  
- `14` = `OP_PUSHDATA(20)`
- `<hash>` = HASH160 del script
- `87` = `OP_EQUAL`

### P2WSH (usado en nuestro ejemplo):
```
ScriptPubKey: 0020<32-byte-hash>
```
- `00` = `OP_0` (witness version)
- `20` = `OP_PUSHDATA(32)`  
- `<hash>` = SHA256 del script

### Diferencias clave en opcodes:

| Aspecto | P2SH | P2WSH |
|---------|------|-------|
| **Hash usado** | HASH160 (20 bytes) | SHA256 (32 bytes) |
| **Opcodes** | `OP_HASH160 OP_PUSHDATA(20) <hash> OP_EQUAL` | `OP_0 OP_PUSHDATA(32) <hash>` |
| **Ubicación del script** | scriptSig | witness |
| **Malleabilidad** | Vulnerable | Protegido |
| **Eficiencia** | Menor | Mayor (witness discount) |

## Conclusión Técnica

El MultiSig funciona como un contrato inteligente primitivo donde:

1. **Privacidad inicial**: El contrato está oculto detrás de un hash
2. **Depósito sin revelación**: Los fondos se envían al hash sin exponer las reglas
3. **Revelación controlada**: El contrato se revela solo cuando se usa
4. **Validación automática**: La red verifica automáticamente el cumplimiento
5. **Transparencia final**: Una vez usado, el contrato queda permanentemente visible

### Lo que revelan los opcodes:

Los opcodes revelan la mecánica interna exacta de cómo Bitcoin valida transacciones MultiSig:

1. **Construcción**: Opcodes definen la lógica del contrato (`OP_2 ... OP_3 OP_CHECKMULTISIG`)
2. **Ocultación**: P2WSH oculta el script detrás de un hash (`OP_0 OP_PUSHDATA_32`)
3. **Revelación**: El witness expone el script completo
4. **Ejecución**: La VM ejecuta cada opcode secuencialmente
5. **Validación**: `OP_CHECKMULTISIG` verifica las firmas criptográficamente

### Puntos críticos de análisis:

- **Paso 2**: Construcción del script - Aquí se ven los opcodes que definen las reglas
- **Paso 3**: Ocultación - El script se esconde detrás de opcodes minimalistas
- **Paso 5**: Revelación y ejecución - El momento donde los opcodes se ejecutan paso a paso

Este mecanismo permite custodia compartida descentralizada sin intermediarios, donde el protocolo mismo hace cumplir las reglas predefinidas a través de la ejecución determinística de opcodes.

### 🔍 HERRAMIENTAS DE ANÁLISIS:

Para analizar en profundidad cualquier transacción MultiSig:

1. **Decodificador de scripts**: Para convertir hex a opcodes legibles
2. **Simulador de stack**: Para seguir la ejecución paso a paso  
3. **Verificador de firmas**: Para validar cada firma individualmente
4. **Analizador de witness**: Para entender la estructura del witness

Este nivel de análisis es crucial para entender vulnerabilidades, optimizaciones, y el funcionamiento interno del protocolo Bitcoin.

---

# 📚 APÉNDICE: La Máquina Virtual de Bitcoin (Bitcoin VM)

## ¿Qué es la VM de Bitcoin?

La **VM de Bitcoin** (Virtual Machine) es el motor de ejecución de scripts que forma parte del software de cada nodo Bitcoin. Es el componente que:

### 🧠 Función Principal:
- **Ejecuta y valida scripts** de Bitcoin para determinar si una transacción es válida
- **Procesa opcodes** uno por uno siguiendo reglas estrictas
- **Mantiene un stack** (pila) para operaciones
- **Devuelve TRUE o FALSE** según si el script se ejecuta exitosamente

### 🔧 Características Técnicas:

**Stack-based (Basada en pila):**
```
Stack: [elemento1, elemento2, elemento3]
        ↑
    Último elemento (top)
```

**Determinística:**
- Mismo input = mismo output, siempre
- No hay randomness ni operaciones impredecibles

**Limitada intencionalmente:**
- No es Turing-completa (no puede hacer loops infinitos)
- Máximo 201 opcodes por script
- Stack limitado a 1000 elementos
- Operaciones aritméticas limitadas

### 🏗️ Arquitectura:

```
┌─────────────────────────────────────┐
│            NODO BITCOIN             │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │        BITCOIN VM           │    │
│  │  ┌─────────────────────┐    │    │
│  │  │     Stack Engine    │    │    │
│  │  │   [val3, val2, val1]│    │    │
│  │  └─────────────────────┘    │    │
│  │  ┌─────────────────────┐    │    │
│  │  │   Opcode Processor  │    │    │
│  │  │  OP_DUP, OP_HASH... │    │    │
│  │  └─────────────────────┘    │    │
│  │  ┌─────────────────────┐    │    │
│  │  │ Validation Engine   │    │    │
│  │  │   TRUE/FALSE        │    │    │
│  │  └─────────────────────┘    │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### 📋 Ejemplo de Ejecución:

Para un script simple P2PKH:
```
ScriptPubKey: OP_DUP OP_HASH160 <pubkeyHash> OP_EQUALVERIFY OP_CHECKSIG
ScriptSig:    <signature> <publicKey>
```

**Ejecución paso a paso:**
```
Inicio: [signature, publicKey]

1. OP_DUP:        [signature, publicKey, publicKey]
2. OP_HASH160:    [signature, publicKey, hash(publicKey)]
3. <pubkeyHash>:  [signature, publicKey, hash(publicKey), pubkeyHash]
4. OP_EQUALVERIFY: [signature, publicKey] (si hash coincide)
5. OP_CHECKSIG:   [TRUE] (si firma es válida)
```

### 🚫 Limitaciones de Seguridad:

**Lo que NO puede hacer:**
- Acceder a internet o archivos
- Operaciones de red
- Loops infinitos
- Operaciones de fecha/tiempo
- Acceso a memoria arbitraria
- Operaciones no determinísticas

**Por qué está limitada:**
- **Consenso**: Todos los nodos deben llegar al mismo resultado
- **Seguridad**: Prevenir ataques DoS
- **Predictibilidad**: Evitar comportamientos inesperados

### 🎯 En el contexto del MultiSig:

En nuestro ejemplo, la VM:

1. **Recibe el witness:**
   ```
   ["", firma1, firma2, witnessScript]
   ```

2. **Valida el hash del script:**
   ```python
   if sha256(witnessScript) == expected_hash:
       continue_execution()
   ```

3. **Ejecuta el witnessScript:**
   ```
   OP_2 → push 2
   OP_PUSHDATA → push key1
   OP_PUSHDATA → push key2  
   OP_PUSHDATA → push key3
   OP_3 → push 3
   OP_CHECKMULTISIG → validate signatures
   ```

4. **Devuelve resultado:**
   ```
   Stack final: [TRUE] → Transacción válida
   ```

### 🔄 Comparación con otras VMs:

| Aspecto | Bitcoin VM | Ethereum VM | JVM |
|---------|------------|-------------|-----|
| **Propósito** | Validar transacciones | Smart contracts | Ejecutar Java |
| **Complejidad** | Simple | Compleja | Muy compleja |
| **Turing-complete** | ❌ | ✅ | ✅ |
| **Gas/Fees** | Implícito | Explícito | N/A |
| **Persistencia** | Solo UTXO | Estado global | Memoria/disco |

### 💡 Puntos Clave:

1. **Cada nodo tiene su VM**: No es un servicio centralizado
2. **Ejecuta durante validación**: Solo cuando se valida una transacción
3. **Determinística**: Fundamental para el consenso
4. **Limitada por diseño**: Seguridad sobre funcionalidad
5. **Stack-based**: Diferente a VMs register-based

### 🔍 Opcodes Más Comunes:

| Opcode | Hex | Descripción | Ejemplo de uso |
|--------|-----|-------------|----------------|
| `OP_0` | `00` | Push bytes vacío | Witness version |
| `OP_1` a `OP_16` | `51-60` | Push números 1-16 | Conteos, versiones |
| `OP_DUP` | `76` | Duplicar top del stack | P2PKH validation |
| `OP_HASH160` | `a9` | RIPEMD160(SHA256(x)) | Address hashing |
| `OP_EQUAL` | `87` | Comparar dos elementos | Hash verification |
| `OP_CHECKSIG` | `ac` | Verificar firma ECDSA | Firma única |
| `OP_CHECKMULTISIG` | `ae` | Verificar múltiples firmas | MultiSig |
| `OP_PUSHDATA1` | `4c` | Push 1-75 bytes | Datos pequeños |
| `OP_PUSHDATA2` | `4d` | Push hasta 520 bytes | Scripts, claves |

### 🚨 Casos Especiales y Bugs:

**Bug de OP_CHECKMULTISIG:**
- Consume un elemento extra del stack (el "dummy element")
- Requiere un `""` vacío al inicio del witness
- Comportamiento preservado por compatibilidad

**Límites de validación:**
- Script máximo: 10,000 bytes
- Stack máximo: 1,000 elementos
- Operaciones máximas: 201 opcodes

### 🎭 Estados de la VM:

```python
class BitcoinVM:
    def __init__(self):
        self.stack = []
        self.alt_stack = []
        self.script_pos = 0
        self.opcode_count = 0
        self.execution_result = None
    
    def execute_script(self, script, witness_data=None):
        # Inicializar stack con witness (si P2WSH)
        if witness_data:
            self.stack = witness_data[:-1]  # Todo excepto el script
            script = witness_data[-1]       # Último elemento es el script
        
        # Ejecutar cada opcode
        for opcode in parse_script(script):
            if self.opcode_count >= 201:
                return False  # Límite excedido
            
            result = self.execute_opcode(opcode)
            if not result:
                return False
                
            self.opcode_count += 1
        
        # Script válido si stack tiene exactamente un TRUE
        return len(self.stack) == 1 and self.stack[0] == True
```

La VM de Bitcoin es intencionalmente "aburrida" y predecible - esto es una característica, no un defecto. Su simplicidad garantiza que el consenso sea posible y que el sistema sea seguro y predecible, siendo el fundamento sobre el cual se ejecutan todas las validaciones de transacciones en la red Bitcoin.