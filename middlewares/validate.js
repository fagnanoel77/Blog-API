export const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    const data = req[source];

    const result = schema.safeParse(data);

    if (!result.success) {
      return res.status(400).json({
        error: result.error.errors[0].message,
      });
    }

    req[source] = result.data;

    next();
  };
