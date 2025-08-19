"alice" 
tb1qpesckvn06ra0m7nck6lytgdutu4kk9lt3p26p4

"bob" 
tb1q74pnqfwcurnfn632j46y38zxkhkv4knnkjpxu4

"charlie" 
tb1q0vwn8ljz0ywkymtmjk49zu8pcuvee2htwjhjsa


bitcoin-cli -testnet getnewaddress "alice" "bech32"
bitcoin-cli -testnet getnewaddress "bob" "bech32"  
bitcoin-cli -testnet getnewaddress "charlie" "bech32"


bitcoin-cli -testnet getaddressinfo "DIRECCION_ALICE"
bitcoin-cli -testnet getaddressinfo "DIRECCION_BOB"
bitcoin-cli -testnet getaddressinfo "DIRECCION_CHARLIE"

bitcoin-cli -testnet getaddressinfo "tb1qpesckvn06ra0m7nck6lytgdutu4kk9lt3p26p4"
bitcoin-cli -testnet getaddressinfo "tb1q74pnqfwcurnfn632j46y38zxkhkv4knnkjpxu4"
bitcoin-cli -testnet getaddressinfo "tb1q0vwn8ljz0ywkymtmjk49zu8pcuvee2htwjhjsa"

---------------------------------------------------------------------------
---------------------------------------------------------------------------

eduardoveralli@SECITD-12771NZLX:~$ bitcoin-cli -testnet getaddressinfo "tb1qpesckvn06ra0m7nck6lytgdutu4kk9lt3p26p4"
bitcoin-cli -testnet getaddressinfo "tb1q74pnqfwcurnfn632j46y38zxkhkv4knnkjpxu4"
bitcoin-cli -testnet getaddressinfo "tb1q0vwn8ljz0ywkymtmjk49zu8pcuvee2htwjhjsa"
{
  "address": "tb1qpesckvn06ra0m7nck6lytgdutu4kk9lt3p26p4",
  "scriptPubKey": "00140e618b326fd0fafdfa78b6be45a1bc5f2b6b17eb",
  "ismine": true,
  "solvable": true,
  "desc": "wpkh([4dc85257/84'/1'/0'/0/3]037f1787a245c00d5bdec639bd7e76226677fb2b5ad323e5b48b064ebe39b6ac30)#vszt3nmd",
  "parent_desc": "wpkh([4dc85257/84'/1'/0']tpubDDVwr8SXCjyhJnZdjF1mDqCZVM5FdFx5SnoKW6o6teUWfH5HENBPH1W2JV8A7N9ZwDJwc4CdVoqreYa5Q9vbMACSSv6s5sGHJAvMEMmaVYM/0/*)#0r2fk27m",
  "iswatchonly": false,
  "isscript": false,
  "iswitness": true,
  "witness_version": 0,
  "witness_program": "0e618b326fd0fafdfa78b6be45a1bc5f2b6b17eb",
  "pubkey": "037f1787a245c00d5bdec639bd7e76226677fb2b5ad323e5b48b064ebe39b6ac30",
  "ischange": false,
  "timestamp": 1755113945,
  "hdkeypath": "m/84'/1'/0'/0/3",
  "hdseedid": "0000000000000000000000000000000000000000",
  "hdmasterfingerprint": "4dc85257",
  "labels": [
    "alice"
  ]
}
{
  "address": "tb1q74pnqfwcurnfn632j46y38zxkhkv4knnkjpxu4",
  "scriptPubKey": "0014f5433025d8e0e699ea2a9574489c46b5eccada73",
  "ismine": true,
  "solvable": true,
  "desc": "wpkh([4dc85257/84'/1'/0'/0/4]0255bbae939310b5a2730f9bc3a562f3c2e221ac476c50332956dfe7df8d83ca6f)#ntlm4qc5",
  "parent_desc": "wpkh([4dc85257/84'/1'/0']tpubDDVwr8SXCjyhJnZdjF1mDqCZVM5FdFx5SnoKW6o6teUWfH5HENBPH1W2JV8A7N9ZwDJwc4CdVoqreYa5Q9vbMACSSv6s5sGHJAvMEMmaVYM/0/*)#0r2fk27m",
  "iswatchonly": false,
  "isscript": false,
  "iswitness": true,
  "witness_version": 0,
  "witness_program": "f5433025d8e0e699ea2a9574489c46b5eccada73",
  "pubkey": "0255bbae939310b5a2730f9bc3a562f3c2e221ac476c50332956dfe7df8d83ca6f",
  "ischange": false,
  "timestamp": 1755113945,
  "hdkeypath": "m/84'/1'/0'/0/4",
  "hdseedid": "0000000000000000000000000000000000000000",
  "hdmasterfingerprint": "4dc85257",
  "labels": [
    "bob"
  ]
}
{
  "address": "tb1q0vwn8ljz0ywkymtmjk49zu8pcuvee2htwjhjsa",
  "scriptPubKey": "00147b1d33fe42791d626d7b95aa5170e1c7199caaeb",
  "ismine": true,
  "solvable": true,
  "desc": "wpkh([4dc85257/84'/1'/0'/0/5]024ffc0eb46e86fc577dc75d01995293c8b2d3267e96aa8154b5687538ddbd9273)#qrh083fn",
  "parent_desc": "wpkh([4dc85257/84'/1'/0']tpubDDVwr8SXCjyhJnZdjF1mDqCZVM5FdFx5SnoKW6o6teUWfH5HENBPH1W2JV8A7N9ZwDJwc4CdVoqreYa5Q9vbMACSSv6s5sGHJAvMEMmaVYM/0/*)#0r2fk27m",
  "iswatchonly": false,
  "isscript": false,
  "iswitness": true,
  "witness_version": 0,
  "witness_program": "7b1d33fe42791d626d7b95aa5170e1c7199caaeb",
  "pubkey": "024ffc0eb46e86fc577dc75d01995293c8b2d3267e96aa8154b5687538ddbd9273",
  "ischange": false,
  "timestamp": 1755113945,
  "hdkeypath": "m/84'/1'/0'/0/5",
  "hdseedid": "0000000000000000000000000000000000000000",
  "hdmasterfingerprint": "4dc85257",
  "labels": [
    "charlie"
  ]
}
---------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------

