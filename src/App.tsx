/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import { ProgressProvider } from './context/ProgressContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { AchievementToast } from './components/AchievementToast.tsx';

import { HomePage } from './pages/HomePage.tsx';
import { GamesLibraryPage } from './pages/GamesLibraryPage.tsx';
import { GameDetailsPage } from './pages/GameDetailsPage.tsx';
import { LevelSelectPage } from './pages/LevelSelectPage.tsx';
import { GamePlayerPage } from './pages/GamePlayerPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { LeaderboardPage } from './pages/LeaderboardPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProgressProvider>
          <div className="flex flex-col min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
            <Navbar />
            <main className="flex-1 flex flex-col">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/games" element={<GamesLibraryPage />} />
                <Route path="/games/:gameId" element={<GameDetailsPage />} />
                <Route path="/levels/:gameId" element={<LevelSelectPage />} />
                <Route path="/play/:gameId" element={<GamePlayerPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/settings" element={<Navigate to="/dashboard?tab=settings" replace />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
            <AchievementToast />
          </div>
        </ProgressProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
