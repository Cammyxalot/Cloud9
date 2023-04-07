import { useCallback, useEffect } from "react";
import { api } from "../api";

const Admin = () => {
  const fetchUserStats = useCallback(async () => {
    api.userStats.query().then(({ stats }) => {
      console.log(stats);
    });
  }, []);

  useEffect(() => {
    fetchUserStats();
  }, []);

  return <div>admin</div>;
};
export default Admin;
