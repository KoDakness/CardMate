import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { Calendar, ChevronRight, Trash2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ScorecardHistory {
  id: string;
  date: string;
  course: {
    name: string;
  };
  total_score: number;
  relative_to_par: number;
  players: {
    player: {
      name: string;
    };
    total_score: number;
    relative_to_par: number;
  }[];
}

export default function HistoryPage() {
  const [scorecards, setScorecards] = useState<ScorecardHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingScorecard, setDeletingScorecard] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const deleteScorecard = async (id: string) => {
    try {
      // First delete the scorecard players
      const { error: playersError } = await supabase
        .from('scorecard_players')
        .delete()
        .eq('scorecard_id', id);

      if (playersError) throw playersError;

      // Then delete the scorecard itself
      const { error: scorecardError } = await supabase
        .from('scorecards')
        .delete()
        .eq('id', id);

      if (scorecardError) throw scorecardError;

      setScorecards(scorecards.filter(s => s.id !== id));
      setDeletingScorecard(null);
    } catch (error) {
      console.error('Error deleting scorecard:', error);
      alert('Failed to delete scorecard. Please try again.');
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchScorecards = async () => {
      try {
        const { data, error } = await supabase
          .from('scorecards')
          .select(`
            id,
            date,
            total_score,
            relative_to_par,
            course:courses(name),
            players:scorecard_players(
              total_score,
              relative_to_par,
              player:players(name)
            )
          `)
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) throw error;
        setScorecards(data || []);
      } catch (error) {
        console.error('Error fetching scorecards:', error);
        setError('Failed to load scorecards. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchScorecards();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl max-w-md w-full text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 px-4 pt-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Scorecard History</h1>
        
        {scorecards.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No scorecards found</p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Start a Round
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {scorecards.map((scorecard) => (
              <div
                key={scorecard.id}
                className="bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {scorecard.course.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(scorecard.date), 'PPP')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {scorecard.relative_to_par > 0 
                            ? `+${scorecard.relative_to_par}` 
                            : scorecard.relative_to_par}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Total: {scorecard.total_score}
                        </p>
                      </div>
                      <button
                        onClick={() => setDeletingScorecard(scorecard.id)}
                        className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                
                  <div className="space-y-2">
                    {scorecard.players.map((player, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-600 dark:text-gray-300">
                          {player.player.name}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {player.relative_to_par > 0 
                            ? `+${player.relative_to_par}` 
                            : player.relative_to_par} ({player.total_score})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {deletingScorecard === scorecard.id && (
                  <div className="p-4 bg-red-50 border-t border-red-100">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-red-900">Delete Scorecard</h3>
                        <p className="text-sm text-red-700 mt-1">
                          Are you sure you want to delete this scorecard? This action cannot be undone.
                        </p>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => deleteScorecard(scorecard.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeletingScorecard(null)}
                            className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}