import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useDispatch } from 'react-redux';
import { loginSuccess, logout } from '../../store/authSlice';
import useSyncLastClosed from '../../hooks/useSyncLastClosed';

const ClerkAuthSync = () => {
  const { isSignedIn, isLoaded, sessionClaims } = useAuth();
  const { user } = useUser();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && user) {
      const role = sessionClaims?.publicMetadata?.role;
      const username = user.username || user.firstName || user.emailAddresses[0]?.emailAddress;
      dispatch(loginSuccess({
        username,
        email: user.emailAddresses[0]?.emailAddress,
        userType: role === 'advisor' ? 'advisor' : 'user',
      }));
    } else if (!isSignedIn) {
      dispatch(logout());
    }
  }, [isSignedIn, isLoaded, user, sessionClaims, dispatch]);

  useSyncLastClosed();

  return null;
};

export default ClerkAuthSync;
