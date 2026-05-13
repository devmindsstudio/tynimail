/**
 * @param dateToCheck ISO formatted date
 * @returns Boolean, true if it is older than Now
 */
export function isDateInFuture(dateToCheck: string) {
  const scheduledDateTimeMS = new Date(dateToCheck).getTime();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayStart = today.getTime();

  if (scheduledDateTimeMS <= todayStart) {
    return false;
  } else {
    return true;
  }
}
