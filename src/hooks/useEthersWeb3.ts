import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers";
import { useCallback, useEffect, useState } from "react";
import { config } from "../config";

const checkIfWalletConnectedAndGetEthereumObj = () => {
  const { ethereum } = window;
  if (!ethereum) {
    console.log("Make sure you have metamask");
    return null;
  } else {
    console.log("We have the ethereum object", ethereum);
    return ethereum;
  }
};

const checkNetwork = async () => {
  const { ethereum } = window;
  try {
    if ((ethereum as any).networkVersion !== `${config.SCROLL_L2_CHAINID}`) {
      return false;
    }
    return true;
  } catch (err: any) {
    console.log(err);
  }
  return false;
};

export const useWeb3 = () => {
  const [ethereum, setEthereum] = useState<any>();
  const [account, setAccount] = useState<string>();
  const [provider, setProvider] = useState<Web3Provider>();
  const [signer, setSigner] = useState<JsonRpcSigner>();

  useEffect(() => {
    const obj = checkIfWalletConnectedAndGetEthereumObj();
    setEthereum(obj);
  }, []);

  useEffect(() => {
    const asyncFn = async () => {
      if (ethereum) {
        const accounts = await ethereum.request({ method: "eth_accounts" });

        if (accounts.length !== 0) {
          console.log("Found an authorized account: ", accounts[0]);
          setAccount(accounts[0]);
        } else {
          console.log("No authorized account found.");
          setAccount(undefined);
        }
      }
    };

    asyncFn();
  }, [ethereum]);

  const connect = useCallback(async () => {
    if (!ethereum) {
      return alert("Get metamask!");
    }

    const isNetworkScroll = await checkNetwork();

    if (!isNetworkScroll && ethereum) {
      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: config.SCROLL_L2_CHAINID }],
        });
      } catch (err: any) {
        if (err.code === 4902) {
          try {
            await ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: config.SCROLL_L2_CHAINID,
                  chainName: "Scroll L2 Testnet",
                  rpcUrls: [config.SCROLL_L2_URL],
                  nativeCurrency: { symbol: "TETH", decimals: 18 },
                },
              ],
            });
          } catch (err2: any) {
            return alert(err2.message);
          }
        }
      }
    }

    try {
      // Setup provider
      const newProvider = new Web3Provider(ethereum);
      const newSigner = newProvider.getSigner();
      setProvider(newProvider);
      setSigner(newSigner);

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected: ", accounts[0]);
      setAccount(accounts[0]);
    } catch (err: any) {
      return alert(err.message);
    }
  }, [ethereum]);

  const disconnect = useCallback(async () => {
    if (!ethereum) {
      return alert("Get metamask!");
    }

    if (ethereum && account) {
      setAccount(undefined);
      setProvider(undefined);
      setSigner(undefined);
    }
  }, [ethereum, account]);

  return { account, provider, signer, connect, disconnect };
};
