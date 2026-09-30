/* Course details page: full course view with enrollment and lesson
   completion tracking. Routing: ?id=<course-id>. Missing, empty and
   unknown IDs each show a friendly message with a way back. */
document.addEventListener("DOMContentLoaded", async () => {
  const root = document.querySelector("[data-course-details]");
  if (!root) {
    return;
  }

  const courseId = new URLSearchParams(window.location.search).get("id");

  if (!courseId || !courseId.trim()) {
    showFriendlyError(root, "No course selected.", "Choose a course from the listing to see its details.");
    return;
  }

  App.showStatus(root, "Loading course…");
  try {
    const course = await CourseApi.getCourseById(courseId.trim());
    renderDetails(root, course);
  } catch (error) {
    // Expected for unknown IDs (API returns 404): warn, don't error.
    console.warn(`Course "${courseId.trim()}" is not available.`, error);
    showFriendlyError(root, "Course not found.", `There is no course with ID "${courseId.trim()}".`);
  }

  function showFriendlyError(container, heading, message) {
    container.replaceChildren();
    const title = document.createElement("h2");
    title.textContent = heading;
    const text = document.createElement("p");
    text.textContent = message;
    const back = document.createElement("a");
    back.className = "btn";
    back.href = "/courses";
    back.textContent = "Browse courses";
    container.append(title, text, back);
  }

  function renderDetails(container, course) {
    container.replaceChildren();

    const media = document.createElement("img");
    media.className = "detail-media";
    media.src = `/${course.image}`;
    media.alt = `${course.title} course image`;

    const status = document.createElement("p");
    status.className = "status-pill";
    status.setAttribute("data-enrollment-status", "");

    const heading = document.createElement("h2");
    heading.textContent = course.title;

    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = `${course.instructor} · ${course.category} · ${course.duration} · ${course.level}`;

    const description = document.createElement("p");
    description.textContent = course.description;

    const enrollArea = document.createElement("div");
    enrollArea.className = "card-actions";

    const progressBlock = document.createElement("section");
    progressBlock.setAttribute("aria-label", "Course progress");
    progressBlock.className = "progress-block";

    const progressText = document.createElement("p");
    progressText.className = "dashboard-meta";
    progressText.setAttribute("data-progress-text", "");

    const track = document.createElement("div");
    track.className = "progress-track";
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-label", `Progress for ${course.title}`);
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", "100");
    const bar = document.createElement("div");
    bar.className = "progress-bar";
    track.append(bar);

    const completionMessage = document.createElement("p");
    completionMessage.className = "completion-message";
    completionMessage.setAttribute("data-completion-message", "");
    completionMessage.textContent = "Course Completed — congratulations, you finished every lesson!";
    completionMessage.hidden = true;

    progressBlock.append(progressText, track, completionMessage);

    const courseLessons = Array.isArray(course.lessons) ? course.lessons : [];
    const lessonHeading = document.createElement("h3");
    lessonHeading.textContent = `Lessons (${courseLessons.length})`;

    const list = document.createElement("ul");
    list.className = "lesson-list";
    courseLessons.forEach((lesson) => {
      list.append(lessonItem(course, lesson));
    });

    const hint = document.createElement("p");
    hint.className = "meta";
    hint.setAttribute("data-enroll-hint", "");
    hint.textContent = "Enroll in this course to track your lesson progress.";

    container.append(media, status, heading, meta, description, enrollArea, progressBlock, lessonHeading, hint, list);
    refreshAll(course, { status, progressText, track, bar, completionMessage, hint, enrollArea, block: progressBlock, scope: container });
  }

  function lessonItem(course, lesson) {
    const item = document.createElement("li");
    const label = document.createElement("label");
    label.className = "lesson-check";
    const box = document.createElement("input");
    box.type = "checkbox";
    box.setAttribute("data-lesson-id", lesson.id);
    box.checked = Storage.getCourseProgress(course.id).completedLessons.includes(lesson.id);
    box.setAttribute("aria-label", `Mark lesson "${lesson.title}" as completed`);
    box.addEventListener("change", () => {
      Storage.setLessonCompleted(course.id, lesson.id, box.checked);
      box.checked = Storage.getCourseProgress(course.id).completedLessons.includes(lesson.id);
      refreshProgress(course);
      const summary = Storage.summarizeProgress(course);
      App.announce(
        box.checked
          ? `Lesson "${lesson.title}" marked complete. Progress ${summary.percent}%.`
          : `Lesson "${lesson.title}" marked incomplete. Progress ${summary.percent}%.`
      );
    });
    const text = document.createElement("span");
    text.textContent = `${lesson.title} — ${lesson.durationMinutes} min`;
    label.append(box, text);
    item.append(label);
    return item;
  }

  // Re-reads storage so every control reflects one source of truth.
  function refreshAll(course, refs) {
    const enrolled = Storage.isEnrolled(course.id);
    refs.status.textContent = enrolled ? "Enrolled" : "Not enrolled yet";
    refs.status.classList.toggle("is-enrolled", enrolled);
    refs.hint.hidden = enrolled;
    refs.enrollArea.replaceChildren();
    renderEnrollAction(course, refs);
    // Scope to the section being built: on first render it is still
    // detached, so a document-wide query would find nothing.
    syncCheckboxes(course, enrolled, refs.scope);
    refreshProgress(course, refs);
    refs.block.hidden = !enrolled;
  }

  function syncCheckboxes(course, enrolled, scope) {
    const done = new Set(Storage.getCourseProgress(course.id).completedLessons);
    (scope || root).querySelectorAll("[data-lesson-id]").forEach((box) => {
      box.checked = done.has(box.getAttribute("data-lesson-id"));
      box.disabled = !enrolled;
    });
  }

  function refreshProgress(course, refs) {
    const refsOrDom = refs || {
      progressText: root.querySelector("[data-progress-text]"),
      track: root.querySelector(".progress-block .progress-track"),
      bar: root.querySelector(".progress-block .progress-bar"),
      completionMessage: root.querySelector("[data-completion-message]")
    };
    const summary = Storage.summarizeProgress(course);
    refsOrDom.progressText.textContent =
      `Progress: ${summary.percent}% · ${summary.completed} of ${summary.total} lessons completed`;
    refsOrDom.bar.style.width = `${summary.percent}%`;
    refsOrDom.track.setAttribute("aria-valuenow", String(summary.percent));
    refsOrDom.completionMessage.hidden = !summary.isComplete;
  }

  function renderEnrollAction(course, refs) {
    if (Storage.isEnrolled(course.id)) {
      const link = document.createElement("a");
      link.className = "btn";
      link.href = "/my-courses";
      link.textContent = "Go to My Courses";
      refs.enrollArea.append(link);
      return;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn";
    button.textContent = "Enroll in this course";
    button.setAttribute("aria-label", `Enroll in ${course.title}`);
    button.addEventListener("click", () => {
      const added = Storage.enroll(course.id);
      App.refreshEnrollmentBadge();
      refreshAll(course, refs);
      const action = refs.enrollArea.querySelector("a, button");
      if (action) {
        action.focus();
      }
      App.announce(
        added
          ? `Enrolled in ${course.title}. Find it anytime under My Courses.`
          : `Already enrolled in ${course.title}.`
      );
    });
    refs.enrollArea.append(button);
  }
});
