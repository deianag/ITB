import React, { useState } from 'react';
import {
  ConnectButton,
  useSuiClient,
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

const PKG_ID = "0x12ebb15156ee7d5f9f5870e37a83add6ee536b8a2d7b0df6d826192971028515";
const TREASURY_CAP_ID = "0x5a0c6cf32837e1c8b4b1d0faecc5d9819ca9074753a6145a6af928c58a60f979"; // Replace with your actual treasury cap ID
const ADDRESS = "0xbd016088dfbc95b3145ddb59f506bfdc6593d3c1ab047f7712b8763bd6fb6e81";

function MintIBTOnSui() {
  const client = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showRawEffects: true,
          showObjectChanges: true,
        },
      }),
  });
  const [digest, setDigest] = useState('');
  const [amount, setAmount] = useState(''); // State for user input
  const currentAccount = useCurrentAccount();

  const handleMint = async () => {
    try {
      const tx = new Transaction();

      tx.moveCall({
        arguments: [
          tx.object(TREASURY_CAP_ID),
          tx.pure.u64(BigInt(amount)), // Use the user input amount
          tx.object(ADDRESS)
        ],
        target: `${PKG_ID}::IBT::mint`,
      });

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });
      setDigest(result.digest);
    } catch (error) {
      console.error("Error minting IBT:", error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <ConnectButton />
      {currentAccount && (
        <>
          <div>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button onClick={handleMint}>Sign and execute transaction</button>
          </div>
          <div>Digest: {digest}</div>
        </>
      )}
    </div>
  );
}

export default MintIBTOnSui;
