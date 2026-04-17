import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useDispatch } from 'react-redux';
import { loginSuccess, logout } from '../../store/authSlice';
import { setConversations } from '../../store/conversationsSlice';
import { setAdvisors } from '../../store/advisorsSlice';
import ApiGatewayService from '../../api/ApiGatewayService';
import useSyncLastClosed from '../../hooks/useSyncLastClosed';

const ClerkAuthSync = () => {
  const { isSignedIn, isLoaded, sessionClaims, getToken } = useAuth();
  const { user } = useUser();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && user) {
      const role = sessionClaims?.publicMetadata?.role;
      const username = user.username || user.firstName || user.emailAddresses[0]?.emailAddress;
      const userType = role === 'advisor' ? 'advisor' : 'user';

      dispatch(loginSuccess({ username, email: user.emailAddresses[0]?.emailAddress, userType }));

      // Fetch all data once on app mount
      getToken().then(async token => {
        try {
          const [convoResult, advisorResult] = await Promise.all([
            userType === 'advisor'
              ? ApiGatewayService.fetchAdvisorConversations(username, token)
              : ApiGatewayService.fetchUserConversations(username, token),
            ApiGatewayService.fetchAdvisors(token),
          ]);

          if (convoResult && (convoResult.data || Array.isArray(convoResult))) {
            const convos = convoResult.data || convoResult;
            const closedField = userType === 'advisor' ? 'last_closed_advisor' : 'last_closed_user';
            for (const convo of convos) {
              convo.unreadCount = convo[closedField]
                ? convo.conversation.filter(
                    msg => msg.receiver === username &&
                           new Date(msg.timestamp) > new Date(convo[closedField])
                  ).length
                : 0;
            }
            dispatch(setConversations(convos));
          }

          dispatch(setAdvisors(advisorResult || []));
        } catch (e) {
          console.error('Error fetching initial data:', e);
        }
      });
    } else if (!isSignedIn) {
      dispatch(logout());
    }
  }, [isSignedIn, isLoaded]);

  useSyncLastClosed();

  return null;
};

export default ClerkAuthSync;
