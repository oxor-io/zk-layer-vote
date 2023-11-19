import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";
import {
  sepolia,
  scrollSepolia,
  xdcTestnet,
  arbitrumSepolia,
  polygonZkEvmTestnet,
  gnosis,
  celoAlfajores,
  baseGoerli,
  lineaTestnet,
} from "wagmi/chains";

const chains = [
  sepolia,
  scrollSepolia,
  xdcTestnet,
  arbitrumSepolia,
  polygonZkEvmTestnet,
  gnosis,
  celoAlfajores,
  baseGoerli,
  lineaTestnet,
];

// 1. Get projectID at https://cloud.walletconnect.com

const projectId = process.env.REACT_APP_PROJECT_ID || "";

const metadata = {
  name: "Hakaton Project",
  description: "hakatorn Project with Web3 Modal",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

export const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({ wagmiConfig, projectId, chains });
