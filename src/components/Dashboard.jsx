import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch('/api/auth/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await response.json();
      setUser(userData);
    };
    
    fetchUser();
  }, [token]);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Email: {user.email}</p>
      <p>User ID: {user.id}</p>
      {/* This proves you're using Quran Foundation's user API */}
    </div>
  );
}
