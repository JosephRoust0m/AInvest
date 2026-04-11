import { useDispatch, useSelector } from "react-redux";
import { useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';
import { logout as logout_, setLastLogout } from '../../store/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const { getToken } = useClerkAuth();
  const { signOut: clerkSignOut } = useClerk();

  const setNewLogoutTime = () => {
    dispatch(setLastLogout(Date.now()));
  };

  const logout = async () => {
    dispatch(logout_());
    await clerkSignOut();
  };

  return {
    authState,
    setNewLogoutTime,
    logout,
    getToken,
  };
};

export default useAuth;
