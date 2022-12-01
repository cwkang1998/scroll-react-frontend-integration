import { useEffect, useState } from "react";
import { useWeb3 } from "../hooks/useEthersWeb3";
import { Container } from "./container";
import { DemoCard } from "./demo-card";

const EthersContent = () => {
  const [latestBlock, setLatestBlock] = useState<number>(0);
  const { account, connect, disconnect, provider } = useWeb3();

  useEffect(() => {
    const asyncFn = async () => {
      if (account && provider) {
        const blockNumber = await provider.getBlockNumber();
        setLatestBlock(blockNumber);
      }
    };
    asyncFn();
  }, [account, provider]);

  return (
    <Container>
      <DemoCard
        title="EthersJs"
        address={account as string}
        connect={connect}
        disconnect={disconnect}
        latestBlock={latestBlock}
      />
    </Container>
  );
};

export const EthersConnect = () => {
  return <EthersContent />;
};
