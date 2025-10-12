import { useAuth } from '../contexts/AuthContext';

function Profile() {
  const { user } = useAuth();

  return (
    <div>
      {user?.avatar_url ? (
        <img src={user.avatar_url} alt="Avatar" width="100" height="100" />
      ) : (
        <p>No avatar yet.</p>
      )}
      <p>Username: {user?.username}</p>
      <p>Email: {user?.email}</p>
    </div>
  );
}

export default Profile;