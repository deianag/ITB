import React, { useState } from 'react'
import { Contract, parseEther } from 'ethers'

import {
  useSignAndExecuteTransaction,
  useCurrentAccount,
  useSuiClient,
} from '@mysten/dapp-kit';

import EthConnect from './components/EthConnect'
import SuiConnect from './components/SuiConnect'
import BridgeForm from './components/BridgeForm'
import MintITBOnSui from './components/MintIBTOnSui'
import BurnIBTOnSui from './components/BurnIBTOnSui';


const DEFAULT_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"


const ibtAbi = [
  "function mint(address to, uint256 amount) external",
  "function burn(uint256 amount) external",
  "function balanceOf(address owner) view returns (uint256)"
]

function App() {
  const [ethProvider, setEthProvider] = useState(null)
  const [ethAccount, setEthAccount] = useState('')
  const [contractAddress, setContractAddress] = useState(DEFAULT_CONTRACT_ADDRESS)
  const [amount, setAmount] = useState('')
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const currentSuiAccount = useCurrentAccount();
  const suiClient = useSuiClient();

  async function handleMint() {
    try {
      if (!ethProvider) {
        alert("No Ethereum provider found. Please connect MetaMask first!")
        return
      }
      // Get signer from the already-connected provider
      const signer = await ethProvider.getSigner()
      const contract = new Contract(contractAddress, ibtAbi, signer)

      const tx = await contract.mint(ethAccount, parseEther(amount))
      await tx.wait()
      alert(`Successfully minted ${amount} IBT to ${ethAccount}`)
    } catch (err) {
      console.error("Mint error:", err)
      alert(`Mint error: ${err.message}`)
    }
  }

  async function handleBurn() {
    try {
      if (!ethProvider) {
        alert("No Ethereum provider found. Please connect MetaMask first!")
        return
      }
      const signer = await ethProvider.getSigner()
      const contract = new Contract(contractAddress, ibtAbi, signer)

      const tx = await contract.burn(parseEther(amount))
      await tx.wait()
      alert(`Successfully burned ${amount} IBT from ${ethAccount}`)
    } catch (err) {
      console.error("Burn error:", err)
      alert(`Burn error: ${err.message}`)
    }
  }
  async function handleCheckIbtObjects() {
    try {
      if (!currentSuiAccount) {
        alert('No Sui wallet connected!');
        return;
      }
  
      // 1. Replace this with the actual IBT type you have on Sui.
      //    Example: "0x123456::ibt::IBT" or "0x<PackageID>::<ModuleName>::<CoinStructName>"
      const IBT_TYPE = "0xYourPackageID::IBTModule::IBT";
  
      // 2. Query owned objects that match your IBT type
      const result = await suiClient.getOwnedObjects({
        owner: currentSuiAccount.address,
        filter: {
          StructType: "0x2::coin::Coin<0x12ebb15156ee7d5f9f5870e37a83add6ee536b8a2d7b0df6d826192971028515::IBT::IBT>"
        },
        options: {
          showType: true,
          showContent: true,
          showOwner: true,
        },
      });
  
      // 3. result.data is an array of objects matching the filter
      const ibtObjectsInfo = result.data.map((obj) => {
        const { objectId, type, content } = obj.data;
      
        // Defensive check:
        if (!content || content.dataType !== 'moveObject') {
          return { objectId, type, balance: 'Not a move object', owner: obj.data.owner };
        }
      
        // For coin objects, the balance is usually at `content.fields.balance`
        const balance = content.fields.balance;
      
        return {
          objectId,
          type,
          balance,
          owner: obj.data.owner,
        };
      });
  
      // 5. Display them however you like; for simplicity, an alert or console:
      alert(`Found ${ibtObjectsInfo.length} IBT objects. See console for details.`);
      // or do something more user-friendly in the UI
      console.log("Formatted IBT Objects:", ibtObjectsInfo);
      
    } catch (err) {
      console.error('Error checking IBT objects:', err);
      alert('Error checking IBT objects: ' + err.message);
    }
  }
  
  async function handleCheckSuiBalances() {
    try {
      if (!currentSuiAccount) {
        alert('Nu există un wallet Sui conectat! Conectează-l mai întâi.');
        return;
      }
      const balances = await suiClient.getAllBalances({
        owner: currentSuiAccount.address,
      });
      console.log('Balanțe Sui:', balances);
      alert('Balanțe:\n' + JSON.stringify(balances, null, 2));
    } catch (err) {
      console.error('Eroare la getAllBalances:', err);
      alert('Nu am putut obține balanțele. Vezi consola.');
    }
  }
  return (
    <div style={{ margin: '1rem' }}>
      <h1>My IBT Bridge DApp</h1>

      {/* 1) Connect to Ethereum */}
      <EthConnect
        onProviderChange={setEthProvider}
        onAccountChange={setEthAccount}
      />

      {/* 2) Connect to Sui */}
      <SuiConnect />

      <div style={{ marginTop: '1rem' }}>
        <label>Contract address:</label>
        <input
          style={{ width: 400, marginLeft: '0.5rem' }}
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
        />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label>Amount:</label>
        <input
          style={{ width: 100, marginLeft: '0.5rem' }}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div style={{ marginTop: '1rem' }}>
        {/* Mint / Burn ETH Buttons */}
        <button onClick={handleMint} style={{ marginRight: '1rem' }}>
          Mint (ETH)
        </button>
        <button onClick={handleBurn}>
          Burn (ETH)
        </button>
      </div>

      <hr style={{ margin: '2rem 0' }} />
      <BridgeForm ethProvider={ethProvider} ethAccount={ethAccount} />
      <MintITBOnSui/>
      
      <button onClick={handleCheckSuiBalances}>
          Check Sui Balances
      </button>
      <button onClick={handleCheckIbtObjects}>
      Check IBT Objects
    </button>
    <BurnIBTOnSui/>
    </div>

    
  )
}

export default App
