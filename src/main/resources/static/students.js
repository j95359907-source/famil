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

let teacherMapForCourses = new Map();

async function loadTeachersForCourses() {
  teacherMapForCourses = new Map();
  const res = await fetch("/api/teachers", { credentials: "include" });
  if (goLoginIfUnauthorized(res)) return false;
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `加载老师失败：HTTP ${res.status}`);
  }
  const teachers = await res.json();
  if (!Array.isArray(teachers)) return false;
  for (const t of teachers) {
    teacherMapForCourses.set(t.id, t.name ?? "");
  }
  return true;
}

async function loadCoursesForSelect() {
  const select = document.getElementById("courseIdSelect");
  select.innerHTML = "";

  const res = await fetch("/api/courses", { credentials: "include" });
  if (goLoginIfUnauthorized(res)) return false;
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `加载课程失败：HTTP ${res.status}`);
  }
  const courses = await res.json();
  if (!Array.isArray(courses) || courses.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "暂无课程";
    select.appendChild(opt);
    return false;
  }

  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.textContent = "请选择课程";
  select.appendChild(defaultOpt);

  for (const c of courses) {
    const teacherName = c.teacherId != null ? (teacherMapForCourses.get(c.teacherId) ?? "") : "";
    const opt = document.createElement("option");
    opt.value = String(c.id);
    opt.textContent = `${c.name ?? ""} - ${teacherName}`;
    select.appendChild(opt);
  }

  return true;
}

function resetChooseSection() {
  document.getElementById("chooseHint").textContent = "当前学生：未选择";
  document.getElementById("chooseBtn").disabled = true;
  document.getElementById("refreshEnrolledBtn").disabled = true;
  document.getElementById("courseIdSelect").disabled = true;
  document.getElementById("chooseErrorBox").textContent = "";
  document.getElementById("enrolledListErrorBox").textContent = "";
  document.getElementById("enrolledCoursesTbody").innerHTML = "";
}

async function loadEnrolledCourses(studentId) {
  const tbody = document.getElementById("enrolledCoursesTbody");
  const listErrorBox = document.getElementById("enrolledListErrorBox");
  tbody.innerHTML = "";
  listErrorBox.textContent = "";

  const res = await fetch(`/api/enrollments/students/${studentId}`, { credentials: "include" });
  if (goLoginIfUnauthorized(res)) return;
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    listErrorBox.textContent = text || `加载已选课程失败：HTTP ${res.status}`;
    return;
  }

  const courses = await res.json();
  if (!Array.isArray(courses) || courses.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 4;
    td.textContent = "暂无已选课程";
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  for (const c of courses) {
    const teacherName = c.teacherId != null ? (teacherMapForCourses.get(c.teacherId) ?? "") : "";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.id ?? ""}</td>
      <td>${escapeHtml(c.name ?? "")}</td>
      <td>${escapeHtml(teacherName)}</td>
      <td>
        <button type="button" class="btn-danger" data-action="unenroll" data-course-id="${c.id}">退选</button>
      </td>
    `;
    tbody.appendChild(tr);
  }
}

async function enrollCourse(studentId, courseId) {
  const errorBox = document.getElementById("chooseErrorBox");
  errorBox.textContent = "";

  const res = await fetch("/api/enrollments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ studentId, courseId }),
  });

  if (goLoginIfUnauthorized(res)) return false;
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    errorBox.textContent = text || `选课失败：HTTP ${res.status}`;
    return false;
  }
  return true;
}

async function unenrollCourse(studentId, courseId) {
  const errorBox = document.getElementById("chooseErrorBox");
  errorBox.textContent = "";

  const res = await fetch(`/api/enrollments/students/${studentId}/courses/${courseId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (goLoginIfUnauthorized(res)) return false;
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    errorBox.textContent = text || `退选失败：HTTP ${res.status}`;
    return false;
  }
  return true;
}

async function loadStudents() {
  const tbody = document.getElementById("studentTbody");
  const listErrorBox = document.getElementById("listErrorBox");
  tbody.innerHTML = "";
  listErrorBox.textContent = "";

  try {
    const res = await fetch("/api/students", { credentials: "include" });
    if (goLoginIfUnauthorized(res)) return;
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `加载学生失败：HTTP ${res.status}`);
    }

    const students = await res.json();
    if (!Array.isArray(students) || students.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      td.textContent = "暂无学生信息";
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
        <td>
          <div class="actions">
            <button type="button" class="btn-secondary" data-action="edit" data-id="${s.id}">编辑</button>
            <button type="button" class="btn-secondary" data-action="choose" data-id="${s.id}">选课</button>
            <button type="button" class="btn-danger" data-action="delete" data-id="${s.id}">删除</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    }
  } catch (err) {
    listErrorBox.textContent = err?.message || String(err);
  }
}

