import { styled } from "@mui/material/styles";
import { TableRow as MuiTableRow } from "@mui/material";

export const AppTableHeaderRow = styled(MuiTableRow)`
  height: 32px;
  th {
    text-align: center;
    font-size: 8px;
    color: #5977a0;
    padding: 0;
    border: none;
  }

  th:first-of-type {
    border-radius: 8px 0 0 8px;
    padding-left: 20px;
  }

  th:last-child {
    border-radius: 0 8px 8px 0;
  }
`;

export const AppTableRow = styled(MuiTableRow)`
  background: #131f35;
  td {
    color: #c5d7f2;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    border-bottom: 2px solid #121212;
    height: 72px;
    padding: 0;
  }
  td:first-of-type {
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
    padding-left: 20px;
  }
  td:last-of-type {
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;
