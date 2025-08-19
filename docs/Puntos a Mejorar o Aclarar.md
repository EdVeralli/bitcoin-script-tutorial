Puntos a Mejorar o Aclarar:
FASE 1: Crear MultiSig SegWit Nativo

    Generación de claves:

        Las claves se generan con getnewaddress, pero no se verifica que sean claves seguras (por defecto, Bitcoin Core usa BIP32 con derivación determinista). Sería útil mencionar:
        bash

    # Verificar que las claves son derivadas de la seed del wallet (BIP32)
    bitcoin-cli -testnet getaddressinfo "DIRECCION_ALICE" | grep hdkeypath

    Recomendación: Para producción, usar hardware wallets o seeds dedicadas (no compartir el mismo wallet para todas las claves).

Descriptor checksum:

    El checksum del descriptor se calcula automáticamente con getdescriptorinfo, pero el tutorial no explica su importancia (evita errores al importar). Podría añadir:
    bash

        # Ejemplo de descriptor con checksum válido
        "wsh(multi(2,02abcd...,02efgh...,02ijkl...))#5a2f3z1"



FASE 2: Funding del MultiSig

    Verificación del UTXO:

        El tutorial obtiene el scriptPubKey del UTXO manualmente (decoderawtransaction), pero en Bitcoin Core 24+, se puede usar directamente:
        bash

    bitcoin-cli -testnet listunspent | grep "DIRECCION_MULTISIG"

    Esto muestra automáticamente el scriptPubKey y amount del UTXO.

Fondos mínimos:

    Sugiere enviar 0.001 tBTC, pero no menciona que el fee real será mayor (depende del tamaño de la transacción). Sería útil estimar el fee con:
    bash

bitcoin-cli -testnet getmempoolinfo
bitcoin-cli -testnet estimatesmartfee 6


FASE 3: Gastar desde MultiSig

    Firma automática:

        El tutorial asume que signrawtransactionwithwallet firmará correctamente porque el descriptor está importado, pero no explica qué pasa si faltan claves privadas. Debería aclarar:

            Si "complete": false, falta una clave privada necesaria en el wallet.

            En la vida real, se necesitaría un PSBT para coordinar firmas entre dispositivos.

    Alternativa con PSBT (recomendada):

        Para un flujo más realista, podrían añadirse pasos opcionales con PSBT:
        bash

# Crear PSBT en lugar de transacción raw
bitcoin-cli -testnet walletcreatefundedpsbt '[{"txid":"...","vout":0}]' '[{"destino":0.0009}]'

# Firmar PSBT (cada participante lo haría en su dispositivo)
bitcoin-cli -testnet walletprocesspsbt "psbt_base64"

# Combinar y finalizar
bitcoin-cli -testnet finalizepsbt "psbt_firmada"
