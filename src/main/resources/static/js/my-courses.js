/* My Courses dashboard: enrolled courses with progress and Continue Learning actions. */
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector("[data-my-courses]");
  if (!container) {
    return;
  }

  const enrollments = Storage.getEnrollments();
  if (!enrollments.length) {
    App.showStatus(container, "You are not enrolled in any course yet.");
    const browse = document.createElement("a");
    browse.className = "btn";
    browse.href = "/courses";
    browse.textContent = "Browse courses";
    container.append(browse);
    return;
  }

  App.showStatus(container, "Loading your courses…");
  try {
    const allCourses = await CourseApi.getAllCourses();
    const mine = allCourses.filter((course) => enrollments.includes(course.id));
    if (!mine.length) {
      App.showStatus(
        container,
        "Your enrolled courses are no longer available. Browse the catalog to enroll again."
      );
      return;
    }
    App.renderCourses(container, mine);
    enhanceDashboard(container, mine);
  } catch (error) {
    console.error(error);
    App.showStatus(container, "Could not load your courses. Please try again later.", true);
  }

  // Adds per-card progress summary + Continue Learning using the shared cards.
  function enhanceDashboard(grid, courses) {
    const cards = grid.querySelectorAll(".card");
    cards.forEach((card, index) => {
      const course = courses[index];
      if (!course) {
        return;
      }
      const summary = Storage.summarizeProgress(course);

      const progressLine = document.createElement("p");
      progressLine.className = "dashboard-meta";
      progressLine.textContent =
        summary.percent === 0
          ? `Progress: ${summary.percent}% · Not started · ${summary.total} lessons`
          : `Progress: ${summary.percent}% · ${summary.completed} of ${summary.total} lessons completed`;

      const track = document.createElement("div");
      track.className = "progress-track";
      track.setAttribute("role", "progressbar");
      track.setAttribute("aria-label", `Progress for ${course.title}`);
      track.setAttribute("aria-valuemin", "0");
      track.setAttribute("aria-valuemax", "100");
      track.setAttribute("aria-valuenow", String(summary.percent));
      const bar = document.createElement("div");
      bar.className = "progress-bar";
      bar.style.width = `${summary.percent}%`;
      track.append(bar);

      const actions = card.querySelector(".card-actions");
      const resume = document.createElement("a");
      resume.className = "btn";
      resume.href = CourseApi.courseDetailsUrl(course.id);
      resume.textContent = "Continue Learning";

      const body = card.querySelector(".card-body");
      body.insertBefore(progressLine, actions);
      body.insertBefore(track, actions);
      if (summary.isComplete) {
        const done = document.createElement("p");
        done.className = "completion-message";
        done.textContent = "Course Completed — well done!";
        body.insertBefore(done, actions);
      }
      actions.append(resume);
    });
  }
});
