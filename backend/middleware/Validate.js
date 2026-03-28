const { ZodError } = require("zod");

const formatZodError = (err) => {
  if (!(err instanceof ZodError)) return null;
  return err.issues.map((i) => ({
    path: i.path.join("."),
    message: i.message,
  }));
};

exports.validateBody = (schema) => (req, res, next) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: formatZodError(parsed.error),
    });
  }
  req.body = parsed.data;
  next();
};

