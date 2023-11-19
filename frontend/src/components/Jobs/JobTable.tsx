import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAccount, useChainId } from "wagmi";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { Table, TableBody, TableContainer, TableHead } from "@mui/material";
import { AppTableHeaderRow } from "../AppComponents/AppTable";
import * as React from "react";
import { StyledTableCell, TablePaper } from "../Voting/VotingTable";
import JobTableItem from "./JobTableItem";

export interface IJob {
  id: number;
  finishedOn: number;
  processedOn: number;
  timestamp: number;
  returnvalue: any;
  stacktrace: string[];
}

const JobTable = () => {
  const chainId = useChainId();
  const account = useAccount();
  const [jobs, setJobs] = useState<IJob[]>([]);

  const fetchJobs = useCallback(() => {
    axios
      .get(
        `                
        ${process.env.REACT_APP_ENDPOINT}?chainId=${chainId}&voter=${account.address}
      `
      )
      .then(({ data }) => {
        setJobs((data as any).jobs);
      })
      .catch((e) => {
        console.log(e);
      });
  }, [setJobs, chainId, account]);

  useEffect(() => {
    const interval = setInterval(fetchJobs, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [fetchJobs]);

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
        <TableContainer component={TablePaper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <AppTableHeaderRow>
                <StyledTableCell align="center">ID</StyledTableCell>
                <StyledTableCell align="center">Created Date</StyledTableCell>
                <StyledTableCell align="center">
                  Start Process Date
                </StyledTableCell>
                <StyledTableCell align="center">Finished Date</StyledTableCell>
                <StyledTableCell>Result</StyledTableCell>
              </AppTableHeaderRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <JobTableItem key={job.id} job={job} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default JobTable;
