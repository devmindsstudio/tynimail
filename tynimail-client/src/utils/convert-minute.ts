export const formatDuration = (seconds: number): string => {
  if (!seconds) return "0s";

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
};
// export const formatDuration = (seconds: number): string => {
//   if (!seconds) return "0 min";

//   const mins = Math.floor(seconds / 60);

//   return `${mins} ${mins === 1 ? "min" : "mins"}`;
// };
