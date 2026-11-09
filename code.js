"use strict";

// ==========================================
// STUDY BUDDY - SUPABASE APPLICATION
// ==========================================

const db = window.supabaseClient;

if (!db) {
  alert("Supabase connection failed. Check config.js.");
}

// ==========================================
// ELEMENTS
// ==========================================

const $ = (id) => document.getElementById(id);

const authSection = $("authSection");
const dashboard = $("dashboard");
const authForm = $("authForm");
const fullName = $("fullName");
const email = $("email");
const password = $("password");
const authSubmit = $("authSubmit");
const authMessage = $("authMessage");
const logoutBtn = $("logoutBtn");

let currentProfile = null;
let authMode = "login";

// ==========================================
// TAMIL NADU HIGHER SECONDARY GROUPS
// ==========================================

const groups = {
  "2501": ["Physics", "Chemistry", "Statistics", "Mathematics"],
  "2502": ["Physics", "Chemistry", "Computer Science", "Mathematics"],
  "2503": ["Physics", "Chemistry", "Biology", "Mathematics"],
  "2504": ["Physics", "Chemistry", "Bio-Chemistry", "Mathematics"],
  "2505": ["Physics", "Chemistry", "Communicative English", "Mathematics"],
  "2506": ["Physics", "Chemistry", "Mathematics", "Home Science"],

  "2601": ["Physics", "Chemistry", "Biology", "Computer Science"],
  "2602": ["Physics", "Chemistry", "Biology", "Micro-Biology"],
  "2603": ["Physics", "Chemistry", "Biology", "Bio-Chemistry"],
  "2604": ["Physics", "Chemistry", "Biology", "General Nursing"],
  "2605": ["Physics", "Chemistry", "Biology", "Nutrition and Dietetics"],
  "2606": ["Physics", "Chemistry", "Biology", "Communicative English"],
  "2607": ["Physics", "Chemistry", "Biology", "Home Science"],
  "2608": ["Physics", "Chemistry", "Botany", "Zoology"],

  "2701": ["Statistics", "Economics", "Commerce", "Accountancy"],
  "2702": ["Economics", "Commerce", "Accountancy", "Computer Applications"],
  "2703": ["Communicative English", "Economics", "Commerce", "Accountancy"],
  "2704": ["History", "Economics", "Commerce", "Accountancy"],
  "2705": ["Economics", "Political Science", "Commerce", "Accountancy"],
  "2706": ["Economics", "Commerce", "Accountancy", "Ethics and Indian Culture"],
  "2707": ["Economics", "Commerce", "Accountancy", "Advanced Language (Tamil)"],
  "2708": ["Economics", "Commerce", "Accountancy", "Business Mathematics and Statistics"],

  "2801": ["Statistics", "Geography", "History", "Economics"],
  "2802": ["Geography", "History", "Economics", "Computer Applications"],
  "2803": ["Geography", "Communicative English", "History", "Economics"],
  "2804": ["Geography", "History", "Economics", "Political Science"],
  "2805": ["Geography", "History", "Economics", "Ethics and Indian Culture"],
  "2806": ["Geography", "History", "Economics", "Advanced Language (Tamil)"],

  "2921": ["Mathematics", "Basic Mechanical Engineering (Theory)", "Computer Technology", "Basic Mechanical Engineering (Practical)"],
  "2922": ["Mathematics", "Basic Electrical Engineering (Theory)", "Computer Technology", "Basic Electrical Engineering (Practical)"],
  "2923": ["Mathematics", "Basic Electronics Engineering (Theory)", "Computer Technology", "Basic Electronics Engineering (Practical)"],
  "2924": ["Mathematics", "Basic Civil Engineering (Theory)", "Computer Technology", "Basic Civil Engineering (Practical)"],
  "2925": ["Mathematics", "Basic Automobile Engineering (Theory)", "Computer Technology", "Basic Automobile Engineering (Practical)"],
  "2926": ["Mathematics", "Textile Technology (Theory)", "Computer Technology", "Textile Technology (Practical)"],

  "2931": ["Biology", "Nursing (Vocational) (Theory)", "Computer Technology", "Nursing (Vocational) (Practical)"],

  "2941": ["Home Science", "Textile and Dress Designing (Theory)", "Computer Technology", "Textile and Dress Designing (Practical)"],
  "2942": ["Home Science", "Food Service Management (Theory)", "Computer Technology", "Food Service Management (Practical)"],

  "2951": ["Biology", "Agricultural Science (Theory)", "Computer Technology", "Agricultural Science (Practical)"],

  "2961": ["Commerce", "Accountancy (Theory)", "Office Management and Secretaryship (Theory)", "Typography and Computer Applications (Practical)"],
  "2962": ["Commerce", "Accountancy (Theory)", "Computer Applications", "Auditing (Practical)"]
};

