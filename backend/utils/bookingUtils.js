const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const calculateNights = (checkIn, checkOut) => {
  return Math.ceil((new Date(checkOut) - new Date(checkIn)) / DAY_IN_MS);
};

export const isDateRangeValid = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  return Number.isFinite(start.getTime()) && Number.isFinite(end.getTime()) && end > start;
};

export const buildConflictQuery = (roomId, checkIn, checkOut, excludeBookingId = null) => {
  const query = {
    room: roomId,
    status: { $in: ["pending", "confirmed", "checked_in"] },
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  return query;
};
