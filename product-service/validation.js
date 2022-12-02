module.exports.dataIsValid = (data) => {
  if (!data) return false;
  if (!data.title || typeof data.title !== 'string') return false;
  if (typeof data.description !== 'string') return false;
  if (typeof data.price !== 'number') return false;
  if (typeof data.count !== 'number') return false;

  return true;
};