// ==========================================
// AUTHENTICATION
// ==========================================

$("loginTab").addEventListener("click", () => {
  authMode = "login";
  fullName.hidden = true;
  fullName.required = false;
  password.autocomplete = "current-password";
  authSubmit.textContent = "Login";
  authMessage.textContent = "";
});

$("registerTab").addEventListener("click", () => {
  authMode = "register";
  fullName.hidden = false;
  fullName.required = true;
  password.autocomplete = "new-password";
  authSubmit.textContent = "Create account";
  authMessage.textContent = "";
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  authSubmit.disabled = true;
  authMessage.textContent = "Please wait...";

  try {
    const userEmail = email.value.trim();
    const userPassword = password.value;

    if (authMode === "register") {
      const name = fullName.value.trim();

      if (!name) {
        throw new Error("Enter your full name.");
      }

      const { data, error } = await db.auth.signUp({
        email: userEmail,
        password: userPassword,
        options: {
          data: {
            full_name: name
          }
        }
      });

      if (error) throw error;

      if (data.session) {
        authMessage.textContent = "Account created successfully.";
        await showDashboard(data.user);
      } else {
        authMessage.textContent =
          "Account created. Check your email to confirm your account, then log in.";
      }

    } else {
      const { data, error } = await db.auth.signInWithPassword({
        email: userEmail,
        password: userPassword
      });

      if (error) throw error;

      await showDashboard(data.user);
    }

  } catch (error) {
    authMessage.textContent = error.message;
  } finally {
    authSubmit.disabled = false;
  }
});

// ==========================================
// LOAD PROFILE AND DASHBOARD
// ==========================================

async function showDashboard(user) {
  const { data: profile, error } = await db
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    authMessage.textContent =
      "Profile could not be loaded: " + error.message;
    return;
  }

  currentProfile = profile;

  authSection.hidden = true;
  dashboard.hidden = false;
  logoutBtn.hidden = false;

  $("studentInfo").textContent =
    "Name: " + (profile.full_name || "Student") +
    " | Student ID: " + profile.student_id;

  $("studentRole").textContent =
    "Account type: " + profile.role;

  $("adminPanel").hidden = profile.role !== "admin";

  setupLibrary();
}

// ==========================================
// SESSION RESTORATION
// ==========================================

async function checkSession() {
  const { data, error } = await db.auth.getSession();

  if (error) {
    authMessage.textContent = error.message;
    return;
  }

  if (data.session) {
    await showDashboard(data.session.user);
  }
}

checkSession();

// ==========================================
// LOGOUT
// ==========================================

logoutBtn.addEventListener("click", async () => {
  const { error } = await db.auth.signOut();

  if (error) {
    alert(error.message);
    return;
  }

  currentProfile = null;
  dashboard.hidden = true;
  authSection.hidden = false;
  logoutBtn.hidden = true;
});

// ==========================================
// TEXTBOOK LIBRARY
// ==========================================

const classSelect = $("classSelect");
const mediumSelect = $("mediumSelect");
const groupSelect = $("groupSelect");
const subjectSelect = $("subjectSelect");
const groupArea = $("groupArea");

const class10Subjects = [
  "Tamil",
  "English",
  "Mathematics",
  "Science",
  "Social Science"
];

function setupLibrary() {
  populateGroups();
  updateSubjects();

  classSelect.addEventListener("change", () => {
    populateGroups();
    updateSubjects();
    saveAcademicSelection();
  });

  mediumSelect.addEventListener("change", saveAcademicSelection);

  groupSelect.addEventListener("change", () => {
    updateSubjects();
    saveAcademicSelection();
  });

  subjectSelect.addEventListener("change", saveAcademicSelection);
}

