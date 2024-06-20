import React, { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";
import { useWeb3ModalAccount } from "@web3modal/ethers/react";
import { useWeb3ModalProvider } from "@web3modal/ethers/react";
import { ethers, BrowserProvider } from "ethers";
import Modal from "./Modal";
import Web3 from "web3";
import { ErrorDecoder } from "ethers-decode-error";

const errorDecoder = ErrorDecoder.create();
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

const GlobalStyle = createGlobalStyle`
  body {
    font-family: "Poppins", Sans-serif;
    background-image: linear-gradient(180deg, #5e42ec 0%, #3925b0 100%);
    color: white;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
`;

const Wrapper = styled.div`
  background-color: white;
  padding: 10px;
  border-radius: 25px;
  display: inline-flex;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const WalletView = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 25px;
  background-color: #f1f1f1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const BalanceText = styled.p`
  font-size: 16px;
  margin: 0;
  margin-left: 10px;
`;

const AddressText = styled.p`
  font-size: 14px;
  margin: 0;
  margin-left: 10px;
  color: #777;
`;

const PreOrderButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  font-family: "Poppins", sans-serif;
  color: #3925b0;
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 25px;
  padding: 10px 20px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease;
  margin-top: 10px;

  &:hover {
    background-color: #3925b0;
    color: #fff;
  }

  .icon {
    margin-left: 10px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: #3925b0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-image: url("https://dhlt.app/wp-content/uploads/2024/06/Frame-1321315642.svg");
    background-size: 24px 24px;
    background-repeat: no-repeat;
    background-position: center;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const Block = styled.div`
  margin-bottom: 20px;
`;

function App() {
  const [balance, setBalance] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState(
    "0x29Ecf44CbbD54De694efDFAB19e343c9E1B3C82D"
  );

  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

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

  useEffect(() => {
    const fetchBalance = async () => {
      if (address) {
        const web3 = new Web3(
          "https://go.getblock.io/ef2dc26648204a4b949f3a3d5d2d4862"
        );

        const contract = new web3.eth.Contract(tokenABI, DHLTAddress);
        const balance = await contract.methods.balanceOf(address).call();

        if (balance) {
          const balanceString = (Number(balance) / 10 ** 18).toFixed(8);
          setBalance(balanceString);
        } else {
          setBalance("0 (Click to get DHLT)");
        }
      } else {
        setBalance("");
      }
    };
    setModalMessage("");
    fetchBalance();
  }, [address]);

  const send5000 = async () => {
    const provider = new BrowserProvider(walletProvider);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(DHLTAddress, tokenABI, signer);

    const senderAddress = await signer.getAddress();

    const decimalPlaces = 18;
    const amountInDHLT = 5000;
    const amountInWei = ethers.parseUnits(
      amountInDHLT.toString(),
      decimalPlaces
    );

    try {
      const tx = await contract.transfer(recipientAddress, amountInWei);
      setSuccess(true);
    } catch (error) {
      if (error.code === 4001) {
        setModalMessage("Transaction rejected by user");
      } else {
        const decodedError = await errorDecoder.decode(error);
        setModalMessage("Error: " + error.reason);
      }
    }
  };

  const send50000 = async () => {
    const provider = new BrowserProvider(walletProvider);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(DHLTAddress, tokenABI, signer);
    const senderAddress = await signer.getAddress();
    const decimalPlaces = 18;
    const amountInDHLT = 50000;
    const amountInWei = ethers.parseUnits(
      amountInDHLT.toString(),
      decimalPlaces
    );

    try {
      const tx = await contract.transfer(recipientAddress, amountInWei);
      setSuccess(true);
    } catch (error) {
      if (error.code === 4001) {
        setModalMessage("Transaction rejected by user");
      } else {
        const decodedError = await errorDecoder.decode(error);
        setModalMessage("Error: " + error.reason);
      }
    }
  };

  const openPancakeSwap = async () => {
    window.open(
      "https://pancakeswap.finance/swap?inputCurrency=BNB&outputCurrency=0xb148DF3C114B1233b206160A0f2A74999Bb2FBf3"
    );
  };

  return (
    <>
      <GlobalStyle />
      <Content>
        <Wrapper>
          <w3m-button />
        </Wrapper>
        {address && (
          <>
            <PreOrderButton onClick={openPancakeSwap}>
              <b>DHLT Balance </b> : {balance}
              <div className="icon"></div>
            </PreOrderButton>
            <Block />
            <h3>DeHealth Early Bird Rate</h3>

            <PreOrderButton onClick={send5000}>
              Pay 5000 DHLT
              <div className="icon"></div>
            </PreOrderButton>

            <Block />

            <h3>Annual Pricing</h3>
            <PreOrderButton onClick={send50000}>
              Pay 50000 DHLT
              <div className="icon"></div>
            </PreOrderButton>

            <Block />
            {modalMessage && <PreOrderButton>{modalMessage}</PreOrderButton>}

            {success === true && (
              <PreOrderButton>
                <p>
                  <b>Welcome to a Healthier Future! 👋</b>
                  <br />
                  <br />
                  Thank you for subscribing early to DeHealth, the world’s first
                  health super app. <br />
                  You’ve taken the first step toward better health management,
                  <br />
                  and we couldn’t be more excited to have you with us on this
                  journey.
                  <br />
                  <br />
                  <b>Follow us on social networks.</b>
                </p>
              </PreOrderButton>
            )}
          </>
        )}
      </Content>
    </>
  );
}

export default App;
