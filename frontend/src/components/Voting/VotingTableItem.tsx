import { FC, useEffect, useState } from "react";
import { IProposal } from "hooks/useGovernorL1";
import { AppTableRow } from "components/AppComponents/AppTable";
import { StyledTableCell } from "components/Voting/VotingTable";
import { ButtonPrimary } from "components/AppComponents/AppButton";
import { styled } from "@mui/material/styles";
import * as React from "react";
import VotingModal from "./VotingModal";
import { useWeb3Modal, useWeb3ModalState } from "@web3modal/wagmi/react";
import { useChainId } from "wagmi";
import { List, ListItem, Tooltip } from "@mui/material";
import Box from "@mui/material/Box";

type VotingTableItemProps = {
  proposal: IProposal;
  index: number;
  balance: bigint;
  proposalStatesRoot: any;
  proposalState: any;
  proposalVote: any;
  proposalVoted: any;
};

export const ConfirmButtonPrimary = styled(ButtonPrimary)`
  margin-right: 10px;
`;

export enum ProposalState {
  Pending,
  Active,
  Canceled,
  Defeated,
  Succeeded,
  Queued,
  Expired,
  Executed,
}

const VotingTableItem: FC<VotingTableItemProps> = ({
  proposal,
  index,
  balance,
  proposalStatesRoot,
  proposalState,
  proposalVote,
  proposalVoted,
}) => {
  const [showVotingModal, setShowVotingModal] = useState<boolean>(false);
  const [showNetworkCheck, setShowNetworkCheck] = useState<boolean>(false);
  const { open, close } = useWeb3Modal();
  const { open: openedModal } = useWeb3ModalState();
  const chainId = useChainId();

  useEffect(() => {
    if (showNetworkCheck) {
      if (
        !openedModal &&
        chainId.toString() === process.env.REACT_APP_L1_NETWORK
      ) {
        open({ view: "Networks" });
      } else if (chainId.toString() !== process.env.REACT_APP_L1_NETWORK) {
        close();
        setShowVotingModal(true);
      }
    }
  }, [
    openedModal,
    chainId,
    showNetworkCheck,
    open,
    close,
    setShowVotingModal,
    setShowNetworkCheck,
    proposal,
  ]);

  useEffect(() => {
    if (proposalVoted?.result && showVotingModal) {
      setShowVotingModal(false);
      setShowNetworkCheck(false);
      close();
    }
  }, [proposalVoted, showVotingModal]);

  return (
    <>
      <AppTableRow>
        <StyledTableCell>{index + 1}</StyledTableCell>
        <StyledTableCell align="center" className={"title"}>
          {proposal.description}
        </StyledTableCell>
        <StyledTableCell align="center" className={"proposal-id"}>
          <Tooltip title={proposal.proposalId.toString()} placement="top">
            <Box>{proposal.proposalId.toString().slice(0, 50) + "..."}</Box>
          </Tooltip>
        </StyledTableCell>
        <StyledTableCell align="center" className={"start-block"}>
          {proposal.voteStart.toString()}
        </StyledTableCell>
        <StyledTableCell align="center" className={"end-block"}>
          {proposal.voteEnd.toString()}
        </StyledTableCell>
        <StyledTableCell align="center" className={"end-block"}>
          {ProposalState[proposalState.result]}
        </StyledTableCell>
        <StyledTableCell align="center" className={"votes"}>
          {proposalVote?.result ? (
            <List>
              <ListItem>Against: {proposalVote?.result[0].toString()}</ListItem>
              <ListItem>For: {proposalVote?.result[1].toString()}</ListItem>
              <ListItem>Abstain: {proposalVote?.result[2].toString()}</ListItem>
            </List>
          ) : null}
        </StyledTableCell>
        <StyledTableCell>
          <ConfirmButtonPrimary
            disabled={proposalVoted?.result}
            onClick={() => setShowNetworkCheck(true)}
          >
            Vote
          </ConfirmButtonPrimary>
        </StyledTableCell>
      </AppTableRow>
      {showVotingModal && (
        <VotingModal
          proposalStatesRoot={proposalStatesRoot}
          proposal={proposal}
          onClose={() => {
            setShowVotingModal(false);
            setShowNetworkCheck(false);
          }}
          balance={balance}
        />
      )}
    </>
  );
};

export default VotingTableItem;
