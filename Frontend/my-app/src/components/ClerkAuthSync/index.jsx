import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useDispatch } from 'react-redux';
import { loginSuccess, logout, setLastLogout } from '../../store/authSlice';
import ApiGatewayService from '../../api/ApiGatewayService';

const ClerkAuthSync = () => {
  const { isSignedIn, isLoaded, sessionClaims, getToken } = useAuth();
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

      // Fetch last logout from the correct table (users vs advisors)
      const userType = role === 'advisor' ? 'advisor' : 'user';
      getToken().then(token =>
        ApiGatewayService.fetchLastLogout(username, userType, token)
          .then(result => { if (result?.lastLogout) dispatch(setLastLogout(result.lastLogout)); })
          .catch(() => {})
      );
    } else if (!isSignedIn) {
      dispatch(logout());
    }
  }, [isSignedIn, isLoaded, user, sessionClaims, dispatch]);

  return null;
};

export default ClerkAuthSync;
