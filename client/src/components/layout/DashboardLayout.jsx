import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AnimatedBackground from '../three/AnimatedBackground';

export default function DashboardLayout() {
    return (
        <div className="min-h-screen relative">
            {/* 3D Animated Background */}
            <AnimatedBackground />

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="lg:ml-64 min-h-screen transition-all duration-300">
                <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
