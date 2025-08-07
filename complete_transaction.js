// Construir transacción Bitcoin manualmente
const txid = "55420821971d76018d1da7913c497a55bad2f642fb4fb33b2a7e4748f862ad72";

// "hello world" en hex
const helloWorldHex = "68656c6c6f20776f726c64"; // 11 bytes
const redeemScript = "a820b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde987"; // 35 bytes

// Construir scriptSig
const scriptSig = "0b" + helloWorldHex + "23" + redeemScript;
console.log("🔑 ScriptSig:", scriptSig);
console.log("📏 ScriptSig length:", scriptSig.length / 2, "bytes");

// Reversar txid para little-endian
function reverseTxid(txid) {
    return txid.match(/.{2}/g).reverse().join('');
}

const reversedTxid = reverseTxid(txid);
console.log("🔄 Reversed TXID:", reversedTxid);

// Construir transacción completa
const version = "02000000";
const inputCount = "01";
const inputTxid = reversedTxid;
const inputVout = "01000000";
const scriptSigLen = (scriptSig.length / 2).toString(16).padStart(2, '0');
const sequence = "fdffffff";
const outputCount = "01"; 
const outputValue = "905f010000000000"; // 90000 satoshis
const outputScript = "1600144a1fcbcdf6a7e6f298abfeb74806c8bcaa9e6a06";
const locktime = "00000000";

const completeTx = version + inputCount + inputTxid + inputVout + scriptSigLen + scriptSig + sequence + outputCount + outputValue + outputScript + locktime;

console.log("\n🚀 TRANSACCIÓN FINAL:");
console.log(completeTx);
console.log("\n📝 Para enviar:");
console.log(`bitcoin-cli -testnet sendrawtransaction '${completeTx}'`);

