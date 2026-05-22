const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://guarderia-backend-yelr.onrender.com";
  
export const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export default API_URL;