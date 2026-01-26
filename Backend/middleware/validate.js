export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    const msg =
      err?.issues?.[0]?.message || "Validation failed";
    return res.status(400).json({ message: msg, issues: err?.issues || [] });
  }
};
