import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export function AppContextWrapper({ children, shareState }) {
    return (
        <AppContext.Provider value={shareState}>
            {children}
        </AppContext.Provider>
    )
}

export function useAppContext() {
    return useContext(AppContext);
}