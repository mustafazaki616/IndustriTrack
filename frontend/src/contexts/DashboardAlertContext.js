import React, { createContext, useState } from 'react';

export const DashboardAlertContext = createContext();

export function DashboardAlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const addDashboardAlert = (message, id) => {
    setAlerts((prev) => {
      if (prev.some((a) => a.id === id)) return prev;
      return [...prev, { message, id }];
    });
  };

  return (
    <DashboardAlertContext.Provider value={{ alerts, addDashboardAlert }}>
      {children}
    </DashboardAlertContext.Provider>
  );
} 