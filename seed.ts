import { storage } from "./server/storage";
import { hashPassword } from "./server/auth";
import { db } from "./server/db";
import { users, familyMembers, alerts, activities, reminders, caregiverNotes, patientSummaries } from "./shared/schema";

async function seed() {
  console.log("Clearing database...");
  await db.delete(caregiverNotes);
  await db.delete(reminders);
  await db.delete(patientSummaries);
  await db.delete(activities);
  await db.delete(alerts);
  await db.delete(familyMembers);
  await db.delete(users);

  console.log("Creating patient and caregiver users...");
  const patientPassword = await hashPassword("password123");
  const caregiverPassword = await hashPassword("password123");

  const patientUser = await storage.createUser({
    username: "patient",
    password: patientPassword,
    role: "patient",
    patientId: null,
  });

  const caregiverUser = await storage.createUser({
    username: "caregiver",
    password: caregiverPassword,
    role: "caregiver",
    patientId: patientUser.id,
  });

  console.log(`Created Patient ID: ${patientUser.id}`);
  console.log(`Created Caregiver ID: ${caregiverUser.id}`);

  console.log("Seeding patient care management data...");

  const todayStr = new Date().toISOString().split("T")[0];

  // Activities
  await storage.createActivity({
    userId: patientUser.id,
    activityName: "Healthy Breakfast",
    description: "Oatmeal with fresh blueberries and herbal tea",
    category: "Meal",
    date: todayStr,
    time: "08:00 AM",
    duration: "30 mins",
    priority: "MEDIUM",
    status: "completed",
  });

  await storage.createActivity({
    userId: patientUser.id,
    activityName: "Morning Walk & Sunshine",
    description: "30-minute gentle outdoor walk in the garden",
    category: "Exercise",
    date: todayStr,
    time: "10:00 AM",
    duration: "30 mins",
    priority: "HIGH",
    status: "completed",
  });

  await storage.createActivity({
    userId: patientUser.id,
    activityName: "Doctor Checkup Appointment",
    description: "Monthly wellness consultation with Dr. Miller",
    category: "Appointment",
    date: todayStr,
    time: "02:00 PM",
    duration: "45 mins",
    priority: "HIGH",
    status: "upcoming",
  });

  // Reminders
  await storage.createReminder({
    userId: patientUser.id,
    title: "Take Blood Pressure Medication",
    description: "Take 1 tablet with a glass of water after breakfast",
    date: todayStr,
    time: "08:30 AM",
    priority: "HIGH",
    recurrence: "Daily",
    status: "COMPLETED",
    createdAt: new Date().toISOString(),
  });

  await storage.createReminder({
    userId: patientUser.id,
    title: "Hydration Check — Drink Water",
    description: "Have a glass of water to stay hydrated",
    date: todayStr,
    time: "01:00 PM",
    priority: "MEDIUM",
    recurrence: "Daily",
    status: "UPCOMING",
    createdAt: new Date().toISOString(),
  });

  await storage.createReminder({
    userId: patientUser.id,
    title: "Family Video Call with Sarah",
    description: "Weekly catch-up with daughter Sarah",
    date: todayStr,
    time: "05:00 PM",
    priority: "MEDIUM",
    recurrence: "Weekly",
    status: "UPCOMING",
    createdAt: new Date().toISOString(),
  });

  // Caregiver Notes
  await storage.createCaregiverNote({
    userId: patientUser.id,
    caregiverId: caregiverUser.id,
    noteText: "Jane was in great spirits during her morning walk. Completed all breakfast items.",
    dateTime: new Date().toISOString(),
    isPrivate: false, // Visible to patient
  });

  await storage.createCaregiverNote({
    userId: patientUser.id,
    caregiverId: caregiverUser.id,
    noteText: "Caregiver observations: Patient reported mild knee stiffness. Recommended gentle stretching before walking.",
    dateTime: new Date().toISOString(),
    isPrivate: true, // Caregiver private
  });

  // Alerts
  await storage.createAlert({
    userId: patientUser.id,
    type: "info",
    message: "Medication schedule updated for morning routine",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    resolved: false,
    priority: "MEDIUM",
    acknowledged: false,
  });

  // Summary
  await storage.createPatientSummary({
    userId: patientUser.id,
    patientName: "Jane Doe",
    lastActive: new Date().toISOString(),
    faceRecognitionSuccessRate: 95,
    voiceInteractions: 14,
    dailyActivitiesCompletedRate: 85,
    familyCallsThisWeek: 4,
  });

  console.log("Seed complete! You can log in as 'patient' or 'caregiver' with password 'password123'");
  process.exit(0);
}

seed().catch(console.error);
