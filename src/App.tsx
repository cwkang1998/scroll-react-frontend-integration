import styled from "styled-components";
import { EthersConnect } from "./components/ethers-connect";
import { RainbowkitConnect } from "./components/rainbowkit-connect";
import { WagmiConnect } from "./components/wagmi-connect";

const Container = styled.div`
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: center;
  height: 100%;
`;

const App = () => {
  return (
    <Container>
      <EthersConnect />
      <WagmiConnect />
      <RainbowkitConnect />
    </Container>
  );
};

export default App;
