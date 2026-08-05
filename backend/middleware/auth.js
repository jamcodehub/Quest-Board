export default function verifyAdmin(req, res, next) {
  // Support both x-api-key and x-admin-password headers
  const apiKey = req.headers['x-api-key'] || req.headers['x-admin-password'];

  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ message: 'Forbidden: Invalid or missing API Key' });
  }

  next();
}