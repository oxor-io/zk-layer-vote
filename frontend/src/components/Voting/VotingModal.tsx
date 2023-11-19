import { AppDialog } from "components/AppComponents/AppDialog";
import {
  DialogContent,
  FormGroup,
  Box,
  Grid,
  Icon,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { AppDialogTitle } from "components/AppComponents/AppDiallogTitle";
import { Controller, useForm } from "react-hook-form";
import { AppTextField, AppFormLabel } from "components/AppComponents/AppForm";
import { ButtonPrimary } from "components/AppComponents/AppButton";

import requiredSrc from "assets/svg/required.svg";
import { styled } from "@mui/material/styles";
import { FC, useCallback, useMemo, useState } from "react";
import { WalletBalance } from "components/AppComponents/AppBox";
import BigNumber from "bignumber.js";
import { useAccount, useChainId } from "wagmi";
import { VOTING_TOKEN } from "../../config/addresses";
import { IProposal } from "../../hooks/useGovernorL1";
import axios from "axios";
import useDelegateL2 from "../../hooks/useDelegateL2";

const Required = () => (
  <Icon sx={{ width: "20px", height: "26px" }}>
    <img alt="staking-icon" src={requiredSrc} />
  </Icon>
);

const GridContainer = styled(Grid)`
  padding: 0 16px;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: 0;
  }
`;

type VotingTransactionPropsType = {
  onClose: any;
  balance: bigint;
  proposal: IProposal;
  proposalStatesRoot: any;
};

const VotingModalToggleButton = styled(ToggleButton)`
  background: linear-gradient(104.04deg, #b3fff9 0%, #00dbcb 100%);
  border-radius: 8px;
  color: #00332f;
  border: 1px solid #b3fff9;
  &:hover,
  &.Mui-selected {
    background: transparent;
    color: #b3fff9;
    border: 1px solid #b3fff9;
    cursor: pointer;
    pointerevents: all !important;
    svg: {
      color: #b3fff9;
    }
  }
`;

const VotingModalToggleButtonsGroup = styled(ToggleButtonGroup)`
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
`;

const VotingModal: FC<VotingTransactionPropsType> = ({
  onClose,
  balance,
  proposal,
  proposalStatesRoot,
}) => {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      weight: "",
      support: "1",
    },
  });
  const account = useAccount();
  const chainId = useChainId();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { delegatedBalance } = useDelegateL2(account.address as string);

  const onSubmit = useCallback(
    (values: Record<string, any>) => {
      setIsLoading(true);
      const payload = {
        voter: account.address,
        chainId: chainId,
        token: (VOTING_TOKEN as any)[chainId],
        proposalId: proposal.proposalId.toString(),
        stateRoot: proposalStatesRoot.result[0],
        support: values.support,
        weight: values.weight,
        block: proposalStatesRoot.result[1].toString(),
      };
      console.log(payload);

      try {
        axios
          .post(process.env.REACT_APP_ENDPOINT as string, payload)
          .then(() => {
            onClose();
          })
          .catch((e) => {
            console.log(e);
          })
          .finally(() => setIsLoading(false));
      } catch (e) {
        console.log(e);
      }
    },
    [setIsLoading, account, chainId, proposal, onClose]
  );

  const formattedBalance = useMemo(
    () =>
      balance
        ? BigNumber(balance.toString())
            .dividedBy(10 ** 18)
            .toNumber()
        : 0,
    [balance]
  );

  const formattedDelegatedBalance = useMemo(() => {
    return delegatedBalance
      ? BigNumber((delegatedBalance as bigint).toString())
          .dividedBy(10 ** 18)
          .toNumber()
      : 0;
  }, [delegatedBalance]);

  return (
    <AppDialog
      aria-labelledby="customized-dialog-title"
      open={true}
      fullWidth
      maxWidth="md"
      color="primary"
      sx={{ "> .MuiDialog-container > .MuiPaper-root": { width: "700px" } }}
    >
      <AppDialogTitle id="customized-dialog-title" onClose={onClose}>
        Vote
      </AppDialogTitle>
      <DialogContent sx={{ marginTop: "20px" }}>
        <GridContainer container gap={2}>
          <Grid item xs={12}>
            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              autoComplete="off"
              sx={{ ".MuiFormGroup-root": { marginBottom: "15px" } }}
            >
              <Controller
                control={control}
                name="weight"
                rules={{ required: true, max: formattedBalance, min: 1 }}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <FormGroup>
                    <AppFormLabel
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        Voting balance <Required />
                      </Box>
                      {delegatedBalance ? (
                        <WalletBalance>
                          Delegated Available: {formattedDelegatedBalance}
                        </WalletBalance>
                      ) : null}
                      {balance ? (
                        <WalletBalance>
                          Wallet Available: {formattedBalance}
                        </WalletBalance>
                      ) : null}
                    </AppFormLabel>
                    <AppTextField
                      error={!!error}
                      multiline
                      rows={1}
                      value={value}
                      onChange={onChange}
                    />
                  </FormGroup>
                )}
              />
              <Controller
                control={control}
                name="support"
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <VotingModalToggleButtonsGroup
                    color="primary"
                    value={value}
                    exclusive
                    onChange={onChange}
                    aria-label="Platform"
                  >
                    <VotingModalToggleButton value="1">
                      Yes
                    </VotingModalToggleButton>
                    <VotingModalToggleButton value="0">
                      No
                    </VotingModalToggleButton>
                  </VotingModalToggleButtonsGroup>
                )}
              />
              <Box>
                <ButtonPrimary
                  disabled={isLoading}
                  type="submit"
                  sx={{ width: "100%" }}
                >
                  {isLoading ? <CircularProgress size={30} /> : "Vote"}
                </ButtonPrimary>
              </Box>
            </Box>
          </Grid>
        </GridContainer>
      </DialogContent>
    </AppDialog>
  );
};

export default VotingModal;
