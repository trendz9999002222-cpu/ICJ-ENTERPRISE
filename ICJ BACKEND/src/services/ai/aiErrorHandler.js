const toSafeMessage = (error, fallback = "AI foundation operation failed.") => {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message || fallback;
  return String(error?.message || fallback);
};

const AIErrorHandler = {
  toUserError(error, fallback) {
    const message = toSafeMessage(error, fallback);
    return new Error(message);
  },

  asResult(error, fallback) {
    return {
      ok: false,
      error: toSafeMessage(error, fallback),
    };
  },
};

export default AIErrorHandler;
