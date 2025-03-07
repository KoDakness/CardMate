import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { searchCourses, getCourseDetails, type DGCRCourse } from '../lib/dgcr';
import type { Course } from '../types';

interface CourseSearchProps {
  onCourseSelect: (course: Course) => void;
}

export default function CourseSearch({ onCourseSelect }: CourseSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DGCRCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const courses = await searchCourses(query);
      setResults(courses);
    } catch (err) {
      setError('Failed to search courses. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = async (dgcrCourse: DGCRCourse) => {
    setLoading(true);
    try {
      const details = await getCourseDetails(dgcrCourse.course_id);
      
      const course: Course = {
        id: crypto.randomUUID(),
        name: details.name,
        layout: details.holes === 9 ? '9' : '18',
        holes: details.holes_data?.map(hole => ({
          number: hole.hole_num,
          par: hole.par,
          distance: Math.round(hole.length),
          notes: ''
        })) || Array.from({ length: details.holes }, (_, i) => ({
          number: i + 1,
          par: 3,
          distance: 300,
          notes: ''
        }))
      };
      
      onCourseSelect(course);
      setQuery('');
      setResults([]);
    } catch (err) {
      setError('Failed to fetch course details. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for a course..."
            className="w-full px-4 py-2 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Search'
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((course) => (
            <button
              key={course.course_id}
              onClick={() => handleCourseSelect(course)}
              className="w-full text-left p-4 bg-gray-50 hover:bg-emerald-50 rounded-xl transition-colors"
            >
              <div className="font-medium">{course.name}</div>
              <div className="text-sm text-gray-500">
                {course.holes} holes • Rating: {course.rating} • {course.location}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}