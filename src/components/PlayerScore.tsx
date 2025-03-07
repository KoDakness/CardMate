import { MinusCircle, PlusCircle, User } from 'lucide-react';
import type { Player } from '../types';

export type ScoreType = 'ace' | 'eagle' | 'birdie' | 'par' | 'bogey' | 'double-bogey' | 'triple-bogey-plus';

export const getScoreType = (score: number, par: number): ScoreType => {
  const difference = score - par;
  if (score === 1) return 'ace';
  if (difference <= -2) return 'eagle';
  if (difference === -1) return 'birdie';
  if (difference === 0) return 'par';
  if (difference === 1) return 'bogey';
  if (difference === 2) return 'double-bogey';
  return 'triple-bogey-plus';
};

export const scoreTypeStyles: Record<ScoreType, string> = {
  ace: 'bg-blue-500 text-white',
  eagle: 'bg-sky-400 text-white',
  birdie: 'bg-emerald-500 text-white',
  par: 'bg-gray-200 text-gray-700',
  bogey: 'bg-orange-400 text-white',
  'double-bogey': 'bg-red-500 text-white',
  'triple-bogey-plus': 'bg-purple-500 text-white'
};

interface PlayerScoreProps {
  player: Player;
  currentHole: number;
  par: number;
  onScoreChange: (playerId: string, score: number) => void;
}

export default function PlayerScore({ player, currentHole, par, onScoreChange }: PlayerScoreProps) {
  const currentScore = player.scores[currentHole - 1] ?? par;
  const scoreType = currentScore === 0 ? 'par' : getScoreType(currentScore, par);

  const calculateCurrentScore = () => {
    let totalScore = 0;
    let totalPar = 0;
    
    for (let i = 0; i < currentHole; i++) {
      if (player.scores[i] !== undefined) {
        totalScore += player.scores[i];
        totalPar += par;
      }
    }
    
    const difference = totalScore - totalPar;
    return difference === 0 ? 'E' : difference > 0 ? `+${difference}` : difference;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 transform transition-all touch-manipulation">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-cardmate-green/10 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-cardmate-green" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium text-gray-900">{player.name}</span>
          <span className={`text-sm font-medium px-2 py-0.5 rounded ${
            calculateCurrentScore() === 0 ? 'bg-gray-100 text-gray-600' :
            calculateCurrentScore() > 0 ? 'bg-cardmate-burgundy/10 text-cardmate-burgundy' :
            'bg-cardmate-green/10 text-cardmate-green'
          }`}>
            {calculateCurrentScore() === 0 ? 'E' : calculateCurrentScore() > 0 ? `+${calculateCurrentScore()}` : calculateCurrentScore()}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4 px-4">
        <button
          onClick={() => onScoreChange(player.id, Math.max(0, currentScore - 1))}
          className="text-cardmate-green hover:text-cardmate-burgundy transition-colors p-2 -m-2"
        >
          <MinusCircle className="w-8 h-8" />
        </button>
        
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${scoreTypeStyles[scoreType]}`}>
          <span className="text-2xl font-bold">{currentScore}</span>
        </div>
        
        <button
          onClick={() => onScoreChange(player.id, currentScore + 1)}
          className="text-cardmate-green hover:text-cardmate-burgundy transition-colors p-2 -m-2"
        >
          <PlusCircle className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}