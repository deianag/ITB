import React from 'react';
import { ConnectButton } from '@mysten/dapp-kit';
import './SuiConnect.css';

function SuiConnect() {
  return (
    <div className="sui-connect-container">
      <ConnectButton className="sui-connect-button" />
    </div>
  );
}

export default SuiConnect;
