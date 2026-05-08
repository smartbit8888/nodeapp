require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const { sendJetton } = require('./sendJetton');

const app = express();

app.use(cors());
app.use(express.json());

const payments = {};

app.post('/verify-payment', async (req, res) => {

    const { userAddress } = req.body;

    try {

        const response = await axios.get(
            `https://toncenter.com/api/v2/getTransactions`,
            {
                params: {
                    address: process.env.SELLER_ADDRESS,
                    limit: 10
                }
            }
        );

        const txs = response.data.result;

        for (const tx of txs) {

            const source =
                tx.in_msg?.source || "";

            const value =
                Number(tx.in_msg?.value || 0);

            if (
                source === userAddress &&
                value >= 500000000
            ) {

                if (!payments[userAddress]) {

                    payments[userAddress] = true;

                    await sendJetton(userAddress);

                    return res.json({
                        success: true,
                        message: "Jetton sent"
                    });
                }
            }
        }

        res.json({
            success: false
        });

    } catch(err) {

        console.log(err);

        res.status(500).json({
            error: err.message
        });
    }
});

app.use(express.static(__dirname));

app.listen(3000, () => {
    console.log('Server running');
});