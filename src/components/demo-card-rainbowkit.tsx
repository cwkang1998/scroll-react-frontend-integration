import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Card } from "./card";

export const DemoCardRainbowKit = ({
  title,
  address,
  latestBlock,
}: {
  title: string;
  address: string;
  latestBlock: number;
}) => {
  return (
    <Card>
      <h2>{title}</h2>
      {address ? (
        <>
          <p>Connected to {address}</p>
          <p>Latest block: {latestBlock}</p>
        </>
      ) : (
        <></>
      )}
      <ConnectButton />
    </Card>
  );
};
