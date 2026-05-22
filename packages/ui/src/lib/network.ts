import { useEffect, useState } from "react";

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const setOnline_ = () => setOnline(true);
    const setOffline_ = () => setOnline(false);
    window.addEventListener("online", setOnline_);
    window.addEventListener("offline", setOffline_);
    return () => {
      window.removeEventListener("online", setOnline_);
      window.removeEventListener("offline", setOffline_);
    };
  }, []);

  return online;
}
