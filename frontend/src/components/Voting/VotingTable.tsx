"use client";
import * as React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";
import { ButtonPrimary } from "components/AppComponents/AppButton";
import { AppTableHeaderRow } from "components/AppComponents/AppTable";
import VotingTableItem from "components/Voting/VotingTableItem";
import useGovernorL1 from "hooks/useGovernorL1";
import useVotesToken from "../../hooks/useVotesToken";
import { useAccount, useChainId } from "wagmi";

export const TablePaper = styled(Paper)`
  background: transparent;
  color: #fff;
`;

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    color: theme.palette.common.white,
    fontSize: "13px",
  },
  [`&.${tableCellClasses.body}`]: {
    color: theme.palette.common.white,
    fontSize: "13px",
  },
  ["&.value"]: {
    maxWidth: "80px",
  },
  ["&.data"]: {
    maxWidth: "250px",
  },
}));

const VotingTable = () => {
  const account = useAccount();
  const chainId = useChainId();
  const {
    proposals,
    createProposal,
    createProposalLoading,
    proposalStates,
    proposalVotes,
    proposalVoted,
    proposalStatesRoot,
  } = useGovernorL1(account.address as string);

  const { balance } = useVotesToken(account.address as string);

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: "100%",
            alignItems: "end",
            display: "flex",
            justifyContent: "end",
            paddingBottom: "20px",
          }}
        >
          {chainId.toString() === process.env.REACT_APP_L1_NETWORK &&
            account.address && (
              <ButtonPrimary
                isLoading={createProposalLoading}
                onClick={createProposal}
              >
                {createProposalLoading ? (
                  <CircularProgress size={30} />
                ) : (
                  "Create Proposal"
                )}
              </ButtonPrimary>
            )}
        </Box>
        <TableContainer component={TablePaper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <AppTableHeaderRow>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell align="center" className={"title"}>
                  Title
                </StyledTableCell>
                <StyledTableCell align="center" className={"id"}>
                  Proposal Id
                </StyledTableCell>
                <StyledTableCell align="center" className={"start-date"}>
                  Start Block
                </StyledTableCell>
                <StyledTableCell align="center" className={"end-date"}>
                  End Block
                </StyledTableCell>
                <StyledTableCell align="center" className={"state"}>
                  Proposal State
                </StyledTableCell>
                <StyledTableCell>Votes</StyledTableCell>
              </AppTableHeaderRow>
            </TableHead>
            <TableBody>
              {proposals.map((proposal, index) => (
                <VotingTableItem
                  balance={balance as bigint}
                  key={index}
                  proposal={proposal}
                  index={index}
                  proposalStatesRoot={
                    proposalStatesRoot ? (proposalStatesRoot as any)[index] : {}
                  }
                  proposalState={
                    proposalStates ? (proposalStates as any)[index] : {}
                  }
                  proposalVote={
                    proposalVotes ? (proposalVotes as any)[index] : {}
                  }
                  proposalVoted={
                    proposalVoted ? (proposalVoted as any)[index] : {}
                  }
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default VotingTable;
