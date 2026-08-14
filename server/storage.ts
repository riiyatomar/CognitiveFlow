import { 
  type User, 
  type InsertUser, 
  type FamilyMember, 
  type InsertFamilyMember,
  type Alert,
  type InsertAlert,
  type Activity,
  type InsertActivity,
  type Reminder,
  type InsertReminder,
  type CaregiverNote,
  type InsertCaregiverNote,
  type PatientSummary,
  type InsertPatientSummary,
  users,
  familyMembers,
  alerts,
  activities,
  reminders,
  caregiverNotes,
  patientSummaries
} from "../shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getFamilyMembers(userId: string): Promise<FamilyMember[]>;
  createFamilyMember(member: InsertFamilyMember): Promise<FamilyMember>;
  updateFamilyMember(id: string, userId: string, member: Partial<InsertFamilyMember>): Promise<FamilyMember | undefined>;
  deleteFamilyMember(id: string, userId: string): Promise<boolean>;

  getAlerts(userId: string): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: string, userId: string, alert: Partial<InsertAlert>): Promise<Alert | undefined>;
  deleteAlert(id: string, userId: string): Promise<boolean>;

  getActivities(userId: string): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: string, userId: string, activity: Partial<InsertActivity>): Promise<Activity | undefined>;
  deleteActivity(id: string, userId: string): Promise<boolean>;

  getReminders(userId: string): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: string, userId: string, reminder: Partial<InsertReminder>): Promise<Reminder | undefined>;
  deleteReminder(id: string, userId: string): Promise<boolean>;

  getCaregiverNotes(userId: string, isCaregiver: boolean): Promise<CaregiverNote[]>;
  createCaregiverNote(note: InsertCaregiverNote): Promise<CaregiverNote>;
  updateCaregiverNote(id: string, userId: string, note: Partial<InsertCaregiverNote>): Promise<CaregiverNote | undefined>;
  deleteCaregiverNote(id: string, userId: string): Promise<boolean>;

  getPatientSummary(userId: string): Promise<PatientSummary | undefined>;
  createPatientSummary(summary: InsertPatientSummary): Promise<PatientSummary>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Family Members
  async getFamilyMembers(userId: string): Promise<FamilyMember[]> {
    return await db.select().from(familyMembers).where(eq(familyMembers.userId, userId));
  }

  async createFamilyMember(member: InsertFamilyMember): Promise<FamilyMember> {
    const [newMember] = await db.insert(familyMembers).values(member).returning();
    return newMember;
  }

  async updateFamilyMember(id: string, userId: string, member: Partial<InsertFamilyMember>): Promise<FamilyMember | undefined> {
    const [updated] = await db
      .update(familyMembers)
      .set(member)
      .where(and(eq(familyMembers.id, id), eq(familyMembers.userId, userId)))
      .returning();
    return updated;
  }

  async deleteFamilyMember(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(familyMembers)
      .where(and(eq(familyMembers.id, id), eq(familyMembers.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // Alerts
  async getAlerts(userId: string): Promise<Alert[]> {
    return await db.select().from(alerts).where(eq(alerts.userId, userId)).orderBy(desc(alerts.time));
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db.insert(alerts).values(alert).returning();
    return newAlert;
  }

  async updateAlert(id: string, userId: string, alert: Partial<InsertAlert>): Promise<Alert | undefined> {
    const [updated] = await db
      .update(alerts)
      .set(alert)
      .where(and(eq(alerts.id, id), eq(alerts.userId, userId)))
      .returning();
    return updated;
  }

  async deleteAlert(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(alerts)
      .where(and(eq(alerts.id, id), eq(alerts.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // Activities
  async getActivities(userId: string): Promise<Activity[]> {
    return await db.select().from(activities).where(eq(activities.userId, userId)).orderBy(desc(activities.time));
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  async updateActivity(id: string, userId: string, activity: Partial<InsertActivity>): Promise<Activity | undefined> {
    const [updated] = await db
      .update(activities)
      .set(activity)
      .where(and(eq(activities.id, id), eq(activities.userId, userId)))
      .returning();
    return updated;
  }

  async deleteActivity(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(activities)
      .where(and(eq(activities.id, id), eq(activities.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // Reminders
  async getReminders(userId: string): Promise<Reminder[]> {
    return await db.select().from(reminders).where(eq(reminders.userId, userId)).orderBy(desc(reminders.createdAt));
  }

  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    const [newReminder] = await db.insert(reminders).values(reminder).returning();
    return newReminder;
  }

  async updateReminder(id: string, userId: string, reminder: Partial<InsertReminder>): Promise<Reminder | undefined> {
    const [updated] = await db
      .update(reminders)
      .set(reminder)
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)))
      .returning();
    return updated;
  }

  async deleteReminder(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(reminders)
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // Caregiver Notes
  async getCaregiverNotes(userId: string, isCaregiver: boolean): Promise<CaregiverNote[]> {
    if (isCaregiver) {
      return await db.select().from(caregiverNotes).where(eq(caregiverNotes.userId, userId)).orderBy(desc(caregiverNotes.dateTime));
    }
    return await db.select().from(caregiverNotes).where(and(eq(caregiverNotes.userId, userId), eq(caregiverNotes.isPrivate, false))).orderBy(desc(caregiverNotes.dateTime));
  }

  async createCaregiverNote(note: InsertCaregiverNote): Promise<CaregiverNote> {
    const [newNote] = await db.insert(caregiverNotes).values(note).returning();
    return newNote;
  }

  async updateCaregiverNote(id: string, userId: string, note: Partial<InsertCaregiverNote>): Promise<CaregiverNote | undefined> {
    const [updated] = await db
      .update(caregiverNotes)
      .set(note)
      .where(and(eq(caregiverNotes.id, id), eq(caregiverNotes.userId, userId)))
      .returning();
    return updated;
  }

  async deleteCaregiverNote(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(caregiverNotes)
      .where(and(eq(caregiverNotes.id, id), eq(caregiverNotes.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // Patient Summary
  async getPatientSummary(userId: string): Promise<PatientSummary | undefined> {
    const [summary] = await db.select().from(patientSummaries).where(eq(patientSummaries.userId, userId)).limit(1);
    return summary;
  }

  async createPatientSummary(summary: InsertPatientSummary): Promise<PatientSummary> {
    const [newSummary] = await db.insert(patientSummaries).values(summary).returning();
    return newSummary;
  }
}

export const storage = new DatabaseStorage();
