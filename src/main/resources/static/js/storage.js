/* LocalStorage persistence layer — the ONLY module that touches storage.
   No other file may call localStorage directly. Keys are centralized
   below. Handles empty, malformed and unavailable storage gracefully
   by falling back to in-memory state for the session. */
const Storage = (() => {
  const ENROLLMENTS_KEY = "olp_enrollments";
  const PROGRESS_KEY = "olp_progress";

  // In-memory fallback used when browser storage is unavailable
  // (private mode blocks, disabled cookies, quota exceeded, etc.).
  const memoryFallback = {};
  let storageBlocked = false;

  function backend() {
    if (storageBlocked) {
      return null;
    }
    try {
      if (typeof localStorage === "undefined" || localStorage === null) {
        return null;
      }
      return localStorage;
    } catch (error) {
      storageBlocked = true;
      console.warn("Browser storage is not accessible; using session memory instead.", error);
      return null;
    }
  }

  function readJson(key, fallback) {
    let raw = null;
    const store = backend();
    if (store === null) {
      raw = Object.hasOwn(memoryFallback, key) ? memoryFallback[key] : null;
    } else {
      try {
        raw = store.getItem(key);
      } catch (error) {
        console.warn(`Could not read storage key "${key}".`, error);
        return fallback;
      }
    }
    if (raw === null || raw === undefined) {
      return fallback;
    }
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.warn(`Stored data for "${key}" is malformed; ignoring it.`, error);
      return fallback;
    }
  }

  function writeJson(key, value) {
    const payload = JSON.stringify(value);
    const store = backend();
    if (store === null) {
      memoryFallback[key] = payload;
      return false;
    }
    try {
      store.setItem(key, payload);
      return true;
    } catch (error) {
      storageBlocked = true;
      console.warn(`Could not write storage key "${key}"; using session memory instead.`, error);
      memoryFallback[key] = payload;
      return false;
    }
  }

  function getEnrollments() {
    const data = readJson(ENROLLMENTS_KEY, []);
    if (!Array.isArray(data)) {
      return [];
    }
    return data.filter((id) => typeof id === "string" && id.length > 0);
  }

  function isEnrolled(courseId) {
    if (typeof courseId !== "string" || courseId.length === 0) {
      return false;
    }
    return getEnrollments().includes(courseId);
  }

  /**
   * Enrolls in a course. Idempotent: duplicate enrollments are ignored.
   * @returns true when this call added the enrollment, false if already enrolled.
   */
  function enroll(courseId) {
    if (typeof courseId !== "string" || courseId.length === 0) {
      return false;
    }
    const enrollments = getEnrollments();
    if (enrollments.includes(courseId)) {
      return false;
    }
    enrollments.push(courseId);
    writeJson(ENROLLMENTS_KEY, enrollments);
    return true;
  }

  function getProgress() {
    const data = readJson(PROGRESS_KEY, {});
    return data && typeof data === "object" && !Array.isArray(data) ? data : {};
  }

  // Normalized per-course progress shape stored under PROGRESS_KEY.
  function getCourseProgress(courseId) {
    const entry = getProgress()[courseId];
    if (entry && Array.isArray(entry.completedLessons)) {
      return { completedLessons: entry.completedLessons.filter((id) => typeof id === "string") };
    }
    return { completedLessons: [] };
  }

  function validId(value) {
    return typeof value === "string" && value.length > 0;
  }

  /**
   * Marks/unmarks a lesson. Idempotent, deduplicated, ignores invalid IDs.
   * @returns true when stored state changed, false otherwise.
   */
  function setLessonCompleted(courseId, lessonId, completed) {
    if (!validId(courseId) || !validId(lessonId)) {
      return false;
    }
    const store = getProgress();
    const entry = store[courseId];
    const current = entry && Array.isArray(entry.completedLessons)
      ? [...new Set(entry.completedLessons.filter(validId))]
      : [];
    const has = current.includes(lessonId);
    const want = completed === true;
    if (want === has) {
      return false;
    }
    const next = want ? [...current, lessonId] : current.filter((id) => id !== lessonId);
    store[courseId] = { completedLessons: next };
    writeJson(PROGRESS_KEY, store);
    return true;
  }

  /**
   * Central progress formula: percent = round(completed / total * 100).
   * Only counts lesson IDs that actually exist on the course, deduped,
   * clamped to 0–100. Zero-lesson courses safely report 0%.
   */
  function summarizeProgress(course) {
    const lessons = course && Array.isArray(course.lessons) ? course.lessons : [];
    const known = new Set(lessons.map((lesson) => lesson && lesson.id).filter(validId));
    const total = known.size;
    const completed = new Set(
      getCourseProgress(course && course.id).completedLessons.filter((id) => known.has(id))
    ).size;
    const percent = total === 0 ? 0 : Math.min(100, Math.max(0, Math.round((completed / total) * 100)));
    return {
      completed,
      total,
      percent,
      isComplete: total > 0 && completed >= total
    };
  }

  return { getEnrollments, isEnrolled, enroll, getProgress, getCourseProgress, setLessonCompleted, summarizeProgress };
})();
