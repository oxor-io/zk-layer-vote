import { FC } from "react";
import Menu from "components/Menu";

type MainLayoutProps = {
  children: string | JSX.Element | JSX.Element[];
};

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  return (
    <>
      <Menu />
      {children}
    </>
  );
};

export default MainLayout;
