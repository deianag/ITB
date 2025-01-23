import React, { useState } from 'react';
import { Contract, parseEther } from 'ethers';

import {
  useSignAndExecuteTransaction,
  useCurrentAccount,
  useSuiClient,
} from '@mysten/dapp-kit';

import EthConnect from './components/EthConnect/EthConnect';
import SuiConnect from './components/SuiConnect/SuiConnect';
import BridgeForm from './components/BridgeForm/BridgeForm';
import MintITBOnSui from './components/MintIBTOnSui/MintIBTOnSui';
import BurnIBTOnSui from './components/BurnIBTOnSui/BurnIBTOnSui';

import './App.css';

const DEFAULT_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const ibtAbi = [
  'function mint(address to, uint256 amount) external',
  'function burn(uint256 amount) external',
  'function balanceOf(address owner) view returns (uint256)',
];

function App() {
  const [ethProvider, setEthProvider] = useState(null);
  const [ethAccount, setEthAccount] = useState('');
  const [contractAddress, setContractAddress] = useState(DEFAULT_CONTRACT_ADDRESS);
  const [amount, setAmount] = useState('');
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const currentSuiAccount = useCurrentAccount();
  const suiClient = useSuiClient();

  async function handleMint() {
    try {
      if (!ethProvider) {
        alert('No Ethereum provider found. Please connect MetaMask first!');
        return;
      }
      const signer = await ethProvider.getSigner();
      const contract = new Contract(contractAddress, ibtAbi, signer);

      const tx = await contract.mint(ethAccount, parseEther(amount));
      await tx.wait();
      alert(`Successfully minted ${amount} IBT to ${ethAccount}`);
    } catch (err) {
      console.error('Mint error:', err);
      alert(`Mint error: ${err.message}`);
    }
  }

  async function handleBurn() {
    try {
      if (!ethProvider) {
        alert('No Ethereum provider found. Please connect MetaMask first!');
        return;
      }
      const signer = await ethProvider.getSigner();
      const contract = new Contract(contractAddress, ibtAbi, signer);

      const tx = await contract.burn(parseEther(amount));
      await tx.wait();
      alert(`Successfully burned ${amount} IBT from ${ethAccount}`);
    } catch (err) {
      console.error('Burn error:', err);
      alert(`Burn error: ${err.message}`);
    }
  }

  async function handleCheckIbtObjects() {
    try {
      if (!currentSuiAccount) {
        alert('No Sui wallet connected!');
        return;
      }
      const result = await suiClient.getOwnedObjects({
        owner: currentSuiAccount.address,
        filter: {
          StructType:
            '0x2::coin::Coin<0x12ebb15156ee7d5f9f5870e37a83add6ee536b8a2d7b0df6d826192971028515::IBT::IBT>',
        },
        options: {
          showType: true,
          showContent: true,
          showOwner: true,
        },
      });
      const ibtObjectsInfo = result.data.map((obj) => {
        const { objectId, type, content } = obj.data;
        if (!content || content.dataType !== 'moveObject') {
          return { objectId, type, balance: 'Not a move object', owner: obj.data.owner };
        }
        const balance = content.fields.balance;
        return {
          objectId,
          type,
          balance,
          owner: obj.data.owner,
        };
      });
      alert(`Found ${ibtObjectsInfo.length} IBT objects. See console for details.`);
      console.log('Formatted IBT Objects:', ibtObjectsInfo);
    } catch (err) {
      console.error('Error checking IBT objects:', err);
      alert('Error checking IBT objects: ' + err.message);
    }
  }

  async function handleCheckSuiBalances() {
    try {
      if (!currentSuiAccount) {
        alert('No Sui wallet connected! Connect it first.');
        return;
      }
      const balances = await suiClient.getAllBalances({
        owner: currentSuiAccount.address,
      });
      console.log('Sui Balances:', balances);
      alert('Balances:\n' + JSON.stringify(balances, null, 2));
    } catch (err) {
      console.error('Error at getAllBalances:', err);
      alert('Could not get balances. See console.');
    }
  }

  return (
    <div className="app-container">
      <h1 className="app-title">My IBT Bridge DApp</h1>
      {/* 1) Connect to Ethereum */}
      <EthConnect onProviderChange={setEthProvider} onAccountChange={setEthAccount} />

      {/* 2) Connect to Sui */}
      <SuiConnect />

      <div className="input-row">
        <label>Contract address:</label>
        <input
          className="input-field"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
        />
      </div>

      <div className="input-row">
        <label>Amount:</label>
        <input
          className="input-field"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="button-row">
        <button className="action-button" onClick={handleMint}>
          Mint (ETH)
        </button>
        <button className="action-button" onClick={handleBurn}>
          Burn (ETH)
        </button>
      </div>

      <hr className="section-divider" />
      <BridgeForm ethProvider={ethProvider} ethAccount={ethAccount} />
      <MintITBOnSui />
      <BurnIBTOnSui />
      <div className="check-buttons">
        <button className="action-button" onClick={handleCheckSuiBalances}>
          Check Sui Balances
        </button>
        <button className="action-button" onClick={handleCheckIbtObjects}>
          Check IBT Objects
        </button>
      </div>
    </div>
  );
}

export default App;