PUBKEY_ALICE          037f1787a245c00d5bdec639bd7e76226677fb2b5ad323e5b48b064ebe39b6ac30
PUBKEY_BOB            0255bbae939310b5a2730f9bc3a562f3c2e221ac476c50332956dfe7df8d83ca6f
PUBKEY_CHARLIE        024ffc0eb46e86fc577dc75d01995293c8b2d3267e96aa8154b5687538ddbd9273

------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------

bitcoin-cli -testnet getdescriptorinfo "wsh(multi(2,037f1787a245c00d5bdec639bd7e76226677fb2b5ad323e5b48b064ebe39b6ac30,0255bbae939310b5a2730f9bc3a562f3c2e221ac476c50332956dfe7df8d83ca6f,024ffc0eb46e86fc577dc75d01995293c8b2d3267e96aa8154b5687538ddbd9273))"

7fb2b5ad323e5b48b064ebe39b6ac30,0255bbae939310b5a2730f9bc3a562f3c2e221ac476c50332956dfe7df8d83ca6f,024ffc0eb46e86fc577dc75d01995293c8b2d3267e96aa8154b5687538ddbd9273))"
{
  "descriptor": "wsh(multi(2,037f1787a245c00d5bdec639bd7e76226677fb2b5ad323e5b48b064ebe39b6ac30,0255bbae939310b5a2730f9bc3a562f3c2e221ac476c50332956dfe7df8d83ca6f,024ffc0eb46e86fc577dc75d01995293c8b2d3267e96aa8154b5687538ddbd9273))#4vxcr2cw",
  "checksum": "4vxcr2cw",
  "isrange": false,
  "issolvable": true,
  "hasprivatekeys": false
}


DESCRIPTOR_MULTISIG     "wsh(multi(2,037f1787a245c00d5bdec639bd7e76226677fb2b5ad323e5b48b064ebe39b6ac30,0255bbae939310b5a2730f9bc3a562f3c2e221ac476c50332956dfe7df8d83ca6f,024ffc0eb46e86fc577dc75d01995293c8b2d3267e96aa8154b5687538ddbd9273))#4vxcr2cw"


bitcoin-cli -testnet createmultisig 2 '["037f1787a245c00d5bdec639bd7e76226677fb2b5ad323e5b48b064ebe39b6ac30","0255bbae939310b5a2730f9bc3a562f3c2e221ac476c50332956dfe7df8d83ca6f","024ffc0eb46e86fc577dc75d01995293c8b2d3267e96aa8154b5687538ddbd9273"]' "bech32"

eduardoveralli@SECITD-12771NZLX:~$ bitcoin-cli -testnet createmultisig 2 '["037f1787a245c00d5bdec639bd7e76226677fb2b5ad323e5b48b064ebe39b6ac30","0255bbae939310b5a2730f9bc3a562f3c2e221ac476c50332956dfe7df8d83ca6f","024ffc0eb46e86fc577dc75d01995293c8b2d3267e96aa8154b5687538ddbd9273"]' "bech32"
{
  "address": "tb1qpucrvpplfeph84xhh3mdy3q2499qlmc0cuv4ewc0gdq68vz7wavs8rzphl",
  "redeemScript": "5221037f1787a245c00d5bdec639bd7e76226677fb2b5ad323e5b48b064ebe39b6ac30210255bbae939310b5a2730f9bc3a562f3c2e221ac476c50332956dfe7df8d83ca6f21024ffc0eb46e86fc577dc75d01995293c8b2d3267e96aa8154b5687538ddbd927353ae",
  "descriptor": "wsh(multi(2,037f1787a245c00d5bdec639bd7e76226677fb2b5ad323e5b48b064ebe39b6ac30,0255bbae939310b5a2730f9bc3a562f3c2e221ac476c50332956dfe7df8d83ca6f,024ffc0eb46e86fc577dc75d01995293c8b2d3267e96aa8154b5687538ddbd9273))#4vxcr2cw"
}

DIRECCION_MULTISIG: tb1qpucrvpplfeph84xhh3mdy3q2499qlmc0cuv4ewc0gdq68vz7wavs8rzphl
REDEEM_SCRIPT: 5221037f1787a245c00d5bdec639bd7e76226677fb2b5ad323e5b48b064ebe39b6ac30210255bbae939310b5a2730f9bc3a562f3c2e221ac476c50332956dfe7df8d83ca6f21024ffc0eb46e86fc577dc75d01995293c8b2d3267e96aa8154b5687538ddbd927353ae
