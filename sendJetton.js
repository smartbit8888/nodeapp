require('dotenv').config();

const {
    TonClient,
    WalletContractV4,
    internal,
    toNano,
    beginCell,
    Address
} = require("@ton/ton");

const {
    mnemonicToPrivateKey
} = require("@ton/crypto");

async function sendJetton(destination) {

    const client = new TonClient({
        endpoint: process.env.RPC
    });

    const mnemonic =
        process.env.MNEMONIC.split(" ");

    const keyPair =
        await mnemonicToPrivateKey(mnemonic);

    const wallet =
        WalletContractV4.create({
            publicKey: keyPair.publicKey,
            workchain: 0
        });

    const walletContract =
        client.open(wallet);

    const jettonWallet =
        Address.parse(process.env.JETTON_WALLET);

    const body = beginCell()
        .storeUint(0xf8a7ea5, 32)
        .storeUint(0, 64)
        .storeCoins(toNano("50"))
        .storeAddress(Address.parse(destination))
        .storeAddress(Address.parse(destination))
        .storeBit(0)
        .storeCoins(toNano("0.02"))
        .storeBit(0)
        .endCell();

    await walletContract.sendTransfer({

        secretKey: keyPair.secretKey,

        seqno: await walletContract.getSeqno(),

        messages: [
            internal({
                to: jettonWallet,
                value: toNano("0.1"),
                bounce: true,
                body
            })
        ]
    });

    console.log("Jetton sent");
}

module.exports = {
    sendJetton
};