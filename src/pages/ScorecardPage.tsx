import type { Player, Course } from '../types';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scoreTypeStyles, getScoreType } from '../components/PlayerScore';
import { Save, History } from 'lucide-react';

const getHoles = (course: Course) => {
  return Array.from({ length: parseInt(course.layout) }, (_, i) => i + 1);
};

const getScoreDisplay = (score: number | undefined, par: number) => {
  return score ?? par;
};

const getParDifference = (total: number, totalPar: number) => {
  const diff = total - totalPar;
  if (diff === 0) return 'E';
  return diff > 0 ? `+${diff}` : diff.toString();
};

interface ScorecardProps {
  players: Player[];
  course: Course;
}

export default function ScorecardPage({ players, course }: ScorecardProps) {
  const holes = getHoles(course);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const totalPar = course.holes.slice(0, holes.length)
    .reduce((sum, hole) => sum + hole.par, 0);

  const saveScorecard = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      setSaving(true);

      // Verify/get the user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Profile not found. Please sign out and sign in again.');
      }
      
      // Create or update the course
      const { data: savedCourse, error: courseError } = await supabase
          .from('courses')
          .upsert({
            id: course.id,
            user_id: profile.id,
            name: course.name,
            layout: course.layout,
            holes: course.holes
          }, {
            onConflict: 'id'
          });

        if (courseError) throw courseError;

      // Create scorecard
      const { data: scorecard, error: scorecardError } = await supabase
        .from('scorecards')
        .insert({
          user_id: profile.id,
          course_id: course.id,
          total_score: players.reduce((sum, p) => sum + p.total, 0),
          relative_to_par: players.reduce((sum, p) => sum + p.relativeToPar, 0),
          completed: true
        })
        .select()
        .single();

      if (scorecardError) throw scorecardError;

      // Create or update all players
      const { error: playersError } = await supabase
          .from('players')
          .upsert(
            players.map(player => ({
              id: player.id,
              user_id: profile.id,
              name: player.name
            })),
            { onConflict: 'id' }
          );

      if (playersError) throw playersError;

      // Create scorecard players
      const { error: scorecardPlayersError } = await supabase
        .from('scorecard_players')
        .insert(
          players.map(player => ({
            scorecard_id: scorecard.id,
            player_id: player.id,
            scores: player.scores,
            total_score: player.total,
            relative_to_par: player.relativeToPar
          }))
        );

      if (scorecardPlayersError) throw scorecardPlayersError;

      alert('Scorecard saved successfully!');
      navigate('/history');
    } catch (error) {
      console.error('Error saving scorecard:', error);
      alert(error instanceof Error ? error.message : 'Failed to save scorecard. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-20 pt-4 overflow-x-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{course.name}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/history')}
              className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              <History className="w-5 h-5" />
              History
            </button>
            <button
              onClick={saveScorecard}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-colors"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Scorecard
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 min-w-[768px]">
        <table className="w-full">
          <thead className="bg-emerald-50">
            <tr>
              <th className="text-left py-3 px-4 text-emerald-900 font-semibold rounded-l-xl">
                <div className="flex flex-col">
                  <span>Player</span>
                  <span className="text-xs font-normal text-emerald-700">Stats</span>
                </div>
              </th>
              {holes.map(hole => (
                <th key={hole} className="text-center py-3 px-2 text-sm text-emerald-900 font-semibold">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-1">
                    <span className="font-bold text-emerald-700">
                      {hole}
                    </span>
                  </div>
                  <div className="text-xs space-y-0.5">
                    <div className="text-emerald-700">Par {course.holes[hole - 1].par}</div>
                    <div className="text-emerald-600/75">{course.holes[hole - 1].distance}ft</div>
                  </div>
                </th>
              ))}
              <th className="text-center py-3 px-4 text-emerald-900 font-semibold rounded-r-xl">
                <div className="flex flex-col">
                  <span>Total</span>
                  <span className="text-xs font-normal text-emerald-700">Par {totalPar}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {players.map(player => (
              <tr key={player.id} className="border-b border-gray-100 last:border-0">
                <td className="py-4 px-4 font-medium text-gray-900">{player.name}</td>
                {holes.map(hole => (
                  <td
                    key={hole}
                    className="text-center py-3"
                  >
                    <div className="flex justify-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        scoreTypeStyles[getScoreType(
                          player.scores[hole - 1] ?? course.holes[hole - 1].par,
                          course.holes[hole - 1].par
                        )]
                      }`}>
                        <span className="font-bold">
                          {getScoreDisplay(player.scores[hole - 1], course.holes[hole - 1].par)}
                        </span>
                      </div>
                    </div>
                  </td>
                ))}
                <td className="text-center py-4 px-4 font-bold text-gray-900">
                  {player.relativeToPar === 0 ? 'E' : 
                   player.relativeToPar > 0 ? `+${player.relativeToPar}` : 
                   player.relativeToPar}
                  ({player.total})
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}