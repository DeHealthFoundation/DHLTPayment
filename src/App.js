/* global BigInt */

import React, { useState, useEffect } from "react";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";
import { useWeb3ModalAccount } from "@web3modal/ethers/react";
import { useWeb3ModalProvider } from "@web3modal/ethers/react";
import { ethers, BrowserProvider } from "ethers";

import Modal from "./Modal";
import Web3 from "web3";

const DHLTAddress = "0xb148DF3C114B1233b206160A0f2A74999Bb2FBf3";
const projectId = "f8fca58b76c6a2cfb993e33ab0bde5f0";

const mainnet = {
  chainId: 56,
  name: "BNB Smart Chain",
  currency: "BNB",
  explorerUrl: "https://bscscan.com/",
  rpcUrl: "https://bsc-dataseed.binance.org/",
};

const metadata = {
  name: "DHLT Payment",
  description: "Accept payments in DHLT token",
  url: "http://localhost:3000",
  icons: [
    "https://dehealth.app/wp-content/uploads/2024/05/Logo_main_white.svg",
  ],
};

const ethersConfig = defaultConfig({
  metadata,
});

const tokenABI = require("./abi.json");

function App() {
  const [balance, setBalance] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [recipientAddress, setRecipientAddress] = useState(
    "0xB5F112bb88E8f7A58c97c32763c4CEc90f74B83b" // Default address. Should be changed in production
  );

  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  const openModal = (message) => {
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage("");
  };

  const handleRecipientChange = (event) => {
    setRecipientAddress(event.target.value);
  };

  createWeb3Modal({
    ethersConfig,
    chains: [mainnet],
    projectId,
    enableAnalytics: true,
    themeMode: "light",
  });

  // When account has been changed, we request current address balance for DHLT
  useEffect(() => {
    const fetchBalance = async () => {
      if (address) {
        const web3 = new Web3(
          "https://go.getblock.io/ef2dc26648204a4b949f3a3d5d2d4862"
        );

        const contract = new web3.eth.Contract(tokenABI, DHLTAddress);
        console.log("Get address", address);
        const balance = await contract.methods.balanceOf(address).call();

        if (balance) {
          const balanceString = (Number(balance) / 10 ** 18).toFixed(8); // Assuming 18 decimal places
          console.log("Balance:", balanceString);
          setBalance(balanceString);
        } else {
          console.log("Balance is null or undefined");
        }
      } else {
        setBalance("");
      }
    };

    fetchBalance();
  }, [address]);

  // Send transaction to address from the field
  const send = async () => {
    const provider = new BrowserProvider(walletProvider);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(DHLTAddress, tokenABI, signer);

    const senderAddress = await signer.getAddress();

    const decimalPlaces = 18;
    const amountInDHLT = 1;
    const amountInWei = ethers.parseUnits(
      amountInDHLT.toString(),
      decimalPlaces
    );

    try {
      const tx = await contract.transfer(recipientAddress, amountInWei);
      openModal("Transaction successful. Hash: " + tx.hash);
      console.log("Transaction hash:", tx.hash);
    } catch (error) {
      if (error.code === 4001) {
        openModal("Transaction rejected by user");
      } else {
        openModal("Error occurred: " + error.message);
      }
      console.log("Error: ", error.message);
    }
  };

  return (
    <div>
      <w3m-button />
      {address && (
        <div style={{ justifyContent: "center" }}>
          <p>Connected: {address}</p>
          <p>DHLT Balance: {balance}</p>
          <label htmlFor="recipient">Recipient Address:</label>
          <input
            type="text"
            id="recipient"
            value={recipientAddress}
            onChange={handleRecipientChange}
          />
          <button
            onClick={send}
            style={{ display: "block", width: "100%", marginTop: "10px" }}
          >
            Pay 1 DHLT
          </button>
        </div>
      )}
      <Modal
        isOpen={isModalOpen}
        closeModal={closeModal}
        message={modalMessage}
      />
    </div>
  );
}

export default App;
