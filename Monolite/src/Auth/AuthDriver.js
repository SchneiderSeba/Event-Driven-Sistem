import jwt from 'jsonwebtoken';
import axios from 'axios';

export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
  };
  const secretKey = process.env.JWT_SECRET || 'your_secret_key';
  const options = {
    expiresIn: '1h',
  };
  console.log('Generating token for user:', payload, secretKey, options);
  return jwt.sign(payload, secretKey, options);
};

export const verifyToken = (token) => {
  const secretKey = process.env.JWT_SECRET || 'your_secret_key';
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (err) {
    console.error('Token verification failed:', err);
    return null;
  }
};

export const revokeToken = async (user) => {
  try {

    const expiredToken = user.token;
    
    const response = await axios.post(`http://localhost:8000/trashTokens`, {token: expiredToken, revokedAt: new Date().toISOString()});
    console.log('Token revoked and stored in trashTokens:', response.data);

    const response2 = await axios.patch(`http://localhost:8000/users/${user.id}`, { token: null })
    console.log('User token revoked:', response2.data);

  } catch (error) {
    console.error('Error revoking token:', error);
  }
};

export const cleanExpiredTokens = async () => {
  // Since JWTs are stateless, expired tokens are automatically invalid.
  // This is a placeholder function in case you implement a token blacklist.
    try {
    const { data: users } = await axios.get('http://localhost:8000/users');

    console.log('Cleaning expired tokens');

    for(const user of users) {
      try {
        if (user.token == null || user.token === undefined) continue;
        jwt.verify(user.token, process.env.JWT_SECRET || 'your_secret_key');
      } catch (err) {
        // Token is expired or invalid
        if (err.name === 'TokenExpiredError') {
        await revokeToken(user);
      }
    }
  };
  } catch (error) {
    console.error('Error cleaning expired tokens:', error);
  }
};
