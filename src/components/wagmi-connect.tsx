import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import {
  createClient,
  WagmiConfig,
  useAccount,
  useConnect,
  useDisconnect,
  useProvider,
  Chain,
  configureChains,
  chain,
} from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";
import { config } from "../config";
import { Container } from "./container";
import { DemoCard } from "./demo-card";

const { chains, provider } = configureChains(
  [
    chain.mainnet,
    chain.goerli,
    chain.polygon,
    chain.polygonMumbai,
    chain.optimism,
    chain.arbitrum,
    {
      id: 534354,
      name: "Scroll L2 Testnet",
      testnet: true,
      network: "scrolll2testnet",
      rpcUrls: {
        public: config.SCROLL_L2_URL,
        default: config.SCROLL_L2_URL,
      },
    },
  ],
  [
    publicProvider(),
    jsonRpcProvider({
      rpc: (curChain: Chain) => {
        if (curChain.id === Number.parseInt(config.SCROLL_L2_CHAINID, 16)) {
          return { http: config.SCROLL_L2_URL };
        }
        return { http: chain.goerli.rpcUrls[0] };
      },
    }),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "example-connect",
  chains,
});

const client = createClient({
  autoConnect: true,
  connectors: [...connectors()],
  provider,
});
const WagmiContent = () => {
  const [latestBlock, setLatestBlock] = useState<number>(0);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    chainId: Number.parseInt(config.SCROLL_L2_CHAINID, 16),
    connector: new InjectedConnector({
    }),
  });
  const { disconnect } = useDisconnect();
  const provider = useProvider()

  useEffect(() => {
    const asyncFn = async () => {
      if (isConnected) {
        const blockNumber = await provider.getBlockNumber();
        setLatestBlock(blockNumber);
      }
    };
    asyncFn();
  }, [isConnected, provider]);

  return (
    <Container>
      <DemoCard
        title="Wagmi"
        address={address as string}
        connect={connect}
        disconnect={disconnect}
        latestBlock={latestBlock}
      />
    </Container>
  );
};

export const WagmiConnect = () => {
  return (
    <WagmiConfig client={client}>
      <WagmiContent />
    </WagmiConfig>
  );
};
