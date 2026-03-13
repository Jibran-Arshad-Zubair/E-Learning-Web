import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '../../lib/api';


// Query Keys - Centralized for consistency
export const courseKeys = {
  all: ['courses'],
  lists: () => [...courseKeys.all, 'list'],
  list: (filters) => [...courseKeys.lists(), { filters }],
  details: () => [...courseKeys.all, 'detail'],
  detail: (id) => [...courseKeys.details(), id],
  enrolled: (userId) => ['users', userId, 'enrolled-courses'],
};

// GET all courses
export const useGetCourses = (filters) => {
  return useQuery({
    queryKey: courseKeys.list(filters),
    queryFn: () => coursesApi.getAll(),
    
    enabled: !!filters, // Optional: conditionally run
  });
};

// GET single course
export const useGetCourse = (id) => {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => coursesApi.getById(id),
    enabled: !!id, 
  });
};