function populateGroups() {
  const isHigherSecondary =
    classSelect.value === "+1" ||
    classSelect.value === "+2";

  groupArea.hidden = !isHigherSecondary;

  groupSelect.innerHTML = "";

  Object.keys(groups).forEach(code => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent =
      code + " — " + groups[code].join(", ");

    groupSelect.appendChild(option);
  });
}

function updateSubjects() {
  let subjects = class10Subjects;

  if (classSelect.value !== "10") {
    subjects = groups[groupSelect.value] || [];
  }

  subjectSelect.innerHTML = "";

  subjects.forEach(subject => {
    const option = document.createElement("option");
    option.value = subject;
    option.textContent = subject;
    subjectSelect.appendChild(option);
  });
}

// Save the student's academic selection to their own profile.
async function saveAcademicSelection() {
  if (!currentProfile) return;

  const selectedClass = classSelect.value;
  const selectedGroup =
    selectedClass === "10" ? null : groupSelect.value;

  const { error } = await db
    .from("profiles")
    .update({
      class_level: selectedClass,
      medium: mediumSelect.value,
      group_code: selectedGroup
    })
    .eq("id", currentProfile.id);

  if (error) {
    console.error("Academic profile update:", error.message);
    $("bookMessage").textContent =
      "Selection could not be saved: " + error.message;
    return;
  }

  currentProfile.class_level = selectedClass;
  currentProfile.medium = mediumSelect.value;
  currentProfile.group_code = selectedGroup;
}

// ==========================================
// OFFICIAL TEXTBOOK PORTAL
// ==========================================

$("openBook").addEventListener("click", () => {
  const selectedClass = classSelect.value;
  const medium = mediumSelect.value;
  const subject = subjectSelect.value;
  const volume = $("volumeSelect").value;

  const group =
    selectedClass === "10" ? "Not applicable" : groupSelect.value;

  const message =
    "Selected textbook:\n" +
    "Class: " + selectedClass + "\n" +
    "Medium: " + medium + "\n" +
    "Group: " + group + "\n" +
    "Subject: " + subject + "\n" +
    "Volume: " + volume + "\n\n" +
    "The direct PDF catalogue is not yet configured. " +
    "Opening the official Tamil Nadu textbook portal.";

  $("bookMessage").textContent = message;

  window.open(
    "https://textbookcorp.in/textbook/",
    "_blank",
    "noopener,noreferrer"
  );
});

// ==========================================
// ADMIN DASHBOARD
// ==========================================

$("loadStudents").addEventListener("click", loadStudents);

async function loadStudents() {
  if (!currentProfile || currentProfile.role !== "admin") {
    alert("Administrator access required.");
    return;
  }

  const output = $("studentsList");
  output.textContent = "Loading students...";

  const { data, error } = await db
    .from("profiles")
    .select(
      "student_id, full_name, class_level, medium, group_code, role, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    output.textContent = "Error: " + error.message;
    return;
  }

  output.innerHTML = "";

  if (!data.length) {
    output.textContent = "No student profiles found.";
    return;
  }

  data.forEach(student => {
    const item = document.createElement("div");
    item.className = "item";

    const name = document.createElement("strong");
    name.textContent = student.full_name || "Unnamed student";

    const details = document.createElement("p");
    details.textContent =
      "Student ID: " + student.student_id +
      " | Class: " + (student.class_level || "Not selected") +
      " | Medium: " + (student.medium || "Not selected") +
      " | Group: " + (student.group_code || "N/A") +
      " | Role: " + student.role;

    item.append(name, details);
    output.appendChild(item);
  });
}

// ==========================================
// NOTES AND PLANNER STATUS
// ==========================================

$("saveNote").addEventListener("click", () => {
  alert(
    "Notes database integration is pending. " +
    "Your existing table columns must be checked first."
  );
});

$("savePlan").addEventListener("click", () => {
  alert(
    "Study Planner database integration is pending. " +
    "Your existing table columns must be checked first."
  );
});

console.log("Study Buddy application loaded.");
                               
