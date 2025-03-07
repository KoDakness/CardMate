import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import Header from './components/Header';
import AuthPage from './pages/AuthPage';
import ScorePage from './pages/ScorePage';
import ScorecardPage from './pages/ScorecardPage';
import ManagePage from './pages/ManagePage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import { useState } from 'react';
import type { Player, Course } from './types';
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext';

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activePlayers, setActivePlayers] = useState<Player[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          const { supabase } = await import('./lib/supabase');
          const { data: coursesData } = await supabase
            .from('courses')
            .select('*')
            .eq('user_id', user.id);
          
          const { data: playersData } = await supabase
            .from('players')
            .select('*')
            .eq('user_id', user.id);
          
          setCourses(coursesData || []);
          setPlayers(playersData?.map(p => ({ ...p, scores: [], total: 0, relativeToPar: 0 })) || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      const setupSubscriptions = async () => {
        const { supabase } = await import('./lib/supabase');

        const coursesSubscription = supabase
          .channel('courses_changes')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'courses',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              if (payload.eventType === 'DELETE') {
                setCourses(current => current.filter(c => c.id !== payload.old.id));
              } else {
                fetchData();
              }
            }
          )
          .subscribe();

        const playersSubscription = supabase
          .channel('players_changes')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'players',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              if (payload.eventType === 'DELETE') {
                setPlayers(current => current.filter(p => p.id !== payload.old.id));
              } else {
                fetchData();
              }
            }
          )
          .subscribe();

        return () => {
          coursesSubscription.unsubscribe();
          playersSubscription.unsubscribe();
        };
      };

      fetchData();
      const unsubscribe = setupSubscriptions();
      return () => {
        unsubscribe.then(cleanup => cleanup());
      };
    } else {
      setLoading(false);
      setCourses([]);
      setPlayers([]);
    }
  }, [user]);

  return (
    <SettingsProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <Header />
          {loading ? (
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : (
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={
              <RequireAuth>
                <ScorePage 
                  courses={courses} 
                  selectedCourseId={selectedCourseId}
                  onCourseSelect={setSelectedCourseId}
                  availablePlayers={players}
                  activePlayers={activePlayers}
                  onActivePlayersChange={setActivePlayers}
                />
              </RequireAuth>
            } />
            <Route 
              path="/scorecard" 
              element={
                <RequireAuth>
                  {selectedCourse ? (
                    <ScorecardPage players={activePlayers} course={selectedCourse} />
                  ) : (
                    <Navigate to="/" replace />
                  )}
                </RequireAuth>
              } 
            />
            <Route 
              path="/manage" 
              element={
                <RequireAuth>
                  <ManagePage 
                    players={players}
                    courses={courses}
                    onPlayersChange={setPlayers}
                    onCoursesChange={setCourses}
                  />
                </RequireAuth>
              } 
            />
            <Route 
              path="/history" 
              element={
                <RequireAuth>
                  <HistoryPage />
                </RequireAuth>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <RequireAuth>
                  <SettingsPage />
                </RequireAuth>
              } 
            />
          </Routes>
          )}
          </div>
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App;