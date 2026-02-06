import { useConnectivityStatus } from '../offline/useConnectivityStatus';
import { useOfflineQueue } from '../offline/offlineQueue';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export default function SyncStatusChip() {
  const isOnline = useConnectivityStatus();
  const { queueLength } = useOfflineQueue();

  if (isOnline && queueLength === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-sm font-medium ${
          isOnline
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>Offline</span>
          </>
        )}
        
        {queueLength > 0 && (
          <>
            <span className="mx-1">•</span>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{queueLength} pending</span>
          </>
        )}
      </div>
    </div>
  );
}
