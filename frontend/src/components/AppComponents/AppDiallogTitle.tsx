import React, { FC, ReactNode } from "react";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import { DialogTitle as MuiDialogTitle } from "@mui/material";

export const AppDialogTitleWrapper = styled(MuiDialogTitle)`
  font-weight: bold;
  font-size: 20px;
  line-height: 24px;
  color: #fff;
  padding: 20px 32px 15px 32px;
  margin: 0;
  border: 1px solid #253656;
  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding-left: 15px;
  }
`;

export const AppDialogCloseIcon = styled(IconButton)`
  position: absolute;
  right: 8px;
  top: 8px;
  color: #fff;
`;

export interface DialogTitleProps {
  id: string;
  children?: ReactNode;
  onClose: () => void;
}

export const AppDialogTitle: FC<DialogTitleProps> = ({
  children,
  onClose,
  ...other
}) => {
  return (
    <AppDialogTitleWrapper {...other}>
      {children}
      {onClose ? (
        <AppDialogCloseIcon aria-label="close" onClick={onClose}>
          <CloseIcon />
        </AppDialogCloseIcon>
      ) : null}
    </AppDialogTitleWrapper>
  );
};
