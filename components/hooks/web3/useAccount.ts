import { CryptoHookFactory } from "@_types/hooks";
import { useEffect } from "react";
import useSWR from "swr";

type UseAccountResponse = {
    connect: () => void;
    isLoading: boolean;
    isInstalled: boolean;
}

type AccountHookFactory = CryptoHookFactory<string, UseAccountResponse>

export type UseAccountHook = ReturnType<AccountHookFactory>

export const hookFactory: AccountHookFactory = ({provider, ethereum, isLoading}) => () => { // function that returns function 
 
    const {data, mutate, isValidating, ...swr} = useSWR(
        provider ? "web3/useAccount": null,
        async () => {
            const accounts = await provider!.listAccounts();
            const account = accounts[0];
           
            if (!account){
                throw 'Cannot retrieve account! Please connnect to a web3 wallet. '
            }

            return account;
        }, {
            revalidateOnFocus: false
        }
    )

    useEffect(() => {
        ethereum?.on("accountsChanged", handleAccountsChanged);
        return () => {
            ethereum?.removeListener("accountsChanged", handleAccountsChanged);
        }
    })

    const handleAccountsChanged  = (...args: unknown[]) => {
       const accounts = args[0] as string[];
       if (accounts.length === 0) {
        console.error("Please connect to Web3 Wallet");
       }else if (accounts[0] !== data){
        mutate(accounts[0]);
       }
    }

    const connect = async () => {
        try {
            ethereum?.request({method: "eth_requestAccounts"})
        } catch (e) {
            console.error(e)
        }
    }
    return {
        ...swr,
        data,
        isValidating,
        isLoading: isLoading || isValidating, 
        isInstalled: ethereum?.isMetaMask || false,
        mutate,
        connect
    }
}

