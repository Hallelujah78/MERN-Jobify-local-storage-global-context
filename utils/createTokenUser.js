const createTokenUser = (user) => {
  const { email, name, _id: userId, lastName, location } = user;
  return { email, name, userId, lastName, location };
};

export default createTokenUser;
