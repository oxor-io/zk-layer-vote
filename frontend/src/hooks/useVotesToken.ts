import { useChainId, useContractRead } from "wagmi";
import { VOTING_TOKEN } from "../config/addresses";
import VotesTokenL1 from "../abis/VotesTokenL1.json";
import { useMemo } from "react";

const useVotesToken = (account: string) => {
  const chainId = useChainId();

  const contractAddress = useMemo(() => {
    return (VOTING_TOKEN as any)[chainId];
  }, [chainId]);

  const { data: balance } = useContractRead({
    address: contractAddress,
    // @ts-ignore
    abi: VotesTokenL1.abi,
    functionName: "balanceOf",
    args: [account],
  });

  return {
    balance,
  };
};

export default useVotesToken;
