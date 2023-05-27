import { CryptoHookFactory } from "@_types/hooks";
import useSWR from "swr";

type AccountHookFactory = CryptoHookFactory<string>

export type UseAccountHook = ReturnType<AccountHookFactory>

export const hookFactory: AccountHookFactory = ({provider}) => (params) => { // function that returns function 
   const swrRes =  useSWR("web3/useAccount", () => {
        console.log(provider);
        return "Test User!";
    })

    
    return swrRes;
}

