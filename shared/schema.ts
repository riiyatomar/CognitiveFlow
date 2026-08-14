import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("patient"), // "patient" | "caregiver"
  patientId: text("patient_id"), // caregiver's authorized patient
});

export const familyMembers = pgTable("family_members", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  relationship: text("relationship").notNull(),
  avatar: text("avatar"),
  lastContact: text("last_contact").notNull(),
  notes: text("notes").notNull(),
  phoneNumber: text("phone_number"),
});

export const alerts = pgTable("alerts", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  type: text("type").notNull(), // 'info' | 'warning' | 'success'
  message: text("message").notNull(),
  time: text("time").notNull(),
  resolved: boolean("resolved").default(false).notNull(),
  priority: text("priority").default("MEDIUM").notNull(), // 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  acknowledged: boolean("acknowledged").default(false).notNull(),
});

export const activities = pgTable("activities", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  activityName: text("activity_name").notNull(),
  description: text("description"),
  category: text("category").default("Personal").notNull(),
  date: text("date"),
  time: text("time").notNull(),
  duration: text("duration"),
  priority: text("priority").default("MEDIUM").notNull(),
  status: text("status").notNull(), // 'completed' | 'missed' | 'upcoming'
});

export const reminders = pgTable("reminders", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  date: text("date").notNull(),
  time: text("time").notNull(),
  priority: text("priority").default("MEDIUM").notNull(),
  recurrence: text("recurrence").default("Once").notNull(),
  status: text("status").default("UPCOMING").notNull(),
  createdAt: text("created_at").notNull(),
});

export const caregiverNotes = pgTable("caregiver_notes", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  caregiverId: text("caregiver_id").notNull(),
  noteText: text("note_text").notNull(),
  dateTime: text("date_time").notNull(),
  isPrivate: boolean("is_private").default(false).notNull(),
});

export const patientSummaries = pgTable("patient_summaries", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  patientName: text("patient_name").notNull(),
  lastActive: text("last_active").notNull(),
  faceRecognitionSuccessRate: integer("face_recognition_success_rate").notNull(),
  voiceInteractions: integer("voice_interactions").notNull(),
  dailyActivitiesCompletedRate: integer("daily_activities_completed_rate").notNull(),
  familyCallsThisWeek: integer("family_calls_this_week").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  patientId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertFamilyMemberSchema = createInsertSchema(familyMembers).omit({ id: true });
export type InsertFamilyMember = z.infer<typeof insertFamilyMemberSchema>;
export type FamilyMember = typeof familyMembers.$inferSelect;

export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true });
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;

export const insertActivitySchema = createInsertSchema(activities).omit({ id: true });
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export const insertReminderSchema = createInsertSchema(reminders).omit({ id: true });
export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = typeof reminders.$inferSelect;

export const insertCaregiverNoteSchema = createInsertSchema(caregiverNotes).omit({ id: true });
export type InsertCaregiverNote = z.infer<typeof insertCaregiverNoteSchema>;
export type CaregiverNote = typeof caregiverNotes.$inferSelect;

export const insertPatientSummarySchema = createInsertSchema(patientSummaries).omit({ id: true });
export type InsertPatientSummary = z.infer<typeof insertPatientSummarySchema>;
export type PatientSummary = typeof patientSummaries.$inferSelect;
