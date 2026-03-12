import React, { createContext, useContext, useState } from 'react';
import { mockData } from './mockData';

const StateContext = createContext();

export const StateProvider = ({ children }) => {
    const [activeAlerts, setActiveAlerts] = useState(mockData.activeAlerts);
    const [sectorRisks, setSectorRisks] = useState(mockData.sectorRisks);
    const [importRisks, setImportRisks] = useState(mockData.importRisks);
    const [exportOpportunities, setExportOpportunities] = useState(mockData.exportOpportunities);
    const [summaryStats, setSummaryStats] = useState(mockData.summaryStats);
    const [economicIndicators, setEconomicIndicators] = useState(mockData.economicIndicators);
    const [marketPosition, setMarketPosition] = useState(mockData.marketPosition);
    const [lastUpdated, setLastUpdated] = useState(mockData.lastUpdated);

    // New states for production polish
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Simulate 1.5s data fetch on mount
    React.useEffect(() => {
        let isMounted = true;
        const loadInitialData = async () => {
            try {
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Simulate an API failure randomly or just load mock data
                // For demonstration, we'll occasionally simulate a network error
                if (Math.random() < 0.1) {
                    throw new Error("API Connection Timeout");
                }
                
                if (isMounted) {
                    setIsLoading(false);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    setIsLoading(false);
                    setError(err.message);
                }
            }
        };

        loadInitialData();

        return () => { isMounted = false; };
    }, []);

    const refreshData = async () => {
        setIsRefreshing(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Simulate random error during refresh as well
            if (Math.random() < 0.2) {
                throw new Error("Failed to fetch latest intelligence");
            }
            // Update timestamp on success
            setLastUpdated(new Date().toISOString());
        } catch (err) {
            setError(err.message);
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <StateContext.Provider
            value={{
                activeAlerts, setActiveAlerts,
                sectorRisks, setSectorRisks,
                importRisks, setImportRisks,
                exportOpportunities, setExportOpportunities,
                summaryStats, setSummaryStats,
                economicIndicators, setEconomicIndicators,
                marketPosition, setMarketPosition,
                lastUpdated, setLastUpdated,
                isLoading, isRefreshing, error, refreshData
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const useGlobalState = () => useContext(StateContext);
