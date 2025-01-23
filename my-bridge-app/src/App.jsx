import React, { useState } from 'react'
import { Contract, parseEther } from 'ethers'

import EthConnect from './components/EthConnect'
import SuiConnect from './components/SuiConnect'
import BridgeForm from './components/BridgeForm'
import MintITBOnSui from './components/MintIBTOnSui'


const DEFAULT_CONTRACT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"


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
    </div>

    
  )
}

export default App
