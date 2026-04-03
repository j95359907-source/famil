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

async function loadTeachers() {
  const tbody = document.getElementById("teacherTbody");
  const listErrorBox = document.getElementById("listErrorBox");
  listErrorBox.textContent = "";
  tbody.innerHTML = "";

  try {
    const res = await fetch("/api/teachers", { credentials: "include" });
    if (goLoginIfUnauthorized(res)) return;

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `加载老师失败：HTTP ${res.status}`);
    }

    const teachers = await res.json();
    if (!Array.isArray(teachers) || teachers.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      td.textContent = "暂无老师信息";
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    for (const t of teachers) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${t.id ?? ""}</td>
        <td>${escapeHtml(t.name ?? "")}</td>
        <td>${escapeHtml(t.subject ?? "")}</td>
        <td>
          <div class="actions">
            <button type="button" class="btn-secondary" data-action="edit" data-id="${t.id}">编辑</button>
            <button type="button" class="btn-danger" data-action="delete" data-id="${t.id}">删除</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    }
  } catch (err) {
    listErrorBox.textContent = err?.message || String(err);
  }
}

function setFormForEdit(teacher) {
  document.getElementById("teacherId").value = teacher.id ?? "";
  document.getElementById("name").value = teacher.name ?? "";
  document.getElementById("subject").value = teacher.subject ?? "";
  document.getElementById("submitBtn").textContent = "更新老师";
}

function resetForm() {
  document.getElementById("teacherId").value = "";
  document.getElementById("teacherForm").reset();
  document.getElementById("submitBtn").textContent = "新增老师";
}

async function createOrUpdateTeacher(teacherId, payload) {
  const errorBox = document.getElementById("errorBox");
  errorBox.textContent = "";

  let res;
  if (teacherId) {
    res = await fetch(`/api/teachers/${teacherId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  } else {
    res = await fetch("/api/teachers", {
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

async function deleteTeacher(id) {
  if (!confirm("确定删除该老师吗？")) return;
  const errorBox = document.getElementById("errorBox");
  errorBox.textContent = "";

  const res = await fetch(`/api/teachers/${id}`, {
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
  await loadTeachers();
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("teacherForm");
  const errorBox = document.getElementById("errorBox");
  const submitBtn = document.getElementById("submitBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.textContent = "";

    const teacherId = document.getElementById("teacherId").value;
    const name = document.getElementById("name").value.trim();
    const subject = document.getElementById("subject").value.trim();
    if (!name || !subject) {
      errorBox.textContent = "请填写完整的姓名和任教科目。";
      return;
    }

    submitBtn.disabled = true;
    try {
      await createOrUpdateTeacher(teacherId, { name, subject });
      resetForm();
      await loadTeachers();
    } catch (err) {
      errorBox.textContent = err?.message || String(err);
    } finally {
      submitBtn.disabled = false;
    }
  });

  document.getElementById("teacherTbody").addEventListener("click", (e) => {
    const btn = e.target?.closest?.("button[data-action]");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const id = btn.getAttribute("data-id");

    if (action === "edit") {
      const tr = btn.closest("tr");
      const cells = tr?.children;
      setFormForEdit({
        id: Number(cells?.[0]?.textContent),
        name: cells?.[1]?.textContent,
        subject: cells?.[2]?.textContent,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (action === "delete") {
      deleteTeacher(id);
    }
  });

  loadTeachers();
});

