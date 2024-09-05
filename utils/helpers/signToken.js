import JWT from "jsonwebtoken";
const signToken = (user) => {
  const token = JWT.sign(user, process.env.JWTSECRET, { expiresIn: 604800 });
  return token;
};
export default signToken;
