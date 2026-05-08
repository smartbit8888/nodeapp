require('dotenv').config();

const {
    TonClient,
    WalletContractV4,
    internal,
    toNano,
    beginCell,
    Address
} = require("@ton/ton");

const { mnemonicToPrivateKey } = require("@ton/crypto");

async function sendJetton(destination) {

    const client = new TonClient({
        endpoint: process.env.RPC
    });

    const mnemonic = process.env.MNEMONIC.split(" ");

    const keyPair = await mnemonicToPrivateKey(mnemonic);

    const wallet = WalletContractV4.create({
        publicKey: keyPair.publicKey,
        workchain: 0
    });

    const walletContract = client.open(wallet);

    const jettonWallet = Address.parse(process.env.JETTON_WALLET);

    // Jetton transfer payload (standard format)
    const body = beginCell()
        .storeUint(0xf8a7ea5, 32) // jetton transfer op
        .storeUint(0, 64) // query id
        .storeCoins(toNano("50")) // jetton amount
        .storeAddress(Address.parse(destination)) // receiver
        .storeAddress(Address.parse(destination)) // response destination
        .storeBit(0) // no custom payload
        .storeCoins(toNano("0.02")) // forward TON
        .storeBit(0)
        .endCell();

    const seqno = await walletContract.getSeqno();

    if (seqno === null) {
        throw new Error("Wallet not initialized or seqno is null");
    }

    await walletContract.sendTransfer({
        secretKey: keyPair.secretKey,
        seqno,
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

module.exports = { sendJetton };