/* Shared UI behaviour: navigation, enrollment badge, announcements,
   and reusable course rendering. */
const App = (() => {
  function initNavigation() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-nav-links]");
    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
    }

    const currentPath = window.location.pathname;
    document.querySelectorAll("[data-nav-links] a").forEach((link) => {
      const href = link.getAttribute("href");
      if (href === currentPath || (href === "/" && currentPath === "/index.html")) {
        link.setAttribute("aria-current", "page");
      }
    });

    const year = document.querySelector("[data-current-year]");
    if (year) {
      year.textContent = String(new Date().getFullYear());
    }

    refreshEnrollmentBadge();
  }

  /** Updates the "My Courses (N)" nav badges from enrollment state. */
  function refreshEnrollmentBadge() {
    const count = Storage.getEnrollments().length;
    document.querySelectorAll("[data-enrollment-count]").forEach((badge) => {
      badge.textContent = count > 0 ? `(${count})` : "";
      badge.hidden = count === 0;
      const link = badge.closest("a");
      if (link) {
        link.setAttribute(
          "aria-label",
          count > 0 ? `My Courses, ${count} enrolled` : "My Courses"
        );
      }
    });
  }

  /** Visible + screen-reader confirmation feedback. */
  function announce(message) {
    let notice = document.querySelector("[data-app-notice]");
    if (!notice) {
      notice = document.createElement("div");
      notice.className = "notice";
      notice.setAttribute("data-app-notice", "");
      notice.setAttribute("role", "status");
      const main = document.querySelector("main");
      (main || document.body).prepend(notice);
    }
    notice.textContent = message;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== undefined) {
      node.textContent = text;
    }
    return node;
  }

  function detailsLink(courseId) {
    const link = el("a", "btn btn-secondary", "View details");
    link.href = CourseApi.courseDetailsUrl(courseId);
    return link;
  }

  function enrollControl(course) {
    if (Storage.isEnrolled(course.id)) {
      const link = el("a", "btn", "Go to My Courses");
      link.href = "/my-courses";
      return link;
    }
    const button = el("button", "btn", "Enroll");
    button.type = "button";
    button.setAttribute("aria-label", `Enroll in ${course.title}`);
    button.addEventListener("click", () => {
      const added = Storage.enroll(course.id);
      refreshEnrollmentBadge();
      const done = el("a", "btn", "Go to My Courses");
      done.href = "/my-courses";
      button.replaceWith(done);
      done.focus();
      announce(
        added
          ? `Enrolled in ${course.title}. Find it anytime under My Courses.`
          : `Already enrolled in ${course.title}.`
      );
    });
    return button;
  }

  /**
   * Reusable course card used by Home, Courses and My Courses.
   * Options: { showEnroll: boolean } — Enroll control only where appropriate.
   */
  function courseCard(course, options = {}) {
    const { showEnroll = false } = options;
    const article = el("article", "card");

    const media = document.createElement("img");
    media.className = "card-media";
    media.src = `/${course.image}`;
    media.alt = `${course.title} course image`;
    media.loading = "lazy";

    const body = el("div", "card-body");
    body.append(
      el("span", "tag", course.category),
      // h2 (not h3): listing pages use h1 for the page title, so cards
      // must not skip a heading level (Lighthouse heading-order).
      el("h2", "card-title", course.title),
      el("p", "meta", `${course.instructor} · ${course.duration} · ${course.level}`),
      el("p", "card-desc", course.description)
    );

    const actions = el("div", "card-actions");
    actions.append(detailsLink(course.id));
    if (showEnroll) {
      actions.append(enrollControl(course));
    }
    body.append(actions);
    article.append(media, body);
    return article;
  }

  function renderCourses(container, courses, options = {}) {
    container.replaceChildren();
    if (!courses.length) {
      const empty = el("p", "status", "No courses found.");
      container.append(empty);
      return;
    }
    courses.forEach((course) => container.append(courseCard(course, options)));
  }

  function showStatus(container, message, isError = false) {
    container.replaceChildren();
    const status = el("p", "status", message);
    status.setAttribute("role", isError ? "alert" : "status");
    container.append(status);
  }

  document.addEventListener("DOMContentLoaded", initNavigation);

  return { courseCard, renderCourses, showStatus, announce, refreshEnrollmentBadge };
})();
