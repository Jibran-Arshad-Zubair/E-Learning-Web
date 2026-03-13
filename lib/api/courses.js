import { apiClient } from './client';

export const coursesApi = {
  // GET all courses
  getAll: async () => {
    return apiClient.get('/courses');
  },

  // GET course by ID
  getById: async (id) => {
    return apiClient.get(`/courses/${id}`);
  },


  // GET courses by category
  getByCategory: async (category) => {
    return apiClient.get(`/courses?category=${category}`);
  },

  // GET enrolled courses
//   getEnrolled: async (userId) => {
//     return apiClient.get(`/users/${userId}/enrolled-courses`);
//   }
};