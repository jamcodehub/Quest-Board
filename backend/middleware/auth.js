export default function verifyAdmin(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ message: 'Forbidden: Invalid or missing API Key' });
  }
  
  next();
}