import { useDispatch, useSelector } from "react-redux";
import { loginSuccess, logout as logout_, setLastLogout } from '../../store/authSlice';
import { saveAllConversations } from '../../store/conversationsSlice';
const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const state = useSelector((state) => state);

  const saveUser = (userData) => {
    const username = userData?.user.username;
    const email = userData?.user.email;
    const { token, userType } = userData;
    dispatch(loginSuccess({
        username, email, token, userType
    }));
   }

   const setNewLogoutTime = () => {
    dispatch(setLastLogout(Date.now()));
   }
   const logout = async () => {
    dispatch(logout_());
   }

  return {
    authState,
    setNewLogoutTime,
    logout,
    saveUser,
  };
};

export default useAuth;