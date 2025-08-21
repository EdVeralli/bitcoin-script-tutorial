# Limpieza Completa para Tutorial MultiSig Bitcoin

Esta guía te permite eliminar completamente todos los datos del tutorial para empezar desde cero con un ambiente limpio.

## Pasos de Limpieza

### 1. Detener y Limpiar Bitcoin Core

```bash
# Detener Bitcoin Core
bitcoin-cli -testnet stop
killall bitcoind 2>/dev/null

# Limpiar datos de testnet (mantiene mainnet intacto)
rm -rf ~/.bitcoin/testnet3/

# Limpiar wallets específicos
rm -rf ~/.bitcoin/wallets/

# Limpiar archivo de configuración para empezar limpio
rm ~/.bitcoin/bitcoin.conf

# Verificar que se eliminó todo
ls -la ~/.bitcoin/
```

### 2. Limpiar Proyecto JavaScript

```bash
# Eliminar directorio completo del proyecto
rm -rf ~/bitcoin-script-tutorial/
rm -rf ~/bitcoin-multisig-hybrid/

# O si quieres ser más específico
cd ~/bitcoin-script-tutorial/bitcoin-multisig-hybrid/ 2>/dev/null && {
    rm -f keys.json multisig.json
    rm -f multisig.js bitcoin-helper.js verify.js
    rm -rf node_modules/
    rm -f package.json package-lock.json
}
```

### 3. Limpiar Wallets del Tutorial Anterior

```bash
# Si usaste wallets específicos, eliminarlos
bitcoin-cli -testnet unloadwallet "funds_wallet" 2>/dev/null
bitcoin-cli -testnet unloadwallet "multisig_clean" 2>/dev/null
bitcoin-cli -testnet unloadwallet "multisig_prune" 2>/dev/null

# Nota: Estos comandos fallarán si Bitcoin no está corriendo, pero es normal
```

### 4. Verificar Limpieza Completa

```bash
# Verificar que no hay procesos Bitcoin corriendo
ps aux | grep bitcoin

# Verificar que no hay archivos de configuración
ls -la ~/.bitcoin/

# Verificar directorios de proyecto
ls -la ~/bitcoin-script-tutorial/ 2>/dev/null || echo "Directorio no existe (correcto)"

# Verificar que no hay variables de entorno
unset MULTISIG_ADDR TXID_FUNDING VOUT AMOUNT_SATS DESTINO FAUCET_ADDR
```

### 5. Reset Completo (Opcional - Más Drástico)

Solo usar si quieres una limpieza total del sistema:

```bash
# Eliminar Bitcoin Core completamente
sudo apt remove bitcoin-core bitcoind bitcoin-cli

# Eliminar Node.js si quieres reinstalar
sudo apt remove nodejs npm

# Limpiar directorios completamente
rm -rf ~/.bitcoin/
rm -rf ~/bitcoin-script-tutorial/
```

### 6. Verificación Final

```bash
# Estos comandos deben fallar o no encontrar nada:
echo "Verificando limpieza..."

# Bitcoin Core no debe responder
bitcoin-cli -testnet getblockchaininfo 2>/dev/null && echo "❌ Bitcoin aún corriendo" || echo "✅ Bitcoin limpio"

# Directorios no deben existir
[ -d ~/.bitcoin/testnet3 ] && echo "❌ Testnet aún existe" || echo "✅ Testnet limpio"
[ -d ~/bitcoin-script-tutorial ] && echo "❌ Proyecto aún existe" || echo "✅ Proyecto limpio"

# Variables deben estar vacías
[ -z "$MULTISIG_ADDR" ] && echo "✅ Variables limpias" || echo "❌ Variables aún definidas"
```

### 7. Estado Limpio Esperado

Después de la limpieza deberías tener:

- ✅ Bitcoin Core sin datos de testnet
- ✅ Sin archivo bitcoin.conf
- ✅ Sin wallets previos  
- ✅ Sin archivos JavaScript del tutorial
- ✅ Sin variables de entorno relacionadas
- ✅ Directorio ~/.bitcoin/ vacío o solo con datos de mainnet
- ✅ Sin procesos bitcoind corriendo

### 8. Preparación para Nuevo Tutorial

```bash
# Crear directorio fresco para mañana
mkdir -p ~/bitcoin-script-tutorial/
cd ~/bitcoin-script-tutorial/

echo "✅ Ambiente limpio preparado para el tutorial"
echo "Mañana puedes empezar desde la configuración de bitcoin.conf"
```

## Comandos de Verificación Rápida

Para verificar que todo está limpio:

```bash
#!/bin/bash
# Script de verificación rápida

echo "=== VERIFICACIÓN DE LIMPIEZA ==="

# Verificar procesos
if pgrep bitcoind > /dev/null; then
    echo "❌ Bitcoin Core aún corriendo"
else
    echo "✅ Bitcoin Core detenido"
fi

# Verificar directorios
if [ -d ~/.bitcoin/testnet3 ]; then
    echo "❌ Datos testnet aún existen"
else
    echo "✅ Datos testnet eliminados"
fi

if [ -d ~/bitcoin-script-tutorial ]; then
    echo "❌ Directorio proyecto aún existe"
else
    echo "✅ Directorio proyecto limpio"
fi

# Verificar configuración
if [ -f ~/.bitcoin/bitcoin.conf ]; then
    echo "❌ bitcoin.conf aún existe"
else
    echo "✅ bitcoin.conf eliminado"
fi

echo "=== FIN VERIFICACIÓN ==="
```

## Notas Importantes

- **Mainnet seguro**: Esta limpieza solo afecta testnet, no tus bitcoins reales
- **Datos importantes**: Si tienes wallets de mainnet importantes, haz backup antes de limpiar
- **Node.js**: La limpieza de Node.js es opcional, solo si quieres reinstalar
- **Tiempo**: El tutorial desde cero tomará tiempo para sincronizar Bitcoin Core nuevamente

Con esta limpieza tendrás exactamente el mismo ambiente que tendría un usuario completamente nuevo siguiendo el tutorial.