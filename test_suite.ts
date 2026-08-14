import { db } from "./server/db";
import { users, familyMembers, alerts, activities, reminders, caregiverNotes, patientSummaries } from "./shared/schema";
import { eq } from "drizzle-orm";

const BASE_URL = process.env.TEST_URL || "http://localhost:5055";

interface TestResult {
  category: string;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function recordTest(category: string, name: string, passed: boolean, details?: string) {
  results.push({ category, name, passed, details });
  const icon = passed ? "✓" : "✗";
  console.log(`  [${icon}] ${category} :: ${name} ${details ? `(${details})` : ""}`);
}

async function runTestSuite() {
  console.log(`\n==================================================`);
  console.log(`   COGNITIVEFLOW PHASE 13 AUDIT & TEST SUITE     `);
  console.log(`   Target URL: ${BASE_URL}`);
  console.log(`==================================================\n`);

  let cookieJarPatient = "";
  let cookieJarCaregiver = "";
  let cookieJarUserB = "";

  // --------------------------------------------------
  // 1. HEALTH CHECK & SECURITY HEADERS AUDIT
  // --------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    const nosniff = res.headers.get("x-content-type-options") === "nosniff";
    const xframe = res.headers.get("x-frame-options") === "DENY";

    recordTest("Server Reliability", "Health Check GET /api/health", res.status === 200 && data.status === "ok", `Status ${res.status}`);
    recordTest("Security Headers", "X-Content-Type-Options: nosniff present", nosniff);
    recordTest("Security Headers", "X-Frame-Options: DENY present", xframe);
  } catch (e: any) {
    recordTest("Server Reliability", "Health Check GET /api/health", false, `Failed to reach server: ${e.message}`);
    process.exit(1);
  }

