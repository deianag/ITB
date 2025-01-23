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

function BurnIBTOnSui() {
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
  const [burnAmount, setBurnAmount] = useState(''); // State for user input
  const currentAccount = useCurrentAccount();

  const handleBurn = async () => {
    try {
      if (!currentAccount) {
        alert('No Sui wallet connected!');
        return;
      }
  
      const IBT_TYPE = "0x2::coin::Coin<0x12ebb15156ee7d5f9f5870e37a83add6ee536b8a2d7b0df6d826192971028515::IBT::IBT>";
      const { data: ibtObjects } = await client.getOwnedObjects({
        owner: currentAccount.address,
        filter: { StructType: IBT_TYPE },
        options: { showType: true, showContent: true, showOwner: true },
      });
  
      let totalBalance = 0n;
      const objectsToMerge = [];
      let selectedObjectId;
      for (const obj of ibtObjects) {
        const { content } = obj.data;
        if (content && content.dataType === 'moveObject') {
          const balance = BigInt(content.fields.balance);
          totalBalance += balance;
          objectsToMerge.push(obj.data.objectId); // Add all coins to the list
          if (balance >= BigInt(burnAmount)) {
            selectedObjectId = obj.data.objectId;
            break; // Stop if we find a single coin with enough balance
          }
        }
      }
  
      if (totalBalance < BigInt(burnAmount)) {
        alert('Not enough balance to burn the specified amount.');
        return;
      }
  
      const tx = new Transaction();
  
      if (objectsToMerge.length > 1) {
        // Merge all coins into the first one
        tx.mergeCoins(objectsToMerge[0], objectsToMerge.slice(1));
        selectedObjectId = objectsToMerge[0];
      }
  
      const [burnCoin] = tx.splitCoins(
        selectedObjectId,
        [tx.pure.u64(BigInt(burnAmount))]
      );
  
      tx.moveCall({
        arguments: [
          tx.object(TREASURY_CAP_ID),
          burnCoin,
        ],
        target: `${PKG_ID}::IBT::burn`,
      });
  
      const result = await signAndExecuteTransaction({
        transaction: tx,
      });
  
      setDigest(result.digest); // Store the transaction digest
    } catch (error) {
      console.error("Error burning IBT:", error);
      alert('Error burning IBT: ' + error.message);
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
              placeholder="Enter burn amount"
              value={burnAmount}
              onChange={(e) => setBurnAmount(e.target.value)}
            />
            <button onClick={handleBurn}>Sign and execute burn transaction</button>
          </div>
          <div>Digest: {digest}</div>
        </>
      )}
    </div>
  );
}

export default BurnIBTOnSui;
