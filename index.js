// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

//Making a keypair and getting the private Key
/* const newPair = Keypair.generate();
console.log(newPair)

Keypair {
    _keypair: {
      publicKey: Uint8Array(32) [
        151, 122, 146,  44, 156,  68,  32, 190,
        162, 247, 123, 241, 253,  60,  23, 185,
        159, 165,  25, 240, 115, 169,  27, 205,
        138, 168,  79, 113,  71, 123, 128,   3
      ],
      secretKey: Uint8Array(64) [
        200,  93,  35, 207, 153, 129, 144,  49, 208, 217, 158,
         54, 254, 228,  22,  60, 221,  20, 230, 175, 149,   5,
        113,  15,  70, 187, 227,  33, 222,  32,  77, 190, 151,
        122, 146,  44, 156,  68,  32, 190, 162, 247, 123, 241,
        253,  60,  23, 185, 159, 165,  25, 240, 115, 169,  27,
        205, 138, 168,  79, 113,  71, 123, 128,   3
      ]
    }
  } */

/* const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
        160, 20, 189, 212, 129, 188, 171, 124, 20, 179, 80,
        27, 166, 17, 179, 198, 234, 36, 113, 87, 0, 46,
        186, 250, 152, 137, 244, 15, 86, 127, 77, 97, 170,
        44, 57, 126, 115, 253, 11, 60, 90, 36, 135, 177,
        185, 231, 46, 155, 62, 164, 128, 225, 101, 79, 69,
        101, 154, 24, 58, 214, 219, 238, 149, 86
    ]
); */

const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
        200, 93, 35, 207, 153, 129, 144, 49, 208, 217, 158,
        54, 254, 228, 22, 60, 221, 20, 230, 175, 149, 5,
        113, 15, 70, 187, 227, 33, 222, 32, 77, 190, 151,
        122, 146, 44, 156, 68, 32, 190, 162, 247, 123, 241,
        253, 60, 23, 185, 159, 165, 25, 240, 115, 169, 27,
        205, 138, 168, 79, 113, 71, 123, 128, 3
    ]
);

const transferSol = async () => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get Keypair from Secret Key
    var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

    // Other things to try: 
    // 1) Form array from userSecretKey
    // const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
    // 2) Make a new Keypair (starts with 0 SOL)
    // const from = Keypair.generate();

    // Generate another Keypair (account we'll be sending to)
    const to = Keypair.generate();


    // Get Sender Balance and Print off the initial balance
    const getWalletBalance = async (publicAddress) => {
        try {
            const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
            const myWallet = new PublicKey(publicAddress);
            const walletBalance = await connection.getBalance(
                myWallet
            );
            return walletBalance;

        } catch (error) {
            console.error(error);
        }
    }
    console.log("Sender. Before Airdrop: ", await getWalletBalance(from.publicKey));
    console.log("Receiver. Before Airdrop: ", await getWalletBalance(to.publicKey));

    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");

    console.log("Sender. After Airdrop: ", await getWalletBalance(from.publicKey));
    console.log("Receiver. After Airdrop: ", await getWalletBalance(to.publicKey));

    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: LAMPORTS_PER_SOL / 100
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );

    console.log('from.Pubkey address is', from.publicKey);
    console.log('to.Pubkey address is', to.publicKey);

    console.log('Signature is ', signature);
}

transferSol();
