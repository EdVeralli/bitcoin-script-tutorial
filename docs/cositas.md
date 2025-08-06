
# Ver en web
```
https://blockstream.info/testnet/address/2NE58e9bQeGMtQv1cWLDAupviC2g3Y96856
```


# Muestra hasta 10 transacciones más recientes
```
bitcoin-cli -testnet listtransactions "*" 10
```

# Crear dirección nueva para recibir los fondos liberados
```
bitcoin-cli -testnet getnewaddress "recovered" "bech32"
│─────────────────│ │───────────│ │────────│  │──────│
│                 │ │           │ │        │  │      │
│ Cliente + Red   │ │ Comando   │ │ Label  │  │ Tipo │
└─────────────────┘ └───────────┘ └────────┘  └──────┘
```
Nueva Direccion---> tb1qfg0uhn0k5ln09x9tl6m5spkghj4fu6sx2a6p4j



# Crear transacción para gastar el UTXO. ( aun falta firmar y sacarlo  )
```
bitcoin-cli -testnet createrawtransaction \
'[{"txid":"55420821971d76018d1da7913c497a55bad2f642fb4fb33b2a7e4748f862ad72","vout":1}]' \
'{"tb1qfg0uhn0k5ln09x9tl6m5spkghj4fu6sx2a6p4j":0.0009}'
```
--> Me devuelve la transaccion que hice en mi compu, NO esta subida a la blockchain !!!!
020000000172ad62f848477e2a3bb34ffb42f6d2ba557a493c91a71d8d01761d97210842550100000000fdffffff01905f0100000000001600144a1fcbcdf6a7e6f298abfeb74806c8bcaa9e6a0600000000


# Para ver mi transaccion vacia localmente
```
bitcoin-cli -testnet decoderawtransaction '020000000172ad62f848477e2a3bb34ffb42f6d2ba557a493c91a71d8d01761d97210842550100000000fdffffff01905f0100000000001600144a1fcbcdf6a7e6f298abfeb74806c8bcaa9e6a0600000000'
```

Me muestra esto:
```
{
  "txid": "1838cc9adc60b487dfe24b3eec8bdaf6df3f0f6e07c591df4249a4ba5238ba81",
  "hash": "1838cc9adc60b487dfe24b3eec8bdaf6df3f0f6e07c591df4249a4ba5238ba81",
  "version": 2,
  "size": 82,
  "vsize": 82,
  "weight": 328,
  "locktime": 0,
  "vin": [
    {
      "txid": "55420821971d76018d1da7913c497a55bad2f642fb4fb33b2a7e4748f862ad72",
      "vout": 1,
      "scriptSig": {
        "asm": "",
        "hex": ""
      },
      "sequence": 4294967293
    }
  ],
  "vout": [
    {
      "value": 0.00090000,
      "n": 0,
      "scriptPubKey": {
        "asm": "0 4a1fcbcdf6a7e6f298abfeb74806c8bcaa9e6a06",
        "desc": "addr(tb1qfg0uhn0k5ln09x9tl6m5spkghj4fu6sx2a6p4j)#n7f3v0at",
        "hex": "00144a1fcbcdf6a7e6f298abfeb74806c8bcaa9e6a06",
        "address": "tb1qfg0uhn0k5ln09x9tl6m5spkghj4fu6sx2a6p4j",
        "type": "witness_v0_keyhash"
      }
    }
  ]
}
```


# Ahora toca ejecutar el RedeemScript
```
bitcoin-cli -testnet signrawtransactionwithkey \
'020000000172ad62f848477e2a3bb34ffb42f6d2ba557a493c91a71d8d01761d97210842550100000000fdffffff01905f0100000000001600144a1fcbcdf6a7e6f298abfeb74806c8bcaa9e6a0600000000' \
'[]' \
'[{
  "txid":"55420821971d76018d1da7913c497a55bad2f642fb4fb33b2a7e4748f862ad72",
  "vout":1,
  "scriptPubKey":"a91407876b3d158b4e3a6c7140e0262b8cfeeef4ae8287",
  "redeemScript":"a820b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde987",
  "amount":0.001
}]'

```
## Decodificación del redeemScript:
```
a820b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde987

a8 = OP_SHA256
20 = PUSH 32 bytes
b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde987 = Hash objetivo  
87 = OP_EQUAL
```

### Traducción humana del redeemScript
Para gastar este UTXO, debes proporcionar un valor que:
1. Cuando se le aplique SHA256
2. Produzca el hash b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde987

