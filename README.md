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

We start off by checking if metamask exists, and interacting with it if it does.

## Afterword

As you may see, integrating with Scroll L2 is quite a simple process. In fact, for most EVM chains out there the integration should be similar to this as well.

Hope this guide helps, and have fun!

## Relevant links

- Official website for Scroll Prealpha Testnet: https://prealpha.scroll.io/
