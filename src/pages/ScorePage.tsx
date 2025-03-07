import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Flag, Ruler, UserPlus, RotateCcw } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import PlayerScore from '../components/PlayerScore';
import Logo from '../components/Logo';
import type { Player, Course } from '../types';

interface ScorePageProps {
  courses: Course[];
  selectedCourseId: string;
  onCourseSelect: (id: string) => void;
  availablePlayers: Player[];
  activePlayers: Player[];
  onActivePlayersChange: (players: Player[]) => void;
}

export default function ScorePage({ 
  courses, 
  selectedCourseId,
  onCourseSelect,
  availablePlayers, 
  activePlayers, 
  onActivePlayersChange 
}: ScorePageProps) {
  const [currentHole, setCurrentHole] = useState(1);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const navigate = useNavigate();
  
  const resetRound = () => {
    setCurrentHole(1);
    onActivePlayersChange([]);
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  const availableToAdd = availablePlayers.filter(
    p => !activePlayers.some(player => player.id === p.id)
  );
  
  useEffect(() => {
    if (!selectedCourse && courses.length > 0) {
      onCourseSelect(courses[0].id);
    }
  }, [courses, selectedCourse, onCourseSelect]);
  
  const handleScoreChange = (playerId: string, score: number) => {
    onActivePlayersChange(activePlayers.map(player => {
      if (player.id === playerId) {
        const newScores = [...player.scores];
        newScores[currentHole - 1] = score;
        
        // Calculate total for all holes
        const total = selectedCourse.holes.reduce((sum, hole, i) => {
          return sum + (newScores[i] ?? hole.par);
        }, 0);

        const relativeToPar = selectedCourse.holes.reduce((sum, hole, i) => {
          const score = newScores[i] ?? hole.par;
          return sum + (score - hole.par);
        }, 0);
        
        return {
          ...player,
          scores: newScores,
          total,
          relativeToPar
        };
      }
      return player;
    }));
  };

  const addPlayer = (player: Player) => {
    onActivePlayersChange([...activePlayers, { 
      ...player, 
      scores: [],
      total: selectedCourse.holes.reduce((sum, hole) => sum + hole.par, 0),
      relativeToPar: 0
    }]);
    setIsAddingPlayer(false);
  };

  return (
    <div className="pb-20 px-4 pt-4 max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        {courses.length === 0 || !selectedCourse ? (
          <div className="text-center py-8 space-y-4">
            <Logo className="w-20 h-20 mx-auto" />
            <p className="text-gray-500 mb-4">No courses available</p>
            <Link
              to="/manage"
              className="inline-flex items-center gap-2 px-4 py-2 bg-cardmate-green text-white rounded-xl hover:bg-cardmate-burgundy transition-colors"
            >
              Add a Course
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Logo className="w-12 h-12" />
                <h2 className="text-2xl font-bold text-gray-900">{selectedCourse?.name}</h2>
              </div>
              <select
                value={selectedCourseId}
                onChange={(e) => onCourseSelect(e.target.value)}
                className="px-3 py-1 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cardmate-green"
              >
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedCourse && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 bg-emerald-50 p-3 rounded-xl">
                    <Flag className="w-5 h-5 text-cardmate-green" />
                    <div>
                      <div className="text-sm text-gray-600">Par</div>
                      <div className="font-bold text-cardmate-green">{selectedCourse.holes[currentHole - 1].par}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-50 p-3 rounded-xl">
                    <Ruler className="w-5 h-5 text-cardmate-green" />
                    <div>
                      <div className="text-sm text-gray-600">Distance</div>
                      <div className="font-bold text-cardmate-green">{selectedCourse.holes[currentHole - 1].distance}ft</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentHole(Math.max(1, currentHole - 1))}
                    disabled={currentHole === 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-cardmate-green/10 text-cardmate-green disabled:opacity-40 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  
                  <span className="text-2xl font-bold text-gray-900">
                    Hole {currentHole}
                  </span>
                  
                  <button
                    onClick={() => setCurrentHole(Math.min(parseInt(selectedCourse.layout), currentHole + 1))}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-cardmate-green/10 text-cardmate-green disabled:opacity-40 transition-all"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {isAddingPlayer && availableToAdd.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Add Player</h3>
          <div className="space-y-2">
            {availableToAdd.map(player => (
              <button
                key={player.id}
                onClick={() => addPlayer(player)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 font-medium">
                    {player.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-medium text-gray-900">{player.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {activePlayers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No players added to this round</p>
            <button
              onClick={() => setIsAddingPlayer(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-cardmate-green text-white rounded-xl hover:bg-cardmate-burgundy transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Add Players
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={resetRound}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors shadow-sm"
              >
                <RotateCcw className="w-5 h-5" />
                New Round
              </button>
              <button
                onClick={() => setIsAddingPlayer(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-cardmate-green text-white hover:bg-cardmate-burgundy rounded-xl transition-colors shadow-sm"
              >
                <UserPlus className="w-5 h-5" />
                Add More Players
              </button>
            </div>

            {activePlayers.map(player => (
              <PlayerScore
                key={player.id}
                player={player}
                currentHole={currentHole}
                par={selectedCourse.holes[currentHole - 1].par}
                onScoreChange={handleScoreChange}
              />
            ))}
            
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => {
                  if (currentHole === parseInt(selectedCourse.layout)) {
                    navigate('/scorecard');
                  } else {
                    setCurrentHole(currentHole + 1);
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-cardmate-green text-white rounded-xl hover:bg-cardmate-burgundy transition-colors disabled:opacity-40"
              >
                {currentHole === parseInt(selectedCourse.layout) ? (
                  'Review'
                ) : (
                  <>
                    Next Hole
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}