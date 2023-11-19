import { styled } from "@mui/material/styles";
import { Box, Grid, Container } from "@mui/material";

export const MenuWrapper = styled(Grid)`
  height: 60px;
  width: 100%;
  align-items: center;
  padding: 10px 0;
`;

const Web3Wrapper = styled(Box)`
  display: flex;
  gap: 7px;
`;

const Menu = () => {
  return (
    <Container maxWidth="lg">
      <MenuWrapper container>
        <Grid item xs={5} />
        <Grid item xs={5} />
        <Grid item xs={2}>
          <Web3Wrapper>
            <w3m-network-button />
            <w3m-button />
          </Web3Wrapper>
        </Grid>
      </MenuWrapper>
    </Container>
  );
};

export default Menu;
