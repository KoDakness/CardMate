const DGCR_API_KEY = import.meta.env.VITE_DGCR_API_KEY;
const BASE_URL = 'https://www.dgcoursereview.com/api_test';

export interface DGCRCourse {
  course_id: string;
  name: string;
  holes: number;
  rating: string;
  location: string;
  holes_data?: {
    hole_num: number;
    length: number;
    par: number;
  }[];
}

export async function searchCourses(query: string): Promise<DGCRCourse[]> {
  const response = await fetch(
    `${BASE_URL}/course.php?key=${DGCR_API_KEY}&mode=name&keyword=${encodeURIComponent(query)}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch courses');
  }
  
  return response.json();
}

export async function getCourseDetails(courseId: string): Promise<DGCRCourse> {
  const response = await fetch(
    `${BASE_URL}/course_details.php?key=${DGCR_API_KEY}&course_id=${courseId}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch course details');
  }
  
  return response.json();
}