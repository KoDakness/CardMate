import { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, ChevronDown, AlertTriangle } from 'lucide-react';
import type { Player, Course, CourseLayout } from '../types';
import { supabase } from '../lib/supabase';
import CourseSearch from '../components/CourseSearch';
import { useAuth } from '../context/AuthContext';

interface ManagePageProps {
  players: Player[];
  courses: Course[];
  onPlayersChange: (players: Player[]) => void;
  onCoursesChange: (courses: Course[]) => void;
}

export default function ManagePage({ players, courses, onPlayersChange, onCoursesChange }: ManagePageProps) {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<string | null>(null);
  const [deletingPlayer, setDeletingPlayer] = useState<string | null>(null);
  const [showCourseSearch, setShowCourseSearch] = useState(false);
  const { user } = useAuth();

  const addPlayer = async () => {
    if (newPlayerName.trim()) {
      try {
        const newPlayer = {
          id: crypto.randomUUID(),
          user_id: user?.id,
          name: newPlayerName.trim()
        };

        const { error } = await supabase
          .from('players')
          .insert(newPlayer);

        if (error) throw error;
      } catch (error) {
        console.error('Error adding player:', error);
        alert('Failed to add player. Please try again.');
      }
      setNewPlayerName('');
    }
  };

  const removePlayer = async (id: string) => {
    try {
      const { error: deletePlayerError } = await supabase
        .from('players')
        .delete()
        .eq('id', id);

      if (deletePlayerError) throw deletePlayerError;
      
      // Update local state
      onPlayersChange(players.filter(p => p.id !== id));
      setDeletingPlayer(null);
    } catch (error) {
      console.error('Error removing player:', error);
      alert('Failed to remove player. Please try again.');
    }
  };

  const removeCourse = async (id: string) => {
    try {
      const { error: deleteCourseError } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (deleteCourseError) throw deleteCourseError;
    
      // Update local state
      onCoursesChange(courses.filter(c => c.id !== id));
      setDeletingCourse(null);
    } catch (error) {
      console.error('Error removing course:', error);
      alert('Failed to remove course. Please try again.');
    }
  };

  const updatePlayerName = async (id: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('players')
        .update({ name: newName })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating player:', error);
      alert('Failed to update player. Please try again.');
    }
    setEditingPlayer(null);
  };

  const updateCourse = async (courseId: string, updates: Partial<Course>) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', courseId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Failed to update course. Please try again.');
    }
  };

  const addCourse = async (courseData?: Course) => {
    try {
      const newCourse = {
        id: courseData?.id || crypto.randomUUID(),
        user_id: user?.id,
        name: courseData?.name || 'New Course',
        layout: courseData?.layout || '18',
        holes: courseData?.holes || Array.from({ length: 18 }, (_, i) => ({
            number: i + 1,
            par: 3,
            distance: 300,
            notes: ''
          }))
      };

      const { error } = await supabase
        .from('courses')
        .insert(newCourse);

      if (error) throw error;
      setEditingCourse(newCourse.id);
      setExpandedCourse(newCourse.id);
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Failed to add course. Please try again.');
    }
  };

  return (
    <div className="pb-20 px-4 pt-4">
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Players</h2>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Player name"
              className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={addPlayer}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {players.map(player => (
            <div key={player.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              {editingPlayer === player.id ? (
                <input
                  type="text"
                  defaultValue={player.name}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      updatePlayerName(player.id, e.currentTarget.value);
                    }
                  }}
                  className="flex-1 px-3 py-1 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              ) : (
                <span className="font-medium">{player.name}</span>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => editingPlayer === player.id 
                    ? setEditingPlayer(null)
                    : setEditingPlayer(player.id)
                  }
                  className="p-2 text-gray-600 hover:text-emerald-600 transition-colors"
                >
                  {editingPlayer === player.id ? <X className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => removePlayer(player.id)}
                  onClick={() => setDeletingPlayer(player.id)}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              {deletingPlayer === player.id && (
                <div className="absolute inset-0 bg-red-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-red-900">Delete Player</h3>
                      <p className="text-sm text-red-700 mt-1">
                        Are you sure you want to delete this player? This will also delete all their scorecard history.
                      </p>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => removePlayer(player.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeletingPlayer(null)}
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
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Courses</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCourseSearch(!showCourseSearch)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Search DGCR
            </button>
            <button
              onClick={() => addCourse()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Empty Course
            </button>
          </div>
        </div>

        {showCourseSearch && (
          <div className="mb-6">
            <CourseSearch onCourseSelect={(course) => {
              addCourse(course);
              setShowCourseSearch(false);
            }} />
          </div>
        )}

        <div className="space-y-4">
          {courses.map(course => (
            <div key={course.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-4 bg-gray-50 flex items-center justify-between">
                {editingCourse === course.id ? (
                  <input
                    type="text"
                    defaultValue={course.name}
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        updateCourse(course.id, { name: e.currentTarget.value });
                        setEditingCourse(null);
                      }
                    }}
                    className="flex-1 px-3 py-1 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                ) : (
                  <span className="font-medium">{course.name}</span>
                )}

                <div className="flex items-center gap-2">
                  <select
                    value={course.layout}
                    onChange={(e) => updateCourse(course.id, { 
                      layout: e.target.value as CourseLayout,
                      holes: Array.from(
                        { length: parseInt(e.target.value) },
                        (_, i) => course.holes[i] || { number: i + 1, par: 3, distance: 300, notes: '' }
                      )
                    })}
                    className="px-3 py-1 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="9">9 Holes</option>
                    <option value="18">18 Holes</option>
                  </select>
                  
                  <button
                    onClick={() => editingCourse === course.id 
                      ? setEditingCourse(null)
                      : setEditingCourse(course.id)
                    }
                    className="p-2 text-gray-600 hover:text-emerald-600 transition-colors"
                  >
                    {editingCourse === course.id ? <Save className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={() => setDeletingCourse(course.id)}
                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                    title="Delete course"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => setExpandedCourse(
                      expandedCourse === course.id ? null : course.id
                    )}
                    className="p-2 text-gray-600 hover:text-emerald-600 transition-colors"
                  >
                    <ChevronDown 
                      className={`w-5 h-5 transform transition-transform ${
                        expandedCourse === course.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              {deletingCourse === course.id && (
                <div className="p-4 bg-red-50 border-t border-red-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-red-900">Delete Course</h3>
                      <p className="text-sm text-red-700 mt-1">
                        Are you sure you want to delete this course? This will also delete all scorecards associated with this course.
                      </p>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => removeCourse(course.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeletingCourse(null)}
                          className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {expandedCourse === course.id && (
                <div className="p-4 space-y-4">
                  {course.holes.map((hole, index) => (
                    <div key={hole.number} className="grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium w-16">Hole {hole.number}</span>
                        <input
                          type="number"
                          value={hole.par}
                          onChange={(e) => {
                            const newHoles = [...course.holes];
                            newHoles[index] = { 
                              ...hole,
                              par: Math.max(1, parseInt(e.target.value) || 1)
                            };
                            updateCourse(course.id, { holes: newHoles });
                          }}
                          className="w-20 px-3 py-1 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Par"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={hole.distance}
                          onChange={(e) => {
                            const newHoles = [...course.holes];
                            newHoles[index] = {
                              ...hole,
                              distance: Math.max(0, parseInt(e.target.value) || 0)
                            };
                            updateCourse(course.id, { holes: newHoles });
                          }}
                          className="w-24 px-3 py-1 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Distance"
                        />
                        <span className="text-gray-500">ft</span>
                      </div>
                      
                      <input
                        type="text"
                        value={hole.notes || ''}
                        onChange={(e) => {
                          const newHoles = [...course.holes];
                          newHoles[index] = {
                            ...hole,
                            notes: e.target.value
                          };
                          updateCourse(course.id, { holes: newHoles });
                        }}
                        className="px-3 py-1 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Notes (mandos, hazards, etc.)"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}