function setFormForEdit(student) {
  document.getElementById("studentId").value = student.id ?? "";
  document.getElementById("name").value = student.name ?? "";
  document.getElementById("age").value = student.age ?? "";
  document.getElementById("submitBtn").textContent = "更新学生";

  // 同步选课区域（不强制滚动到选课区域）
  if (student.id != null) {
    document.getElementById("chooseHint").textContent = `当前学生：${student.id}`;
    document.getElementById("chooseBtn").disabled = false;
    document.getElementById("refreshEnrolledBtn").disabled = false;
    document.getElementById("courseIdSelect").disabled = false;
    loadEnrolledCourses(student.id);
  }
}

function resetForm() {
  document.getElementById("studentId").value = "";
  document.getElementById("studentForm").reset();
  document.getElementById("submitBtn").textContent = "新增学生";

  // 同步选课区域
  resetChooseSection();
}

async function createOrUpdateStudent(studentId, payload) {
  const errorBox = document.getElementById("errorBox");
  errorBox.textContent = "";

  let res;
  if (studentId) {
    res = await fetch(`/api/students/${studentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  } else {
    res = await fetch("/api/students", {
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

async function deleteStudent(id) {
  if (!confirm("确定删除该学生吗？")) return;
  const errorBox = document.getElementById("errorBox");
  errorBox.textContent = "";

  const res = await fetch(`/api/students/${id}`, {
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
  await loadStudents();
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("studentForm");
  const submitBtn = document.getElementById("submitBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById("errorBox");
    errorBox.textContent = "";

    const studentId = document.getElementById("studentId").value;
    const name = document.getElementById("name").value.trim();
    const age = document.getElementById("age").value;

    if (!name || !age) {
      errorBox.textContent = "请填写完整的姓名和年龄。";
      return;
    }

    submitBtn.disabled = true;
    try {
      const payload = { name, age: Number(age) };
      await createOrUpdateStudent(studentId, payload);
      resetForm();
      await loadStudents();
    } catch (err) {
      errorBox.textContent = err?.message || String(err);
    } finally {
      submitBtn.disabled = false;
    }
  });

  document.getElementById("studentTbody").addEventListener("click", (e) => {
    const btn = e.target?.closest?.("button[data-action]");
    if (!btn) return;
    const action = btn.getAttribute("data-action");
    const id = btn.getAttribute("data-id");
    if (!id) return;

    if (action === "edit") {
      // 直接从按钮所在行读取数据
      const tr = btn.closest("tr");
      const cells = tr?.children;
      const student = {
        id: Number(cells?.[0]?.textContent),
        name: cells?.[1]?.textContent,
        age: Number(cells?.[2]?.textContent),
      };
      setFormForEdit(student);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (action === "choose") {
      // 只设置选课所需的 studentId，不改变学生编辑表单内容
      const studentId = Number(id);
      document.getElementById("studentId").value = studentId;
      document.getElementById("chooseHint").textContent = `当前学生：${studentId}`;
      document.getElementById("chooseBtn").disabled = false;
      document.getElementById("refreshEnrolledBtn").disabled = false;
      document.getElementById("courseIdSelect").disabled = false;
      loadEnrolledCourses(studentId);
    } else if (action === "delete") {
      deleteStudent(id);
    }
  });

  // 初始化选课区域按钮状态
  resetChooseSection();

  document.getElementById("chooseBtn").addEventListener("click", async () => {
    const studentId = document.getElementById("studentId").value;
    const courseId = document.getElementById("courseIdSelect").value;
    if (!studentId) {
      document.getElementById("chooseErrorBox").textContent = "请先选择学生。";
      return;
    }
    if (!courseId) {
      document.getElementById("chooseErrorBox").textContent = "请选择课程。";
      return;
    }

    const ok = await enrollCourse(Number(studentId), Number(courseId));
    if (!ok) return;
    await loadEnrolledCourses(Number(studentId));
  });

  document.getElementById("refreshEnrolledBtn").addEventListener("click", async () => {
    const studentId = document.getElementById("studentId").value;
    if (!studentId) return;
    await loadEnrolledCourses(Number(studentId));
  });

  document.getElementById("enrolledCoursesTbody").addEventListener("click", async (e) => {
    const btn = e.target?.closest?.("button[data-action='unenroll']");
    if (!btn) return;

    const studentId = document.getElementById("studentId").value;
    const courseId = btn.getAttribute("data-course-id");
    if (!studentId || !courseId) return;

    const ok = await unenrollCourse(Number(studentId), Number(courseId));
    if (!ok) return;
    await loadEnrolledCourses(Number(studentId));
  });

  (async () => {
    await loadStudents();
    await loadTeachersForCourses();
    await loadCoursesForSelect();
  })();
});

