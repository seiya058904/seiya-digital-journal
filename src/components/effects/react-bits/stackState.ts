export function isStackClickEnabled(
  isMobile: boolean,
  sendToBackOnClick: boolean,
  mobileClickOnly: boolean,
): boolean {
  return mobileClickOnly || (!isMobile && sendToBackOnClick)
}
