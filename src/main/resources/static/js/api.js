/* Centralized API client. All course data comes from the Spring MVC backend. */
const CourseApi = (() => {
  const BASE_URL = "/api/courses";

  async function handleResponse(response) {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return response.json();
  }

  async function getAllCourses() {
    const response = await fetch(BASE_URL, { headers: { Accept: "application/json" } });
    return handleResponse(response);
  }

  async function getFeaturedCourses() {
    const response = await fetch(`${BASE_URL}/featured`, { headers: { Accept: "application/json" } });
    return handleResponse(response);
  }

  async function getCourseById(id) {
    const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
      headers: { Accept: "application/json" }
    });
    return handleResponse(response);
  }

  async function getCategories() {
    const response = await fetch(`${BASE_URL}/categories`, { headers: { Accept: "application/json" } });
    return handleResponse(response);
  }

  function courseDetailsUrl(id) {
    return `/course-details?id=${encodeURIComponent(id)}`;
  }

  return { getAllCourses, getFeaturedCourses, getCourseById, getCategories, courseDetailsUrl };
})();
