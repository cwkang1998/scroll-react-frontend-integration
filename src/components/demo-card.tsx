import { Card } from "./card";

export const DemoCard = ({
  address,
  connect,
  disconnect,
  latestBlock,
}: {
  address: string;
  connect: () => void;
  disconnect: () => void;
  latestBlock: number;
}) => {
  return (
    <Card>
      {address ? (
        <>
          <p>Connected to {address}</p>
          <p>Latest block: {latestBlock}</p>
          <button onClick={() => disconnect()}>Disconnect</button>
        </>
      ) : (
          <button onClick={() => connect()}>Connect Wallet</button>
      )}
    </Card>
  );
};
