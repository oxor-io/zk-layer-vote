import { styled } from "@mui/material/styles";
import { IconButton as MuiButton } from "@mui/material";
import { IconButtonProps as MuiIconButtonProps } from "@mui/material/IconButton/IconButton";

interface ToggleDrawerButtonProps extends MuiIconButtonProps {
  open?: boolean;
}

export const ToggleDrawerButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== "open",
})<ToggleDrawerButtonProps>(({ open }) => ({
  color: "#000",
  width: "20px",
  height: "20px",
  borderRadius: "20px",
  background: open ? "#808084" : "#3E3F45",
  padding: 0,
  position: "absolute",
  right: "-10px",
  "&:hover": { background: open ? "#3E3F45" : "#808084" },
}));

export const ButtonPrimary = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== "isLoading",
})<{ isLoading?: boolean }>(({ isLoading = false }) => {
  const styles = {
    borderRadius: "8px",
    background: "linear-gradient(104.04deg, #B3FFF9 0%, #00DBCB 100%)",
    padding: "8, 12, 8, 12",
    fontSize: "13px",
    lineHeight: "16px",
    fontWeight: "bold",
    color: "#00332F",
    border: "1px solid #B3FFF9",
    height: "40px",
    "&:hover": {
      background: "transparent",
      color: "#B3FFF9",
      border: "1px solid #B3FFF9",
      cursor: "pointer",
      pointerEvents: "all !important",
      svg: {
        color: "#B3FFF9",
      },
    },
    "> .MuiCircularProgress-root": {
      color: "#1D2D49",
    },
  };

  if (!isLoading) {
    // @ts-ignore
    styles["&:disabled"] = {
      color: "gray",
      background: "transparent",
      borderColor: "gray",
      cursor: "not-allowed !important",
      pointerEvents: "all !important",
    };
  }

  return styles;
});

export const ButtonSecondary = styled(MuiButton)`
  color: #43FFF1;
  font-weight: bold;
  font-size: 15px;
  line-height: 20px;
  padding: 8px 16px;
  gap: 8px;
  border: 1px solid #009E92;
  border-radius: 8px;
  height: 40px;
  &:hover {
    background: transparent;
    color: #B3FFF9;
    border: 1px solid #B3FFF9;
    svg: {
      color: #B3FFF9;
    }, 
  }
  &:disabled {
    color: gray;
    background: transparent;
    border-color: gray;
    cursor: not-allowed !important;
    pointer-events: all !important; 
  }
`;

export const ApproveButton = styled(MuiButton)`
  color: #00332f;
  font-weight: bold;
  font-size: 13px;
  line-height: 16px;
  background: linear-gradient(104.04deg, #b3fff9 0%, #00dbcb 100%);
  border: 1px solid #b3fff9;
  border-radius: 8px;
  margin-left: 33px;
  margin-top: 15px;
  min-width: 80px;
  height: 28px;
`;
