# Mi Tutorial de Bitcoin Script

🔐 **Smart contracts en Bitcoin Script nativo - Aprendizaje práctico**

## 🎯 Lo que logré

- ✅ **Bitcoin Core** configurado en testnet
- ✅ **Smart contract** hash preimage challenge implementado
- ✅ **Simulador local** de Bitcoin Script funcional
- ✅ **Contrato verificado** por Bitcoin Core oficial
- ✅ **Direcciones P2SH** generadas correctamente

## 🚀 Scripts incluidos

- `bitcoin_script_simulator.js` - Simulador Bitcoin Script stack-based
- `create_real_contract.js` - Generador de contratos en hexadecimal
- `bitcoin_contract_summary.js` - Resumen completo y certificado

## 🏆 Mi Smart Contract

**Locking Script:** `a820b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde987`

**¿Qué hace?** Requiere conocer el preimage del hash SHA256 de "hello world" para gastar el Bitcoin.

## ⚡ Ejecutar

```bash
# Simulador local:
node bitcoin_script_simulator.js

# Generar contrato:
node create_real_contract.js

# Ver resumen completo:
node bitcoin_contract_summary.js
