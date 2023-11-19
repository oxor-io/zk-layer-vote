import { useChainId, useContractRead } from "wagmi";
import { DELEGATE_TOKEN, VOTING_TOKEN } from "config/addresses";
import DelegateL2 from "abis/DelegateL2.json";
import { useMemo } from "react";

const useDelegateL2 = (account: string) => {
  const chainId = useChainId();

  const tokenAddress = useMemo(() => {
    return (VOTING_TOKEN as any)[chainId] || "";
  }, [chainId]);

  const delegateContractAddress = useMemo(() => {
    return (DELEGATE_TOKEN as any)[chainId] || "";
  }, [chainId]);

  const { data: delegatedBalance } = useContractRead({
    address: delegateContractAddress,
    abi: DelegateL2.abi,
    functionName: "delegatedOf",
    args: [tokenAddress, account],
  });

  return {
    delegatedBalance,
  };
};

export default useDelegateL2;
