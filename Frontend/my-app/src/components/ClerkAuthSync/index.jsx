import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useDispatch } from 'react-redux';
import { loginSuccess, logout } from '../../store/authSlice';

const ClerkAuthSync = () => {
  const { isSignedIn, isLoaded, sessionClaims } = useAuth();
  const { user } = useUser();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && user) {
      // Role comes directly from the JWT session claims (publicMetadata is embedded by Clerk)
      const role = sessionClaims?.publicMetadata?.role;
      dispatch(loginSuccess({
        username: user.username || user.firstName || user.emailAddresses[0]?.emailAddress,
        email: user.emailAddresses[0]?.emailAddress,
        userType: role === 'advisor' ? 'advisor' : 'user',
      }));
    } else if (!isSignedIn) {
      dispatch(logout());
    }
  }, [isSignedIn, isLoaded, user, sessionClaims, dispatch]);

  return null;
};

export default ClerkAuthSync;
