/* Homepage: featured courses plus live platform statistics. */
document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([loadFeatured(), loadStats()]);

  async function loadFeatured() {
    const container = document.querySelector("[data-featured-courses]");
    if (!container) {
      return;
    }
    App.showStatus(container, "Loading featured courses…");
    try {
      const courses = await CourseApi.getFeaturedCourses();
      App.renderCourses(container, courses);
    } catch (error) {
      console.error(error);
      App.showStatus(container, "Could not load featured courses. Please try again later.", true);
    }
  }

  async function loadStats() {
    const list = document.querySelector("[data-stats]");
    if (!list) {
      return;
    }
    try {
      const courses = await CourseApi.getAllCourses();
      const stats = [
        { value: courses.length, label: "Courses" },
        { value: new Set(courses.map((course) => course.category)).size, label: "Categories" },
        { value: new Set(courses.map((course) => course.instructor)).size, label: "Expert instructors" },
        {
          value: courses.reduce(
            (total, course) => total + (Array.isArray(course.lessons) ? course.lessons.length : 0),
            0
          ),
          label: "Lessons"
        }
      ];
      list.replaceChildren();
      stats.forEach((stat) => {
        const item = document.createElement("li");
        item.className = "stat";
        const value = document.createElement("strong");
        value.textContent = String(stat.value);
        const label = document.createElement("span");
        label.textContent = stat.label;
        item.append(value, label);
        list.append(item);
      });
    } catch (error) {
      console.warn("Could not load platform statistics", error);
      list.replaceChildren();
      const fallback = document.createElement("li");
      fallback.className = "status";
      fallback.textContent = "Statistics are unavailable right now.";
      list.append(fallback);
    }
  }
});
