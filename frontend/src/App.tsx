import React, { useEffect, useState } from "react";
import "./App.css";
import { ThemeProvider } from "@mui/material";
import theme from "./theme/theme";

import MainLayout from "./components/MainLayout";
import { WagmiConfig } from "wagmi";
import { wagmiConfig } from "./connector/networks";
import VotingTable from "./components/Voting/VotingTable";
import JobTable from "./components/Jobs/JobTable";

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);
  return (
    <>
      {ready ? (
        <ThemeProvider theme={theme}>
          <WagmiConfig config={wagmiConfig}>
            <MainLayout>
              <>
                <VotingTable />
                <JobTable />
              </>
            </MainLayout>
          </WagmiConfig>
        </ThemeProvider>
      ) : null}
    </>
  );
}

export default App;
