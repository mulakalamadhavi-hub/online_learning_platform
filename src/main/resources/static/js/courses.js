/* Course listing page: search, category/duration filters and sorting.
   Search is case-insensitive, whitespace-tolerant and safe with empty
   input; it matches title, description, instructor and category. */
document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.querySelector("[data-course-grid]");
  const categorySelect = document.querySelector("[data-category-filter]");
  const searchInput = document.querySelector("[data-course-search]");
  const durationSelect = document.querySelector("[data-duration-filter]");
  const sortSelect = document.querySelector("[data-sort]");
  const resultCount = document.querySelector("[data-result-count]");
  if (!grid) {
    return;
  }

  const DURATION_LABELS = {
    short: "under 8 hours",
    medium: "8 to 12 hours",
    long: "over 12 hours"
  };

  let allCourses = [];
  App.showStatus(grid, "Loading courses…");

  async function loadCategories() {
    if (!categorySelect) {
      return;
    }
    try {
      const categories = await CourseApi.getCategories();
      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categorySelect.append(option);
      });
    } catch (error) {
      console.warn("Could not load categories", error);
    }
  }

  // Lowercase, trim and collapse inner whitespace ("  Java   25 " -> "java 25").
  function normalize(text) {
    return (text || "").toLowerCase().trim().replace(/\s+/g, " ");
  }

  function parseHours(duration) {
    const match = /(\d+)/.exec(duration || "");
    return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
  }

  function durationBucket(hours) {
    if (hours < 8) {
      return "short";
    }
    if (hours <= 12) {
      return "medium";
    }
    return "long";
  }

  function matchesSearch(course, query) {
    if (!query) {
      return true;
    }
    const haystack = normalize(
      [course.title, course.description, course.instructor, course.category].join(" ")
    );
    return query.split(" ").every((word) => haystack.includes(word));
  }

  function sortCourses(courses, mode) {
    const sorted = [...courses];
    switch (mode) {
      case "title-az":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-za":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "duration-asc":
        sorted.sort(
          (a, b) => parseHours(a.duration) - parseHours(b.duration) || a.title.localeCompare(b.title)
        );
        break;
      case "duration-desc":
        sorted.sort(
          (a, b) => parseHours(b.duration) - parseHours(a.duration) || a.title.localeCompare(b.title)
        );
        break;
      default:
        break; // "featured": catalog order from the backend.
    }
    return sorted;
  }

  function emptyMessage(query, category, duration) {
    if (!allCourses.length) {
      return "No courses are available right now. Please check back later.";
    }
    const reasons = [];
    if (query) {
      reasons.push(`search "${query}"`);
    }
    if (category) {
      reasons.push(`category "${category}"`);
    }
    if (duration && DURATION_LABELS[duration]) {
      reasons.push(`duration "${DURATION_LABELS[duration]}"`);
    }
    return reasons.length
      ? `No courses found for ${reasons.join(", ")}. Try clearing a filter.`
      : "No courses found. Try clearing a filter.";
  }

  function applyFilters() {
    const category = categorySelect ? categorySelect.value : "";
    const query = searchInput ? normalize(searchInput.value) : "";
    const duration = durationSelect ? durationSelect.value : "";
    const sort = sortSelect ? sortSelect.value : "featured";

    const filtered = allCourses.filter((course) => {
      const matchesCategory = !category || course.category === category;
      const matchesDuration =
        !duration || durationBucket(parseHours(course.duration)) === duration;
      return matchesCategory && matchesDuration && matchesSearch(course, query);
    });

    const sorted = sortCourses(filtered, sort);
    App.renderCourses(grid, sorted, { showEnroll: true });
    if (!sorted.length) {
      const status = grid.querySelector(".status");
      if (status) {
        status.textContent = emptyMessage(query, category, duration);
      }
    }
    if (resultCount) {
      resultCount.textContent = `Showing ${sorted.length} of ${allCourses.length} courses`;
    }
  }

  try {
    allCourses = await CourseApi.getAllCourses();
    await loadCategories();
    applyFilters();
  } catch (error) {
    console.error(error);
    App.showStatus(grid, "Could not load courses. Please try again later.", true);
    return;
  }

  [categorySelect, searchInput, durationSelect, sortSelect].forEach((control) => {
    if (!control) {
      return;
    }
    control.addEventListener(control === searchInput ? "input" : "change", applyFilters);
  });
});
