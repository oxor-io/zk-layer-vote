import { FC } from "react";
import { IJob } from "./JobTable";
import { AppTableRow } from "../AppComponents/AppTable";
import { StyledTableCell } from "../Voting/VotingTable";
import * as React from "react";
import { List, ListItem, Tooltip } from "@mui/material";
import Box from "@mui/material/Box";

type JobTableItemProps = {
  job: IJob;
};

const JobTableItem: FC<JobTableItemProps> = ({ job }) => {
  return (
    <>
      <AppTableRow>
        <StyledTableCell>{job.id}</StyledTableCell>
        <StyledTableCell align="center" className={"created"}>
          {new Date(job.timestamp).toLocaleString()}
        </StyledTableCell>
        <StyledTableCell align="center" className={"process-time"}>
          {job.processedOn ? new Date(job.processedOn).toLocaleString() : null}
        </StyledTableCell>
        <StyledTableCell align="center" className={"end-time"}>
          {job.finishedOn
            ? new Date(job.finishedOn).toLocaleString()
            : "In Progress"}
        </StyledTableCell>
        <StyledTableCell align="center" className={"result"}>
          {job.returnvalue ? (
            <List>
              <ListItem>
                <>
                  Proof:
                  <Tooltip title={job.returnvalue.proof} placement="top">
                    <Box>{job.returnvalue.proof.slice(0, 100) + "..."}</Box>
                  </Tooltip>
                </>
              </ListItem>
              <ListItem>Transaction: {job.returnvalue.tx}</ListItem>
            </List>
          ) : job.stacktrace.length ? (
            job.stacktrace[0]
          ) : (
            "In Progress"
          )}
        </StyledTableCell>
      </AppTableRow>
    </>
  );
};

export default JobTableItem;
