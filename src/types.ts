export interface Player {
  id: string;
  name: string;
  scores: number[];
  total: number;      // Total strokes
  relativeToPar: number;  // Score relative to par (+1, -1, etc)
}

export interface Scorecard {
  id: string;
  userId: string;
  courseId: string;
  date: string;
  completed: boolean;
  totalScore: number;
  relativeToPar: number;
  players: ScorecardPlayer[];
}

export interface ScorecardPlayer {
  id: string;
  scorecardId: string;
  playerId: string;
  scores: number[];
  totalScore: number;
  relativeToPar: number;
  player?: Player;  // Optional joined player data
}

export interface Hole {
  number: number;
  par: number;
  distance: number;
  notes?: string;
}

export interface Course {
  id: string;
  name: string;
  holes: Hole[];
  layout: '9' | '18';
}

export type CourseLayout = '9' | '18';