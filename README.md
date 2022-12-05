# Integrating Scroll L2 with React

This repository contains the code for a simple implementation of an web3 provider for Ethers.js, Wagmi &  on a React App. 

You can run this repo via doing `npm start` and test it out yourself!


## Walkthrough Guide

There are multiple libraries that can be used (and are used usually)

### Wagmi

Integration with wagmi is relatively simple. In order to connect to Scroll L2, we need to add a custom chain and a custom provider for wagmi.

To do that, let's first add a provider and connector using the `configureChains` function.


```typescript
const { chains, provider } = configureChains(
    [
        chain.mainnet,
        chain.goerli,
        chain.polygon,
        chain.polygonMumbai,
        // Add scroll l2 information
        {
            id: 534354, // ChainID for scroll l2
            name: "Scroll L2 Testnet",
            testnet: true,
            rpcUrls: {
                public: "https://prealpha.scroll.io/l2",
                default: "https://prealpha.scroll.io/l2"
            } 
        }
    ],
    [
        publicProvider(),
        jsonRpcProvider({
            rpc: (curChain: Chain) => {
                if(curChain.id === 534354) {
                    return { http: "https://prealpha.scroll.io/l2" }
                }
                return { http: chain.goerli.rpcUrls[0] } // Should hould ideally return a valid provider url
            }
        })
    ]
)
```

We can then use `chains` and `provider` in creating a wagmi client.

```typescript
const client = createClient({
  autoConnect: true,
  connectors: [new InjectedConnector({ chains })],
  provider,
});
```

After that, simple pass this created client to `WagmiConfig` then you should be good to go!

```tsx
export const App = () => {
    return (
        <WagmiConfig client={client}>
        <Main />
        </WagmiConfig>
    );
}
```

And to connect to specifically scroll, you can utilize the `useConnect` hook.

```typescript
const { connect } = useConnect({
    chainId: 534354,
    connector: new InjectedConnector({ chains }),
  });
```

### Rainbowkit

As Rainbowkit integrates with wagmi, the above steps are similar, only requiring you to add some configuration for Rainbowkit.

The first difference is for the connectors setup. Rainbowkit provides `getDefaultWallets` which let's you setup connectors for wagmi to consume instead of requiring you to set it up yourself.

```typescript
const { connectors } = getDefaultWallets({
  appName: "example-connect",
  chains,
});

const client = createClient({
  autoConnect: true,
  connectors: [...connectors()], // This replaces the InjectedConnector
  provider,
});
```

After that, just add the `RainbowKitProvider` nested under the `WagmiConfig`.


```tsx
    <WagmiConfig client={client}>
    <RainbowKitProvider
        chains={chains}
        theme={darkTheme({
        ...darkTheme.accentColors.blue,
        })}
        coolMode
    >
        <ConnectButton /> {/* Connect button provided by RainbowKit */}
    </RainbowKitProvider>
    </WagmiConfig>
```

And now it should work perfectly!


### Ethers

For `ethers`, there's a lot more work involved as its a bit lower level when compared to `wagmi`.

We will be covering specifically integrating with `ethers` and `metamask`. For other wallets the steps might differ slightly, but should in general be similar.

We start off by creating some utility function for interacting with `metamask`.

```typescript
// Checks if you have a metamask wallet provider available in the browser window.
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

// Check if you are on the correct network, that is, Scroll L2 in this case
const checkNetwork = async () => {
  const { ethereum } = window;
  try {
    if ((ethereum as any).networkVersion !== `0x${Number(534354).toString(16)}`) {
      return false;
    }
    return true;
  } catch (err: any) {
    console.log(err);
  }
  return false;
};
```

Now the tricky part, we'll have to make a react hook for interacting with the wallet. Let's call that `useWeb3` for now.

Start off by creating a few states that we'll use to keep track of our wallet connection status.

```typescript
  const [ethereum, setEthereum] = useState<any>();
  const [account, setAccount] = useState<string>();
  const [provider, setProvider] = useState<Web3Provider>();
  const [signer, setSigner] = useState<JsonRpcSigner>();
```

The `ethereum` object is a state keeping track of the `window.ethereum` object, so we can update the other states (which requires this `window.ethereum` to work!). The `account` state refers to the wallet that we select, as metamask can have multiple wallets. The `provider` and `signer` state keeps track of the available provider and signer created.

With the states created, we now start adding effects for keeping track and updating our states accordingly. Let's first get our `ethereum` state initialized with our first `useEffect`.


```typescript
    useEffect(() => {
        const obj = checkIfWalletConnectedAndGetEthereumObj();
        setEthereum(obj);
    }, []);
```

This essentially checks if a wallet exist and if it does set the `ethereum` object.

Next, we create a effect that tracks the `ethereum` object and tries to find any pre-connected account beforehand and set the account to a pre-conneceted account if it exist.

```typescript
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
```

Here we check if `ethereum` is available, then if it is we issue a request using the `ethereum` on the method `eth_accounts` to get all the available accounts inside the wallet. If we find a pre-connected account we then set our account state to it.

The `asynFn` here exists to help us write async code inside a `useEffect`, so don't worry too much about it.

Finally, onto the main dish, the `connect` button. We'll nreak this down section by section. First, we'll have to make this function a `useCallback` which tracks the changes of the window `ethereum` state.

```typescript
  const connect = useCallback(async () => {}, [ethereum])
```

With that out of the way, we then start the connect function with a simple check that `ethereum` object does exist, and if it doesn't we'll throw an alert to tell out users to get metamask.

```typescript
    if (!ethereum) {
      return alert("Get metamask!");
    }
```

Now, we check if we are connected to scroll, and perform a few actions if neccessary.

```typescript
    const isNetworkScroll = await checkNetwork();

    if (!isNetworkScroll && ethereum) {
      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${Number(534354).toString(16)}` }],
        });
      } catch (err: any) {
        if (err.code === 4902) {
          try {
            await ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${Number(534354).toString(16)}`,
                  chainName: "Scroll L2 Testnet",
                  rpcUrls: ["https://prealpha.scroll.io/l2"],
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
```

Here, we first check if we are connected to scroll. If not, then we first try to switch to the correct chain by requesting for `wallet_switchEthereumChain`. if that fails for us, we'll then attempt to add the Scroll L2 chain for metamask via requesting `wallet_addEthereumChain` with the chain information.

If all else fails, we simply send an alert to our user indicating the error. Ideally, in a production scenario, the error should be handled appropriately.

Finally, we initiate the connection.

```typescript
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
```

We create a new `Web3Provider` using the available `window.ethereum` instance and a new signer from the provider. We then request for an account from metamask again with `eth_requestAccounts` and take the first account as our connected accounts.

And done! That's our connect function completed! The `connect` function should look something like this:

```typescript
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
```

Now, onto our last function `disconnect` which is also the simplest and most straightforward function here.

```typescript
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
```

To disconnect, essentially set all our states to empty other than the `window.ethereum` object, and it should work!

Now we can finally use this created hook for connecting to Scroll L2.

```typescript
  const { account, connect, disconnect, provider } = useWeb3();

  useEffect(() => {
    const asyncFn = async () => {
      if (account && provider) {
        // Do something you might want to do
        // when you get connected to the wallet initally.
      }
    };
    asyncFn();
  }, [account, provider]);
```


## Afterword

As you may see, integrating with Scroll L2 is quite a simple process. In fact, for most EVM compatible chains out there the integration should be similar to this as well.

Hope this guide helps, and have fun!

## Relevant links

- Official website for Scroll Prealpha Testnet: https://prealpha.scroll.io/
