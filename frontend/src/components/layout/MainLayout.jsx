import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { OfflineStatus } from '../common/OfflineStatus';

export const MainLayout = () => {
    return (
        <div className="flex h-screen bg-dark-base overflow-hidden">
            <OfflineStatus />
            <Sidebar />
            <main className="flex-1 overflow-auto custom-scrollbar p-8">
                <Outlet />
            </main>
        </div>
    );
};
