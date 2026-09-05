if (typeof process !== "undefined") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { CONFIG } from "./config";
import { AuditLogEntry } from "@/types/audit";
// In-memory audit store initialized empty (populated dynamically via runtime or Supabase)
const inMemoryAuditStore: AuditLogEntry[] = [];

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;
  if (CONFIG.supabase.url && CONFIG.supabase.anonKey) {
    try {
      supabaseClient = createClient(CONFIG.supabase.url, CONFIG.supabase.serviceRoleKey || CONFIG.supabase.anonKey, {
        auth: { persistSession: false },
      });
      return supabaseClient;
    } catch (e) {
      console.warn("Could not initialize Supabase client, using in-memory store:", e);
    }
  }
  return null;
}

export async function insertAuditEntry(entry: AuditLogEntry): Promise<AuditLogEntry> {
  const timestampedEntry: AuditLogEntry = {
    ...entry,
    id: entry.id || Date.now(),
    created_at: entry.created_at || new Date().toISOString(),
  };

  // Add to in-memory fallback first
  inMemoryAuditStore.unshift(timestampedEntry);

  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.from("audit_log").insert([
        {
          conversation_id: timestampedEntry.conversation_id,
          customer_id: timestampedEntry.customer_id,
          action_type: timestampedEntry.action_type,
          action_details: timestampedEntry.action_details || {},
          razorpay_ids: timestampedEntry.razorpay_ids || {},
          revenue_impact: timestampedEntry.revenue_impact || 0,
          guardrail_check: timestampedEntry.guardrail_check || {},
          agent_type: timestampedEntry.agent_type || "human",
        },
      ]).select().single();

      if (!error && data) {
        return { ...timestampedEntry, id: data.id };
      }
    } catch (e) {
      // Table may not exist yet until user runs schema.sql — fallback silently
    }
  }

  return timestampedEntry;
}

export async function fetchAuditLogs(limit = 50): Promise<AuditLogEntry[]> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {
      // Fallback
    }
  }

  return inMemoryAuditStore.slice(0, limit);
}
