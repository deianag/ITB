import React, { useState } from 'react';
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';

const PKG_ID = "0x12ebb15156ee7d5f9f5870e37a83add6ee536b8a2d7b0df6d826192971028515";
const ADMIN_CAP_ID = "0x5a0c6cf32837e1c8b4b1d0faecc5d9819ca9074753a6145a6af928c58a60f979";
const DECIMALS = 9n;

function MintIBTOnSui() {
  const [mintAmount, setMintAmount] = useState('');
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();

  async function handleMint() {
    if (!mintAmount) {
      alert('Please enter an amount to mint!');
      return;
    }
    if (!currentAccount?.address) {
      alert('No Sui wallet connected. Please connect your Sui wallet first.');
      return;
    }

    try {
      const baseUnits = BigInt(mintAmount) * (10n ** DECIMALS);
      console.log(`[Sui Mint] Attempting to mint ${mintAmount} IBT (base units: ${baseUnits})...`);

      const result = await signAndExecuteTransaction(
        {
          packageObjectId: PKG_ID,
          module: 'IBT',
          function: 'mint',
          typeArguments: [],
          arguments: [
            ADMIN_CAP_ID,
            baseUnits.toString(),
            currentAccount.address,
          ],
          gasBudget: 20_000_000,
        },
        'moveCall'
      );

      console.log('[Sui Mint] Full transaction result:', result);
      alert(`Successfully minted ${mintAmount} IBT to Sui address: ${currentAccount.address}`);
    } catch (err) {
      console.error('[Sui Mint] Transaction failed:', err);
      alert(`Mint on Sui failed: ${err?.message}`);
    }
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Mint IBT on Sui</h2>
      <p>Connected Sui Wallet: {currentAccount?.address ?? '(not connected)'} </p>
      <div style={{ marginTop: '1rem' }}>
        <label>Amount to Mint:</label>
        <input
          type="number"
          value={mintAmount}
          onChange={(e) => setMintAmount(e.target.value)}
          style={{ marginLeft: '0.5rem' }}
        />
      </div>
      <button onClick={handleMint} style={{ marginTop: '1rem' }}>
        Mint on Sui
      </button>
    </div>
  );
}

export default MintIBTOnSui;
