import { LinearProgress } from "@mui/material";

const Loading = (): JSX.Element => {
  return (
    <div className="loading-animation__div">
      <LinearProgress />
    </div>
  );
};

export default Loading;
