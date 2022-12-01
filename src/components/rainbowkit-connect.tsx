import { useEffect, useState } from "react";
import {
  WagmiConfig,
  useAccount,
  Chain,
  configureChains,
  chain,
  createClient,
  useProvider,
} from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import {
  darkTheme,
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { DemoCardRainbowKit } from "./demo-card-rainbowkit";
import { Container } from "./container";

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
        public: "https://prealpha.scroll.io/l2",
        default: "https://prealpha.scroll.io/l2",
      },
    },
  ],
  [
    publicProvider(),
    jsonRpcProvider({
      rpc: (curChain: Chain) => {
        if (curChain.id === 534354) {
          return { http: "https://prealpha.scroll.io/l2" };
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

const RainbowKitContent = () => {
  const [latestBlock, setLatestBlock] = useState<number>(0);
  const { address, isConnected } = useAccount();
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
    <DemoCardRainbowKit
      title="RainbowKit Connect"
      address={address as string}
      latestBlock={latestBlock}
    />
  );
};

export const RainbowkitConnect = () => {
  return (
    <Container>
      <WagmiConfig client={client}>
        <RainbowKitProvider
          chains={chains}
          theme={darkTheme({
            ...darkTheme.accentColors.blue,
          })}
          coolMode
        >
          <RainbowKitContent />
        </RainbowKitProvider>
      </WagmiConfig>
    </Container>
  );
};
