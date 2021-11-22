const millisToMinutesAndSeconds = (millis: number) => {
  const minutes: string = String(Math.floor(millis / 60000) + 1);
  const seconds: number = parseInt(((millis % 60000) / 1000).toFixed(0));

  return seconds === 60
    ? minutes + ':00'
    : minutes + ':' + (seconds < 10 ? '0' : '') + String(seconds);
};

export default millisToMinutesAndSeconds;
