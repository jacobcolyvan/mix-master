import { Button } from "@mui/material";

import InfoAfterword from "../atoms/info/InfoAfterword";
import InfoCamelot from "../atoms/info/InfoCamelot";
import InfoExtra from "../atoms/info/InfoExtra";
import InfoGeneral from "../atoms/info/InfoOverview";
import { logout, refresh } from "../auth";
import { usePageTitle } from "../hooks/usePageTitle";

const About = () => {
  usePageTitle("About");
  return (
    <div className="about-page__div">
      <InfoGeneral />
      <InfoExtra />
      <InfoCamelot />
      <div className="about-page__auth-actions">
        <Button variant="outlined" color="primary" onClick={() => logout("signed_out")}>
          Logout
        </Button>

        {/* In dev add a Force Refresh Token button for easy testing */}
        {import.meta.env.DEV && (
          <Button variant="outlined" color="secondary" onClick={() => refresh()}>
            Force Refresh Token (dev)
          </Button>
        )}
      </div>
      <InfoAfterword />
    </div>
  );
};

export default About;
