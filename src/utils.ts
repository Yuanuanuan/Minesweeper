/** 將秒數轉換為 MM:SS 格式 */
export function formatTimeToMMSS(time: number) {
  const minutes = Math.floor(time / 60);
  const remainingSeconds = time % 60;
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}
