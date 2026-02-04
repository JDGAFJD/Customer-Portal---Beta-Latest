import { customers, otpCodes, sessions, escalationTickets, customerFeedback, slowSpeedSessions, adminUsers, type Customer, type InsertCustomer, type OtpCode, type InsertOtpCode, type Session, type InsertSession, type EscalationTicket, type InsertEscalationTicket, type CustomerFeedback, type InsertCustomerFeedback, type SlowSpeedSession, type InsertSlowSpeedSession, type AdminUser, type InsertAdminUser } from "../shared/schema";
import { db } from "./db";
import { eq, and, gt, or, desc } from "drizzle-orm";

export interface IStorage {
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, data: Partial<InsertCustomer>): Promise<Customer | undefined>;
  updateLastLogin(id: number): Promise<void>;
  
  createOtpCode(otp: InsertOtpCode): Promise<OtpCode>;
  getValidOtpCode(target: string, code: string, type: string): Promise<OtpCode | undefined>;
  verifyOtpCode(target: string, code: string, type: string): Promise<OtpCode | undefined>;
  markOtpVerified(id: number): Promise<void>;
  invalidateOtpCodes(target: string, type: string): Promise<void>;
  
  createSession(session: InsertSession): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<void>;

  createEscalationTicket(ticket: InsertEscalationTicket): Promise<EscalationTicket>;
  getRecentEscalation(customerEmail: string, subscriptionId: string | null, iccid: string | null): Promise<EscalationTicket | undefined>;
  getEscalationByTicketId(ticketId: string): Promise<EscalationTicket | undefined>;
  
  createFeedback(feedback: InsertCustomerFeedback): Promise<CustomerFeedback>;
  getFeedbackByCustomer(customerEmail: string): Promise<CustomerFeedback[]>;
  
  createSlowSpeedSession(session: InsertSlowSpeedSession): Promise<SlowSpeedSession>;
  getSlowSpeedSession(id: number): Promise<SlowSpeedSession | undefined>;
  getRecentSlowSpeedRefresh(customerEmail: string, subscriptionId: string): Promise<SlowSpeedSession | undefined>;
  updateSlowSpeedSession(id: number, data: Partial<InsertSlowSpeedSession>): Promise<SlowSpeedSession | undefined>;
  
  getAdminByEmail(email: string): Promise<AdminUser | undefined>;
  createAdmin(admin: InsertAdminUser): Promise<AdminUser>;
  getAllFeedback(): Promise<CustomerFeedback[]>;
  updateFeedbackResponse(id: number, response: string, respondedBy: string): Promise<CustomerFeedback | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.email, email.toLowerCase()));
    return customer || undefined;
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.phone, phone));
    return customer || undefined;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db
      .insert(customers)
      .values({ ...customer, email: customer.email.toLowerCase() })
      .returning();
    return newCustomer;
  }

  async updateCustomer(id: number, data: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [updated] = await db
      .update(customers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return updated || undefined;
  }

  async updateLastLogin(id: number): Promise<void> {
    const customer = await this.getCustomer(id);
    await db
      .update(customers)
      .set({ 
        lastLoginAt: new Date(),
        loginCount: (customer?.loginCount || 0) + 1
      })
      .where(eq(customers.id, id));
  }

  async createOtpCode(otp: InsertOtpCode): Promise<OtpCode> {
    const [newOtp] = await db.insert(otpCodes).values(otp).returning();
    return newOtp;
  }

  async getValidOtpCode(target: string, code: string, type: string): Promise<OtpCode | undefined> {
    const [otp] = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.target, target),
          eq(otpCodes.code, code),
          eq(otpCodes.type, type),
          eq(otpCodes.verified, false),
          gt(otpCodes.expiresAt, new Date())
        )
      );
    return otp || undefined;
  }

  async verifyOtpCode(target: string, code: string, type: string): Promise<OtpCode | undefined> {
    const otp = await this.getValidOtpCode(target, code, type);
    if (otp) {
      await this.markOtpVerified(otp.id);
    }
    return otp;
  }

  async markOtpVerified(id: number): Promise<void> {
    await db.update(otpCodes).set({ verified: true }).where(eq(otpCodes.id, id));
  }

  async invalidateOtpCodes(target: string, type: string): Promise<void> {
    await db
      .update(otpCodes)
      .set({ verified: true })
      .where(and(eq(otpCodes.target, target), eq(otpCodes.type, type)));
  }

  async createSession(session: InsertSession): Promise<Session> {
    const [newSession] = await db.insert(sessions).values(session).returning();
    return newSession;
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())));
    return session || undefined;
  }

  async deleteSession(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  async createEscalationTicket(ticket: InsertEscalationTicket): Promise<EscalationTicket> {
    const [newTicket] = await db.insert(escalationTickets).values(ticket).returning();
    return newTicket;
  }

  async getRecentEscalation(customerEmail: string, subscriptionId: string | null, iccid: string | null): Promise<EscalationTicket | undefined> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const conditions = [
      eq(escalationTickets.customerEmail, customerEmail.toLowerCase()),
      eq(escalationTickets.status, "open"),
      gt(escalationTickets.createdAt, twentyFourHoursAgo)
    ];

    if (subscriptionId) {
      conditions.push(eq(escalationTickets.subscriptionId, subscriptionId));
    }

    if (iccid) {
      conditions.push(eq(escalationTickets.iccid, iccid));
    }

    const [ticket] = await db
      .select()
      .from(escalationTickets)
      .where(and(...conditions));
    
    return ticket || undefined;
  }

  async getEscalationByTicketId(ticketId: string): Promise<EscalationTicket | undefined> {
    const [ticket] = await db
      .select()
      .from(escalationTickets)
      .where(eq(escalationTickets.ticketId, ticketId));
    return ticket || undefined;
  }

  async createFeedback(feedback: InsertCustomerFeedback): Promise<CustomerFeedback> {
    const [newFeedback] = await db.insert(customerFeedback).values(feedback).returning();
    return newFeedback;
  }

  async getFeedbackByCustomer(customerEmail: string): Promise<CustomerFeedback[]> {
    return await db.select().from(customerFeedback)
      .where(eq(customerFeedback.customerEmail, customerEmail.toLowerCase()))
      .orderBy(desc(customerFeedback.createdAt));
  }

  async createSlowSpeedSession(session: InsertSlowSpeedSession): Promise<SlowSpeedSession> {
    const [newSession] = await db.insert(slowSpeedSessions).values(session).returning();
    return newSession;
  }

  async getSlowSpeedSession(id: number): Promise<SlowSpeedSession | undefined> {
    const [session] = await db.select().from(slowSpeedSessions).where(eq(slowSpeedSessions.id, id));
    return session || undefined;
  }

  async getRecentSlowSpeedRefresh(customerEmail: string, subscriptionId: string): Promise<SlowSpeedSession | undefined> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const [session] = await db
      .select()
      .from(slowSpeedSessions)
      .where(
        and(
          eq(slowSpeedSessions.customerEmail, customerEmail.toLowerCase()),
          eq(slowSpeedSessions.subscriptionId, subscriptionId),
          eq(slowSpeedSessions.refreshPerformed, true),
          gt(slowSpeedSessions.refreshStartedAt, sevenDaysAgo)
        )
      );
    
    return session || undefined;
  }

  async updateSlowSpeedSession(id: number, data: Partial<InsertSlowSpeedSession>): Promise<SlowSpeedSession | undefined> {
    const [updated] = await db
      .update(slowSpeedSessions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(slowSpeedSessions.id, id))
      .returning();
    return updated || undefined;
  }

  async getAdminByEmail(email: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email.toLowerCase()));
    return admin || undefined;
  }

  async createAdmin(admin: InsertAdminUser): Promise<AdminUser> {
    const [newAdmin] = await db.insert(adminUsers).values({
      ...admin,
      email: admin.email.toLowerCase()
    }).returning();
    return newAdmin;
  }

  async getAllFeedback(): Promise<CustomerFeedback[]> {
    return await db.select().from(customerFeedback).orderBy(desc(customerFeedback.createdAt));
  }

  async updateFeedbackResponse(id: number, response: string, respondedBy: string): Promise<CustomerFeedback | undefined> {
    const [updated] = await db
      .update(customerFeedback)
      .set({ 
        adminResponse: response, 
        respondedAt: new Date(), 
        respondedBy,
        status: 'responded'
      })
      .where(eq(customerFeedback.id, id))
      .returning();
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();
