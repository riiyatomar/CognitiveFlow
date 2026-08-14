import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  insertFamilyMemberSchema, 
  insertAlertSchema, 
  insertActivitySchema, 
  insertReminderSchema,
  insertCaregiverNoteSchema,
  insertPatientSummarySchema 
} from "../shared/schema";
import { setupAuth, requireAuth, getAuthorizedPatientId } from "./auth";

export function requireCaregiver(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (req.user!.role !== "caregiver") {
    return res.status(403).json({ error: "Forbidden: Caregiver role required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Health Check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ==========================================
  // FAMILY MEMBERS API
  // ==========================================
  app.get("/api/family", requireAuth, async (req, res) => {
    try {
      const patientId = getAuthorizedPatientId(req.user!);
      const family = await storage.getFamilyMembers(patientId);
      res.json(family);
    } catch (e) {
      console.error("[API Error] GET /api/family:", e);
      res.status(500).json({ error: "Failed to fetch family members" });
    }
  });

  app.post("/api/family", requireAuth, async (req, res) => {
    try {
      const patientId = getAuthorizedPatientId(req.user!);
      const { name, relationship, notes, phoneNumber, avatar } = req.body;

      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ error: "Name is required" });
      }

      if (!relationship || typeof relationship !== "string" || !relationship.trim()) {
        return res.status(400).json({ error: "Relationship is required" });
      }

      const member = await storage.createFamilyMember({
        userId: patientId,
        name: name.trim(),
        relationship: relationship.trim(),
        notes: notes ? notes.trim() : "",
        phoneNumber: phoneNumber ? phoneNumber.trim() : null,
        avatar: avatar || null,
        lastContact: new Date().toISOString(),
      });

      res.status(201).json(member);
    } catch (e: any) {
      console.error("[API Error] POST /api/family:", e);
      res.status(500).json({ error: e.message || "Failed to create family member" });
    }
  });

  app.patch("/api/family/:id", requireAuth, async (req, res) => {
    try {
      const patientId = getAuthorizedPatientId(req.user!);
      const updated = await storage.updateFamilyMember(req.params.id, patientId, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Family member not found" });
      }
      res.json(updated);
    } catch (e: any) {
      console.error("[API Error] PATCH /api/family/:id:", e);
      res.status(500).json({ error: "Failed to update family member" });
    }
  });

  app.delete("/api/family/:id", requireAuth, async (req, res) => {
    try {
      const patientId = getAuthorizedPatientId(req.user!);
      const success = await storage.deleteFamilyMember(req.params.id, patientId);
      if (!success) {
        return res.status(404).json({ error: "Family member not found" });
      }
      res.json({ message: "Family member deleted successfully" });
    } catch (e: any) {
      console.error("[API Error] DELETE /api/family/:id:", e);
      res.status(500).json({ error: "Failed to delete family member" });
    }
  });

  // ==========================================
  // ACTIVITIES API
  // ==========================================
  app.get("/api/activities", requireAuth, async (req, res) => {
    try {
      const patientId = getAuthorizedPatientId(req.user!);
      const activitiesList = await storage.getActivities(patientId);
      res.json(activitiesList);
    } catch (e) {
      console.error("[API Error] GET /api/activities:", e);
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", requireAuth, async (req, res) => {
    try {
      const patientId = getAuthorizedPatientId(req.user!);
      const { activityName, description, category, date, time, duration, priority, status } = req.body;

      if (!activityName || !activityName.trim()) {
        return res.status(400).json({ error: "Activity title is required" });
      }
      if (!time || !time.trim()) {
        return res.status(400).json({ error: "Time is required" });
      }

      const activity = await storage.createActivity({
        userId: patientId,
        activityName: activityName.trim(),
        description: description ? description.trim() : null,
        category: category || "Personal",
        date: date || new Date().toISOString().split("T")[0],
        time: time.trim(),
        duration: duration ? duration.trim() : null,
        priority: priority || "MEDIUM",
        status: status || "upcoming",
      });

      res.status(201).json(activity);
    } catch (e: any) {
      console.error("[API Error] POST /api/activities:", e);
      res.status(500).json({ error: e.message || "Failed to create activity" });
    }
  });

  app.patch("/api/activities/:id", requireAuth, async (req, res) => {
    try {
      const patientId = getAuthorizedPatientId(req.user!);
      const updated = await storage.updateActivity(req.params.id, patientId, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Activity not found" });
      }
      res.json(updated);
    } catch (e: any) {
      console.error("[API Error] PATCH /api/activities/:id:", e);
      res.status(500).json({ error: "Failed to update activity" });
    }
  });

  app.delete("/api/activities/:id", requireAuth, async (req, res) => {
    try {
      const patientId = getAuthorizedPatientId(req.user!);
      const success = await storage.deleteActivity(req.params.id, patientId);
      if (!success) {
        return res.status(404).json({ error: "Activity not found" });
      }
      res.json({ message: "Activity deleted successfully" });
    } catch (e: any) {
      console.error("[API Error] DELETE /api/activities/:id:", e);
      res.status(500).json({ error: "Failed to delete activity" });
    }
  });

  // ==========================================
  // REMINDERS API
  // ==========================================
  app.get("/api/reminders", requireAuth, async (req, res) => {
    try {
      const patientId = getAuthorizedPatientId(req.user!);
      const remindersList = await storage.getReminders(patientId);
      res.json(remindersList);
    } catch (e) {
      console.error("[API Error] GET /api/reminders:", e);
      res.status(500).json({ error: "Failed to fetch reminders" });
    }
  });

  app.post("/api/reminders", requireAuth, async (req, res) => {
    try {
      const patientId = getAuthorizedPatientId(req.user!);
      const { title, description, date, time, priority, recurrence, status } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ error: "Reminder title is required" });
      }

      const reminder = await storage.createReminder({
        userId: patientId,
        title: title.trim(),
        description: description ? description.trim() : null,
        date: date || new Date().toISOString().split("T")[0],
        time: time || "09:00 AM",
        priority: priority || "MEDIUM",
        recurrence: recurrence || "Once",
        status: status || "UPCOMING",
        createdAt: new Date().toISOString(),
      });

      res.status(201).json(reminder);
    } catch (e: any) {
      console.error("[API Error] POST /api/reminders:", e);
      res.status(500).json({ error: e.message || "Failed to create reminder" });
    }
  });

  app.patch("/api/reminders/:id", requireAuth, async (req, res) => {
    try {
      const patientId = getAuthorizedPatientId(req.user!);
      const updated = await storage.updateReminder(req.params.id, patientId, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Reminder not found" });
      }
      res.json(updated);
    } catch (e: any) {
      console.error("[API Error] PATCH /api/reminders/:id:", e);
      res.status(500).json({ error: "Failed to update reminder" });
    }
  });

  app.delete("/api/reminders/:id", requireAuth, async (req, res) => {
    try {
      const patientId = getAuthorizedPatientId(req.user!);
      const success = await storage.deleteReminder(req.params.id, patientId);
      if (!success) {
        return res.status(404).json({ error: "Reminder not found" });
      }
      res.json({ message: "Reminder deleted successfully" });
    } catch (e: any) {
      console.error("[API Error] DELETE /api/reminders/:id:", e);
      res.status(500).json({ error: "Failed to delete reminder" });
    }
  });

  // ==========================================
  // CAREGIVER NOTES API
  // ==========================================
  app.get("/api/notes", requireAuth, async (req, res) => {
    try {
      const patientId = getAuthorizedPatientId(req.user!);
      const isCaregiver = req.user!.role === "caregiver";
      const notesList = await storage.getCaregiverNotes(patientId, isCaregiver);
      res.json(notesList);
    } catch (e) {
      console.error("[API Error] GET /api/notes:", e);
      res.status(500).json({ error: "Failed to fetch caregiver notes" });
    }
  });

  app.post("/api/notes", requireAuth, async (req, res) => {
    try {
      const patientId = getAuthorizedPatientId(req.user!);
      const { noteText, isPrivate } = req.body;

      if (!noteText || !noteText.trim()) {
        return res.status(400).json({ error: "Note text is required" });
      }

      const note = await storage.createCaregiverNote({
        userId: patientId,
        caregiverId: req.user!.id,
        noteText: noteText.trim(),
        dateTime: new Date().toISOString(),
        isPrivate: Boolean(isPrivate),
      });

      res.status(201).json(note);
    } catch (e: any) {
      console.error("[API Error] POST /api/notes:", e);
      res.status(500).json({ error: e.message || "Failed to create note" });
    }
  });

  app.patch("/api/notes/:id", requireAuth, async (req, res) => {
    try {
      const patientId = getAuthorizedPatientId(req.user!);
      const updated = await storage.updateCaregiverNote(req.params.id, patientId, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json(updated);
    } catch (e: any) {
      console.error("[API Error] PATCH /api/notes/:id:", e);
      res.status(500).json({ error: "Failed to update note" });
    }
  });

  app.delete("/api/notes/:id", requireAuth, async (req, res) => {
    try {
      const patientId = getAuthorizedPatientId(req.user!);
      const success = await storage.deleteCaregiverNote(req.params.id, patientId);
      if (!success) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json({ message: "Note deleted successfully" });
    } catch (e: any) {
      console.error("[API Error] DELETE /api/notes/:id:", e);
      res.status(500).json({ error: "Failed to delete note" });
    }
  });

  // ==========================================
  // ALERTS API
  // ==========================================
  app.get("/api/alerts", requireAuth, async (req, res) => {
    try {
      const patientId = getAuthorizedPatientId(req.user!);
      const alertsList = await storage.getAlerts(patientId);
      res.json(alertsList);
    } catch (e) {
      console.error("[API Error] GET /api/alerts:", e);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts", requireAuth, async (req, res) => {
    try {
      const patientId = getAuthorizedPatientId(req.user!);
      const { type, message, time, priority, resolved } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ error: "Alert message is required" });
      }

      const alert = await storage.createAlert({
        userId: patientId,
        type: type || "info",
        message: message.trim(),
        time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        priority: priority || "MEDIUM",
        resolved: Boolean(resolved),
        acknowledged: false,
      });

      res.status(201).json(alert);
    } catch (e: any) {
      console.error("[API Error] POST /api/alerts:", e);
      res.status(500).json({ error: e.message || "Failed to create alert" });
    }
  });

  app.patch("/api/alerts/:id", requireAuth, async (req, res) => {
    try {
      const patientId = getAuthorizedPatientId(req.user!);
      const updated = await storage.updateAlert(req.params.id, patientId, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.json(updated);
    } catch (e: any) {
      console.error("[API Error] PATCH /api/alerts/:id:", e);
      res.status(500).json({ error: "Failed to update alert" });
    }
  });

  app.delete("/api/alerts/:id", requireAuth, async (req, res) => {
    try {
      const patientId = getAuthorizedPatientId(req.user!);
      const success = await storage.deleteAlert(req.params.id, patientId);
      if (!success) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.json({ message: "Alert deleted successfully" });
    } catch (e: any) {
      console.error("[API Error] DELETE /api/alerts/:id:", e);
      res.status(500).json({ error: "Failed to delete alert" });
    }
  });

  // Summary API
  app.get("/api/summary", requireAuth, async (req, res) => {
    try {
      const patientId = getAuthorizedPatientId(req.user!);
      const summary = await storage.getPatientSummary(patientId);
      if (summary) {
        res.json(summary);
      } else {
        res.status(404).json({ error: "Summary not found" });
      }
    } catch (e) {
      console.error("[API Error] GET /api/summary:", e);
      res.status(500).json({ error: "Failed to fetch summary" });
    }
  });

  // ==========================================
  // FACE RECOGNITION (Vision AI)
  // ==========================================
  app.post("/api/recognize", requireAuth, async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is missing from server configuration" });
      }

      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "No image provided" });
      }

      const patientId = getAuthorizedPatientId(req.user!);
      const family = await storage.getFamilyMembers(patientId);
      if (family.length === 0) {
        return res.status(404).json({ error: "No family members found. Please add family members in Family & Friends first." });
      }

      const targetBase64Data = image.replace(/^data:image\/\w+;base64,/, "");

      const genAI = new GoogleGenerativeAI(apiKey);
      const modelName = process.env.GEMINI_MODEL || "gemini-3.5-flash";
      const model = genAI.getGenerativeModel({ model: modelName });

      const contents: any[] = [];
      contents.push(`You are a face recognition system helping a patient with cognitive decline identify people in front of them.
Below are registered family members/friends, including reference face photos if available.
Analyze the target image at the end and compare facial features against the reference images and descriptions.`);

      family.forEach((member, index) => {
        contents.push(`\n[Person ${index + 1}] ID: "${member.id}", Name: "${member.name}", Relationship: "${member.relationship}", Notes: "${member.notes}"`);
        if (member.avatar && member.avatar.startsWith("data:image/")) {
          const mimeMatch = member.avatar.match(/^data:(image\/\w+);base64,/);
          const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
          const refBase64 = member.avatar.replace(/^data:image\/\w+;base64,/, "");
          contents.push({
            inlineData: {
              data: refBase64,
              mimeType: mimeType,
            }
          });
        }
      });

      contents.push(`\nTarget Camera Image to identify:`);
      contents.push({
        inlineData: {
          data: targetBase64Data,
          mimeType: "image/jpeg",
        }
      });

      contents.push(`\nDoes the face in the Target Image match any registered person above?
Return ONLY a valid JSON object in this exact format (no markdown code blocks):
{ "person_id": "<matched_id>" }
If no person matches or you cannot confidently identify anyone, return:
{ "person_id": null }`);

      const result = await model.generateContent(contents);
      const responseText = result.response.text().trim();
      let parsedResponse;
      try {
        const cleanJson = responseText.replace(/```json\n?|\n?```/g, "").trim();
        parsedResponse = JSON.parse(cleanJson);
      } catch (err) {
        console.error("Failed to parse Gemini vision response:", responseText);
        return res.status(500).json({ error: "Failed to parse AI response" });
      }

      if (parsedResponse.person_id) {
        const recognized = family.find(f => f.id === parsedResponse.person_id);
        if (recognized) {
          return res.json({ person: recognized });
        }
      }
      
      return res.status(404).json({ error: "Person not recognized. Please make sure a clear reference face photo is added for this family member." });
    } catch (e: any) {
      console.error("Recognition API error:", e);
      res.status(500).json({ error: "Recognition failed due to a server error: " + (e.message || "") });
    }
  });

  // ==========================================
  // VOICE ASSISTANT & CHAT (Conversational AI)
  // ==========================================
  app.post("/api/chat", requireAuth, async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is missing from server configuration" });
      }

      const question = req.body.question;
      if (!question || typeof question !== "string") {
        return res.status(400).json({ error: "A valid question is required" });
      }

      // Gather comprehensive patient context
      const patientId = getAuthorizedPatientId(req.user!);
      const activitiesList = await storage.getActivities(patientId);
      const remindersList = await storage.getReminders(patientId);
      const publicNotes = await storage.getCaregiverNotes(patientId, false); // Only patient-visible notes
      const familyList = await storage.getFamilyMembers(patientId);
      const alertsList = await storage.getAlerts(patientId);
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const modelName = process.env.GEMINI_MODEL || "gemini-3.5-flash";
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `You are a calm, empathetic, and reassuring cognitive memory assistant helping a patient with early cognitive decline.
Your answers should be short, simple, warm, and easy to understand. Speak directly to the patient in the second person ("You").
Do not invent facts or make medical diagnoses. Use the accurate caregiver and activity context below to answer.

Context about the patient's schedule & activities:
${JSON.stringify(activitiesList.map(a => ({ activity: a.activityName, category: a.category, time: a.time, date: a.date, status: a.status, description: a.description })))}

Context about active reminders:
${JSON.stringify(remindersList.map(r => ({ title: r.title, time: r.time, recurrence: r.recurrence, status: r.status, description: r.description })))}

Context from Caregiver Notes:
${JSON.stringify(publicNotes.map(n => ({ note: n.noteText, dateTime: n.dateTime })))}

Context about family & friends:
${JSON.stringify(familyList.map(f => ({ name: f.name, relationship: f.relationship, notes: f.notes })))}

Recent Alerts:
${JSON.stringify(alertsList.map(al => ({ alert: al.message, priority: al.priority, resolved: al.resolved })))}

Patient's question: "${question}"

Provide a brief, natural, conversational response that can be easily read aloud by text-to-speech.`;

      const result = await model.generateContent(prompt);
      const aiResponse = result.response.text();

      res.json({ response: aiResponse });
    } catch (e: any) {
      console.error("Chat API error:", e);
      res.status(500).json({ error: "Chat processing failed due to a server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
