import { GOVERNOR_L1 } from "config/addresses";
import GovernorL1 from "abis/GovernorL1.json";
import {
  useBlockNumber,
  useChainId,
  useContractEvent,
  useContractReads,
  useContractWrite,
  usePublicClient,
  useWaitForTransaction,
} from "wagmi";
import { Log } from "viem";
import { useCallback, useEffect, useState } from "react";

export interface IProposal {
  calldatas: string[];
  description: string;
  proposalId: bigint;
  proposer: string;
  signatures: string[];
  targets: string[];
  values: bigint[];
  voteEnd: bigint;
  voteStart: bigint;
}

const L1_NETWORK_CHAIN_ID = (process.env.REACT_APP_L1_NETWORK ||
  11155111) as number;

const useGovernorL1 = (address: string) => {
  const [proposals, setProposals] = useState<IProposal[]>([]);
  const chainId = useChainId();
  const publicClient = usePublicClient({
    chainId: L1_NETWORK_CHAIN_ID,
  });
  const { data: currentBlock } = useBlockNumber({
    chainId: L1_NETWORK_CHAIN_ID,
  });

  useEffect(() => {
    if (currentBlock) {
      publicClient
        .getContractEvents({
          address: GOVERNOR_L1,
          abi: GovernorL1.abi,
          eventName: "ProposalCreated",
          strict: false,
          fromBlock: currentBlock - BigInt(5000),
          toBlock: currentBlock,
        })
        .then((logs) => {
          const proposals = logs.map((proposal) => (proposal as any).args);
          setProposals(proposals);
        });
    }
  }, [publicClient, currentBlock, setProposals]);

  useContractEvent({
    address: GOVERNOR_L1,
    abi: GovernorL1.abi,
    eventName: "ProposalCreated",
    listener(log: Log[]) {
      setProposals((prevState) => [...prevState, (log[0] as any).args]);
    },
    chainId: L1_NETWORK_CHAIN_ID,
  });

  const { data: proposalStates } = useContractReads({
    // @ts-ignore
    contracts: proposals.map((proposal) => {
      return {
        address: GOVERNOR_L1,
        // @ts-ignore
        abi: GovernorL1.abi,
        functionName: "state",
        args: [(proposal as any).proposalId],
        chainId: L1_NETWORK_CHAIN_ID,
      };
    }),
  });

  const { data: proposalVotes } = useContractReads({
    // @ts-ignore
    contracts: proposals.map((proposal) => {
      return {
        address: GOVERNOR_L1,
        // @ts-ignore
        abi: GovernorL1.abi,
        functionName: "proposalVotes",
        args: [(proposal as any).proposalId],
        chainId: L1_NETWORK_CHAIN_ID,
      };
    }),
  });

  const { data: proposalStatesRoot } = useContractReads({
    // @ts-ignore
    contracts: proposals.map((proposal) => {
      return {
        address: GOVERNOR_L1,
        // @ts-ignore
        abi: GovernorL1.abi,
        functionName: "proposalStateRoots",
        args: [(proposal as any).proposalId, chainId],
        chainId: L1_NETWORK_CHAIN_ID,
      };
    }),
  });

  const { data: proposalVoted } = useContractReads({
    // @ts-ignore
    contracts: proposals.map((proposal) => {
      return {
        address: GOVERNOR_L1,
        // @ts-ignore
        abi: GovernorL1.abi,
        functionName: "l2VoteCounter",
        args: [(proposal as any).proposalId, chainId, address],
        chainId: L1_NETWORK_CHAIN_ID,
      };
    }),
  });

  const { data: createProposalData, write: createProposalHandler } =
    useContractWrite({
      address: GOVERNOR_L1,
      abi: GovernorL1.abi,
      functionName: "propose",
    });

  const { isLoading: createProposalLoading } = useWaitForTransaction({
    hash: createProposalData?.hash,
  });

  const createProposal = useCallback(() => {
    createProposalHandler({
      args: [[GOVERNOR_L1], [0], ["0x00"], `Proposal ${proposals.length + 1}`],
    });
  }, [createProposalHandler, proposals]);

  return {
    createProposal,
    proposals,
    proposalStates,
    proposalVotes,
    createProposalLoading,
    proposalStatesRoot,
    proposalVoted,
  };
};

export default useGovernorL1;
