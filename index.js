import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer } from '@solana/spl-token';

(async () => {
    // Step 1: Connect to cluster and generate a new Keypair
    
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    // Get Keypair from Secret Key
    var fromWallet = Keypair.generate();

    // Generate another Keypair (account we'll be sending to)
    const toWallet = Keypair.generate();

    // Step 2: Airdrop 2 SOL into your from wallet
    console.log("Airdopping some SOL to Sender wallet!");
    
    const fromAirDropSignature = await connection.requestAirdrop(fromWallet.publicKey, 2 * LAMPORTS_PER_SOL);

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction(fromAirDropSignature, { commitment: "confirmed"});

    console.log("Airdrop completed for the Sender account");
    
    
    // Step 3: Create new token mint and get the token account of the fromWallet address
    //If the token account does not exist, create it
    const mint = await createMint(connection,fromWallet,fromWallet.publicKey,null,9);
    
    const fromTokenAcct = getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        mint,
        fromWallet.publicKey
    );
    
    //Step 4: Mint a new token to the from account
    let signature = mintTo(
        connection,
        fromWallet,
        mint,
        (await fromTokenAcct).address,
        fromWallet.publicKey,
        1000000000,
        []
    );
    console.log("Mint tx", signature);

    //Step 5: Get the token account of the to-wallet address and if it does not exist, create it
    const toTokenAcct = getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        mint,
        toWallet.publicKey
    );

    //Step 6: Transfer the new token to the to-wallet's token account that was just created
    // Transfer the new token to the "toTokenAccount" we just created

    signature = await transfer(
        connection,
        fromWallet,
        (await fromTokenAcct).address,
        (await toTokenAcct).address,
        fromWallet.publicKey,
        1000000000,
        []
    );
    console.log("Transfer tx", signature);
 
})();