module.exports = function (handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };
};
