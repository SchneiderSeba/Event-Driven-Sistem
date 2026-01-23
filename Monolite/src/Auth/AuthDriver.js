import jwt from 'jsonwebtoken';

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

