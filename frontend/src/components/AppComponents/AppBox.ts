import { styled } from "@mui/material/styles";
import { Typography, Box as MuiBox, Box } from "@mui/material";

import RemoveCircle from "assets/svg/remove-circle.svg";

export const ErrorBox = styled(MuiBox)`
  display: flex;
  flex-direction: row;
  align-items: center;
  background: rgba(51, 13, 13, 0.9);
  border: 1px solid #5a0000;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 20px 0;

  svg {
    width: 16px;
    height: 16px;
    color: #ce0000;
    float: left;
    margin-right: 10px;
  }
`;

export const ErrorMessage = styled(Typography)`
  font-size: 14px;
  line-height: 20px;
  color: #ff8585;
`;

export const WrongNetwork = styled(MuiBox)`
  display: flex;
  align-items: center;
  background: #6c1313;
  border: 1px solid #811717;
  border-radius: 8px;
  color: #ffffff;
  font-weight: bold;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 12px;
`;

export const WrongNetworkMobile = styled(MuiBox)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const WrongNetworkMobileIcon = styled(MuiBox)`
  background: url("${RemoveCircle}") no-repeat center;
  width: 20px;
  height: 20px;
`;

export const RightNetwork = styled(MuiBox)`
  background: #253656;
  border-radius: 8px;
  margin-right: 10px;
  justify-content: center;
  align-items: center;
  display: flex;
  gap: 8px;
  font-weight: 600;
  font-size: 13px;
  line-height: 16px;
  padding: 4px 8px;
  cursor: pointer;
  ${({ theme }) => theme.breakpoints.down("sm")} {
    background: none;
    gap: 4px;
    margin-right: 0;
  }
`;

export const MainBox = styled(MuiBox)`
  background: linear-gradient(180deg, #071126 0%, #050c1a 100%);
  min-height: 100vh;
  overflow: auto;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const WarningBox = styled(Box)`
  background: #452508;
  border: 1px solid #5c310a;
  border-radius: 8px;
  padding: 8px 16px;
  gap: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 10px 0 20px;

  svg {
    color: #f7b06e;
  }

  p {
    color: #f7b06e;
    font-size: 14px;
  }
`;

export const SuccessBox = styled(Box)`
  background: #173d0f;
  border: 1px solid #1f5214;
  border-radius: 8px;
  padding: 8px 16px;
  gap: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 10px 0 20px;

  svg {
    color: #8af075;
  }

  p {
    color: #8af075;
    font-size: 14px;
  }
`;

export const WalletBalance = styled("div")`
  font-size: 12px;
  line-height: 16px;
  color: #6379a1;
  float: right;
`;