  // --------------------------------------------------
  // 2. AUTHENTICATION & CAREGIVER LOGIN
  // --------------------------------------------------
  try {
    // Patient Login
    const resPat = await fetch(`${BASE_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "patient", password: "password123" })
    });
    const patCookie = resPat.headers.get("set-cookie");
    if (patCookie) cookieJarPatient = patCookie.split(";")[0];
    const patData = await resPat.json();
    recordTest("Authentication", "Patient login succeeds", resPat.status === 200 && patData.role === "patient");

    // Caregiver Login
    const resCg = await fetch(`${BASE_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "caregiver", password: "password123" })
    });
    const cgCookie = resCg.headers.get("set-cookie");
    if (cgCookie) cookieJarCaregiver = cgCookie.split(";")[0];
    const cgData = await resCg.json();
    recordTest("Authentication", "Caregiver login succeeds", resCg.status === 200 && cgData.role === "caregiver");
  } catch (e: any) {
    recordTest("Authentication", "Login verification", false, e.message);
  }

  // --------------------------------------------------
  // 3. PHASE 13: ACTIVITIES REST API CRUD
  // --------------------------------------------------
  let createdActivityId = "";
  try {
    // GET Activities
    const getRes = await fetch(`${BASE_URL}/api/activities`, {
      headers: { Cookie: cookieJarCaregiver }
    });
    const getList = await getRes.json();
    recordTest("Activities API", "GET /api/activities returns array", getRes.status === 200 && Array.isArray(getList));

    // POST Create Activity
    const postRes = await fetch(`${BASE_URL}/api/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieJarCaregiver },
      body: JSON.stringify({
        activityName: "Test Physical Therapy",
        description: "Leg stretches & balance practice",
        category: "Exercise",
        time: "11:00 AM",
        duration: "30 mins",
        priority: "HIGH",
        status: "upcoming"
      })
    });
    const actCreated = await postRes.json();
    createdActivityId = actCreated.id;
    recordTest("Activities API", "POST /api/activities creates activity", postRes.status === 201 && actCreated.activityName === "Test Physical Therapy");

    // PATCH Update Activity
    const patchRes = await fetch(`${BASE_URL}/api/activities/${createdActivityId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookieJarCaregiver },
      body: JSON.stringify({ status: "completed" })
    });
    const actUpdated = await patchRes.json();
    recordTest("Activities API", "PATCH /api/activities/:id updates status", patchRes.status === 200 && actUpdated.status === "completed");

    // DELETE Activity
    const delRes = await fetch(`${BASE_URL}/api/activities/${createdActivityId}`, {
      method: "DELETE",
      headers: { Cookie: cookieJarCaregiver }
    });
    recordTest("Activities API", "DELETE /api/activities/:id removes activity", delRes.status === 200);
  } catch (e: any) {
    recordTest("Activities API", "Activities CRUD suite", false, e.message);
  }

  // --------------------------------------------------
  // 4. PHASE 13: REMINDERS REST API CRUD
  // --------------------------------------------------
  let createdReminderId = "";
  try {
    // GET Reminders
    const getRes = await fetch(`${BASE_URL}/api/reminders`, {
      headers: { Cookie: cookieJarCaregiver }
    });
    const getList = await getRes.json();
    recordTest("Reminders API", "GET /api/reminders returns array", getRes.status === 200 && Array.isArray(getList));

    // POST Create Reminder
    const postRes = await fetch(`${BASE_URL}/api/reminders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieJarCaregiver },
      body: JSON.stringify({
        title: "Test Hydration Reminder",
        description: "Drink 250ml water",
        date: new Date().toISOString().split("T")[0],
        time: "03:00 PM",
        priority: "MEDIUM",
        recurrence: "Daily",
        status: "UPCOMING"
      })
    });
    const remCreated = await postRes.json();
    createdReminderId = remCreated.id;
    recordTest("Reminders API", "POST /api/reminders creates recurring reminder", postRes.status === 201 && remCreated.recurrence === "Daily");

    // DELETE Reminder
    const delRes = await fetch(`${BASE_URL}/api/reminders/${createdReminderId}`, {
      method: "DELETE",
      headers: { Cookie: cookieJarCaregiver }
    });
    recordTest("Reminders API", "DELETE /api/reminders/:id removes reminder", delRes.status === 200);
  } catch (e: any) {
    recordTest("Reminders API", "Reminders CRUD suite", false, e.message);
  }

  // --------------------------------------------------
  // 5. PHASE 13: CAREGIVER NOTES & PRIVACY ISOLATION
  // --------------------------------------------------
  let privateNoteId = "";
  let publicNoteId = "";
  try {
    // POST Create Private Caregiver Note
    const postPriv = await fetch(`${BASE_URL}/api/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieJarCaregiver },
      body: JSON.stringify({ noteText: "Caregiver Private observation note", isPrivate: true })
    });
    const notePrivData = await postPriv.json();
    privateNoteId = notePrivData.id;

    // POST Create Public Patient-Visible Note
    const postPub = await fetch(`${BASE_URL}/api/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieJarCaregiver },
      body: JSON.stringify({ noteText: "Patient visible memory note", isPrivate: false })
    });
    const notePubData = await postPub.json();
    publicNoteId = notePubData.id;

    // GET Notes as Caregiver -> sees both
    const cgNotesRes = await fetch(`${BASE_URL}/api/notes`, { headers: { Cookie: cookieJarCaregiver } });
    const cgNotesList = await cgNotesRes.json();
    recordTest("Caregiver Notes", "Caregiver GET /api/notes retrieves all notes (private + public)", cgNotesRes.status === 200 && cgNotesList.some((n: any) => n.isPrivate));

    // GET Notes as Patient -> sees ONLY public notes
    const patNotesRes = await fetch(`${BASE_URL}/api/notes`, { headers: { Cookie: cookieJarPatient } });
    const patNotesList = await patNotesRes.json();
    const containsPrivate = patNotesList.some((n: any) => n.isPrivate === true);
    recordTest("Caregiver Notes Privacy", "Patient GET /api/notes excludes caregiver private notes", patNotesRes.status === 200 && !containsPrivate);

    // Cleanup notes
    await fetch(`${BASE_URL}/api/notes/${privateNoteId}`, { method: "DELETE", headers: { Cookie: cookieJarCaregiver } });
    await fetch(`${BASE_URL}/api/notes/${publicNoteId}`, { method: "DELETE", headers: { Cookie: cookieJarCaregiver } });
  } catch (e: any) {
    recordTest("Caregiver Notes", "Caregiver Notes test suite", false, e.message);
  }

  // --------------------------------------------------
  // 6. GEMINI CONTEXT INTEGRATION TEST
  // --------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieJarPatient },
      body: JSON.stringify({ question: "What activities and reminders do I have today?" })
    });
    const data = await res.json();
    recordTest("Gemini Context", "Gemini receives care plan & activities context", res.status === 200 && typeof data.response === "string" && data.response.length > 5);
  } catch (e: any) {
    recordTest("Gemini Context", "Gemini context integration", false, e.message);
  }

  // --------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  console.log(`\n==================================================`);
  console.log(`   TEST SUITE COMPLETE`);
  console.log(`   Total Tests : ${total}`);
  console.log(`   Passed      : ${passed}`);
  console.log(`   Failed      : ${failed}`);
  console.log(`==================================================\n`);

  if (failed > 0) {
    console.error("Test failures detected!");
    process.exit(1);
  } else {
    console.log("ALL PHASE 13 TESTS PASSED PERFECTLY!");
    process.exit(0);
  }
}

runTestSuite().catch(err => {
  console.error("Test Suite execution exception:", err);
  process.exit(1);
});
