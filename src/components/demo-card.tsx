import { Card } from "./card";

export const DemoCard = ({
  title,
  address,
  connect,
  disconnect,
  latestBlock,
}: {
  title: string;
  address: string;
  connect: () => void;
  disconnect: () => void;
  latestBlock: number;
}) => {
  return (
    <Card>
      <h2>{title}</h2>
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
