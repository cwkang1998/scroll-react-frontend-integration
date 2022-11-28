import { providers } from "ethers";
import { useEffect, useState } from "react";
import {
  createClient,
  WagmiConfig,
  useAccount,
  useConnect,
  useDisconnect,
  useProvider,
} from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { config } from "../config";
import { DemoCard } from "./demo-card";

const client = createClient({
  provider: new providers.JsonRpcProvider({ url: config.SCROLL_L2_URL }),
});

const WagmiContent = () => {
  const [latestBlock, setLatestBlock] = useState<number>(0);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();
  const provider = useProvider({ chainId: config.SCROLL_L2_CHAINID });

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
      <DemoCard
        address={address as string}
        connect={connect}
        disconnect={disconnect}
        latestBlock={latestBlock}
      />
  );
};

export const EthersConnect = () => {
  return (
    <WagmiConfig client={client}>
      <WagmiContent />
    </WagmiConfig>
  );
};
