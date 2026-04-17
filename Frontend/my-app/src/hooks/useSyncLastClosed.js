import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '@clerk/clerk-react';
import ApiGatewayService from '../api/ApiGatewayService';

const SAVE_INTERVAL_MS = 1 * 60 * 1000; // 1 minute

const useSyncLastClosed = () => {
  const conversations = useSelector(state => state.conversations.conversations);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const { getToken } = useAuth();
  const conversationsRef = useRef(conversations);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const save = async () => {
      const convos = conversationsRef.current;
      const toSave = convos
        .filter(c => c.id && (c.last_closed_user || c.last_closed_advisor))
        .map(c => ({
          id: c.id,
          last_closed_user: c.last_closed_user ?? null,
          last_closed_advisor: c.last_closed_advisor ?? null,
        }));
      if (toSave.length === 0) return;
      try {
        const token = await getToken();
        await ApiGatewayService.saveLastClosed(toSave, token);
      } catch {
        // silent — will retry on next interval
      }
    };

    const interval = setInterval(save, SAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isAuthenticated]);
};

export default useSyncLastClosed;
