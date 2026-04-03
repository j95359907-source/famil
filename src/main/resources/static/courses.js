function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function goLoginIfUnauthorized(res) {
  if (res.status === 401 || res.status === 403) {
    window.location.href = "/login.html";
    return true;
  }
  return false;
}

let teacherMap = new Map();

function resetEnrolledStudents() {
  document.getElementById("courseEnrolledHint").textContent = "当前课程：未选择";
  const tbody = document.getElementById("enrolledStudentsTbody");
  const errorBox = document.getElementById("enrolledStudentsErrorBox");
  errorBox.textContent = "";
  if (tbody) tbody.innerHTML = "";
}

async function loadEnrolledStudents(courseId) {
  const tbody = document.getElementById("enrolledStudentsTbody");
  const errorBox = document.getElementById("enrolledStudentsErrorBox");
  tbody.innerHTML = "";
  errorBox.textContent = "";

  const res = await fetch(`/api/enrollments/courses/${courseId}`, { credentials: "include" });
  if (goLoginIfUnauthorized(res)) return;
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    errorBox.textContent = text || `加载选课学生失败：HTTP ${res.status}`;
    return;
  }

  const students = await res.json();
  if (!Array.isArray(students) || students.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 3;
    td.textContent = "暂无选课学生";
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  for (const s of students) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.id ?? ""}</td>
      <td>${escapeHtml(s.name ?? "")}</td>
      <td>${s.age ?? ""}</td>
    `;
    tbody.appendChild(tr);
  }
}

async function loadTeachersForSelect() {
  const select = document.getElementById("teacherId");
  const errorBox = document.getElementById("errorBox");
  errorBox.textContent = "";

  select.innerHTML = "";
  teacherMap = new Map();

  const res = await fetch("/api/teachers", { credentials: "include" });
  if (goLoginIfUnauthorized(res)) return false;
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `加载老师失败：HTTP ${res.status}`);
  }

  const teachers = await res.json();
  if (!Array.isArray(teachers)) {
    throw new Error("老师数据格式错误");
  }

  for (const t of teachers) {
    teacherMap.set(t.id, t.name ?? "");
  }

  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.textContent = teachers.length ? "请选择任课老师" : "暂无老师，请先添加老师";
  select.appendChild(defaultOpt);

  for (const t of teachers) {
    const opt = document.createElement("option");
    opt.value = String(t.id);
    opt.textContent = `${t.id} - ${t.name ?? ""}`;
    select.appendChild(opt);
  }

  return teachers.length > 0;
}

async function loadCourses() {
  const tbody = document.getElementById("courseTbody");
  const listErrorBox = document.getElementById("listErrorBox");
  tbody.innerHTML = "";
  listErrorBox.textContent = "";

  const res = await fetch("/api/courses", { credentials: "include" });
  if (goLoginIfUnauthorized(res)) return;
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    listErrorBox.textContent = text || `加载课程失败：HTTP ${res.status}`;
    return;
  }

  const courses = await res.json();
  if (!Array.isArray(courses) || courses.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 4;
    td.textContent = "暂无课程信息";
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  for (const c of courses) {
    const teacherName = c.teacherId != null ? (teacherMap.get(c.teacherId) ?? "") : "";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.id ?? ""}</td>
      <td>${escapeHtml(c.name ?? "")}</td>
      <td>${escapeHtml(teacherName)}</td>
      <td>
        <div class="actions">
          <button type="button" class="btn-secondary" data-action="edit" data-id="${c.id}">编辑</button>
          <button type="button" class="btn-danger" data-action="delete" data-id="${c.id}">删除</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  }
}

function setFormForEdit(course) {
  document.getElementById("courseId").value = course.id ?? "";
  document.getElementById("name").value = course.name ?? "";
  document.getElementById("teacherId").value = course.teacherId != null ? String(course.teacherId) : "";
  document.getElementById("submitBtn").textContent = "更新课程";

  if (course.id != null) {
    document.getElementById("courseEnrolledHint").textContent = `当前课程：${course.id}`;
    loadEnrolledStudents(course.id);
  }
}

function resetForm() {
  document.getElementById("courseId").value = "";
  document.getElementById("courseForm").reset();
  document.getElementById("submitBtn").textContent = "新增课程";

  resetEnrolledStudents();
}

async function createOrUpdateCourse(courseId, payload) {
  const errorBox = document.getElementById("errorBox");
  errorBox.textContent = "";

  let res;
  if (courseId) {
    res = await fetch(`/api/courses/${courseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  } else {
    res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  }

  if (goLoginIfUnauthorized(res)) return null;
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `保存失败：HTTP ${res.status}`);
  }

  return res.json().catch(() => null);
}

async function deleteCourse(id) {
  if (!confirm("确定删除该课程吗？")) return;
  const errorBox = document.getElementById("errorBox");
  errorBox.textContent = "";

  const res = await fetch(`/api/courses/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (goLoginIfUnauthorized(res)) return;
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    errorBox.textContent = text || `删除失败：HTTP ${res.status}`;
    return;
  }

  resetForm();
  await loadCourses();
}

document.addEventListener("DOMContentLoaded", async () => {
  resetEnrolledStudents();
  const ok = await loadTeachersForSelect();
  if (!ok) {
    document.getElementById("submitBtn").disabled = true;
    document.getElementById("errorBox").textContent = "暂无老师，先去老师页面添加老师后再管理课程。";
  }

  await loadCourses();

  const form = document.getElementById("courseForm");
  const submitBtn = document.getElementById("submitBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById("errorBox");
    errorBox.textContent = "";

    const courseId = document.getElementById("courseId").value;
    const name = document.getElementById("name").value.trim();
    const teacherIdRaw = document.getElementById("teacherId").value;
    const teacherId = teacherIdRaw ? Number(teacherIdRaw) : null;

    if (!name || !teacherId) {
      errorBox.textContent = "请填写课程名称，并选择任课老师。";
      return;
    }

    submitBtn.disabled = true;
    try {
      await createOrUpdateCourse(courseId, { name, teacherId });
      resetForm();
      await loadTeachersForSelect();
      await loadCourses();
    } catch (err) {
      errorBox.textContent = err?.message || String(err);
    } finally {
      submitBtn.disabled = false;
    }
  });

  document.getElementById("courseTbody").addEventListener("click", (e) => {
    const btn = e.target?.closest?.("button[data-action]");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const id = btn.getAttribute("data-id");
    if (!id) return;

    if (action === "edit") {
      const tr = btn.closest("tr");
      const cells = tr?.children;
      // 课程表里没有 teacherId，我们从“任课老师显示列”无法反推 teacherId。
      // 因此这里发起一次 getById，再填充表单。
      (async () => {
        try {
          const res = await fetch(`/api/courses/${id}`, { credentials: "include" });
          if (goLoginIfUnauthorized(res)) return;
          if (!res.ok) throw new Error(`获取课程失败：HTTP ${res.status}`);
          const course = await res.json();
          setFormForEdit(course);
          window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
          document.getElementById("errorBox").textContent = err?.message || String(err);
        }
      })();
    } else if (action === "delete") {
      deleteCourse(id);
    }
  });
});

