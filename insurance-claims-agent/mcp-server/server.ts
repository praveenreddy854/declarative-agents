import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult, ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import {
  claims, inspections, contractors, purchaseOrders, inspectors,
  type Claim, type Inspection, type PurchaseOrder
} from "./src/data.js";

const DIST_DIR = import.meta.filename.endsWith(".ts")
  ? path.join(import.meta.dirname, "dist")
  : import.meta.dirname;

async function readWidget(filename: string): Promise<string> {
  return fs.readFile(path.join(DIST_DIR, "widgets", filename), "utf-8");
}

export function createServer(): McpServer {
  const server = new McpServer({
    name: "Zava Insurance MCP App",
    version: "1.0.0",
  });

  // ── Widget Tool + Resource: Claims Dashboard ──
  const dashboardUri = "ui://zava/claims-dashboard.html";

  registerAppTool(server,
    "show_claims_dashboard",
    {
      title: "Show Claims Dashboard",
      description: "Displays the Zava Insurance claims dashboard showing all claims with status overview, filters, and summary metrics. Supports filtering by status and/or policy holder name.",
      inputSchema: {
        status: z.string().optional().describe("Filter claims by status keyword (e.g. 'Open', 'Approved', 'Pending', 'Denied', 'Closed')"),
        policyHolderName: z.string().optional().describe("Filter claims by policy holder name. Supports partial, case-insensitive matching."),
      },
      _meta: { ui: { resourceUri: dashboardUri } },
    },
    async (args): Promise<CallToolResult> => {
      let filtered = [...claims];
      if (args.status) {
        filtered = filtered.filter(c => c.status.toLowerCase().includes(args.status!.toLowerCase()));
      }
      if (args.policyHolderName) {
        filtered = filtered.filter(c => c.policyHolderName.toLowerCase().includes(args.policyHolderName!.toLowerCase()));
      }
      const summary = {
        total: filtered.length,
        open: filtered.filter(c => c.status === "Open").length,
        approved: filtered.filter(c => c.status === "Approved").length,
        pending: filtered.filter(c => c.status === "Pending").length,
        denied: filtered.filter(c => c.status === "Denied").length,
        closed: filtered.filter(c => c.status === "Closed").length,
        totalEstimated: filtered.reduce((s, c) => s + c.estimatedAmount, 0),
      };
      return {
        content: [{ type: "text", text: `Claims dashboard: ${filtered.length} claims found. ${summary.open} open, ${summary.approved} approved, ${summary.pending} pending.` }],
        structuredContent: { claims: filtered, summary, filters: { status: args.status || null, policyHolderName: args.policyHolderName || null } },
      };
    },
  );

  registerAppResource(server, dashboardUri, dashboardUri, { mimeType: RESOURCE_MIME_TYPE },
    async (): Promise<ReadResourceResult> => ({
      contents: [{ uri: dashboardUri, mimeType: RESOURCE_MIME_TYPE, text: await readWidget("claims-dashboard.html") }],
    }),
  );

  // ── Widget Tool + Resource: Claim Detail ──
  const detailUri = "ui://zava/claim-detail.html";

  registerAppTool(server,
    "show_claim_detail",
    {
      title: "Show Claim Detail",
      description: "Displays detailed information about a specific insurance claim including related inspections, purchase orders, and contractor assignments. Use claim ID (e.g. '1', '2') or claim number (e.g. 'CN202504990').",
      inputSchema: {
        claimId: z.string().describe("The claim ID or claim number to look up"),
      },
      _meta: { ui: { resourceUri: detailUri } },
    },
    async (args): Promise<CallToolResult> => {
      const claim = claims.find(c => c.id === args.claimId || c.claimNumber === args.claimId);
      if (!claim) {
        return { content: [{ type: "text", text: `Claim '${args.claimId}' not found.` }], isError: true };
      }
      const claimInspections = inspections.filter(i => i.claimId === claim.id || i.claimNumber === claim.claimNumber);
      const claimPOs = purchaseOrders.filter(p => p.claimId === claim.id || p.claimNumber === claim.claimNumber);
      const assignedContractors = claimPOs.map(po => contractors.find(c => c.id === po.contractorId)).filter(Boolean);
      return {
        content: [{ type: "text", text: `Claim ${claim.claimNumber}: ${claim.type} - ${claim.status}. Policy holder: ${claim.policyHolderName}. Estimated: $${claim.estimatedAmount.toLocaleString()}.` }],
        structuredContent: { claim, inspections: claimInspections, purchaseOrders: claimPOs, contractors: assignedContractors },
      };
    },
  );

  registerAppResource(server, detailUri, detailUri, { mimeType: RESOURCE_MIME_TYPE },
    async (): Promise<ReadResourceResult> => ({
      contents: [{ uri: detailUri, mimeType: RESOURCE_MIME_TYPE, text: await readWidget("claim-detail.html") }],
    }),
  );

  // ── Widget Tool + Resource: Contractors List ──
  const contractorsUri = "ui://zava/contractors-list.html";

  registerAppTool(server,
    "show_contractors",
    {
      title: "Show Contractors",
      description: "Displays the list of contractors available for insurance repair work. Optionally filter by specialty or preferred status.",
      inputSchema: {
        specialty: z.string().optional().describe("Filter by contractor specialty (e.g. 'Roofing', 'Water Damage', 'Fire')"),
        preferredOnly: z.boolean().optional().describe("Show only preferred contractors"),
      },
      _meta: { ui: { resourceUri: contractorsUri } },
    },
    async (args): Promise<CallToolResult> => {
      let filtered = [...contractors];
      if (args.specialty) {
        filtered = filtered.filter(c => c.specialty.toLowerCase().includes(args.specialty!.toLowerCase()));
      }
      if (args.preferredOnly) {
        filtered = filtered.filter(c => c.preferred);
      }
      return {
        content: [{ type: "text", text: `Found ${filtered.length} contractors${args.specialty ? ` specializing in ${args.specialty}` : ""}.` }],
        structuredContent: { contractors: filtered, filters: { specialty: args.specialty || null, preferredOnly: args.preferredOnly || false } },
      };
    },
  );

  registerAppResource(server, contractorsUri, contractorsUri, { mimeType: RESOURCE_MIME_TYPE },
    async (): Promise<ReadResourceResult> => ({
      contents: [{ uri: contractorsUri, mimeType: RESOURCE_MIME_TYPE, text: await readWidget("contractors-list.html") }],
    }),
  );

  // ── Non-widget tools ──

  server.tool(
    "update_claim_status",
    "Updates the status of an insurance claim. Use claim ID (e.g. '1', '2').",
    {
      claimId: z.string().describe("The claim ID"),
      status: z.string().describe("New status (e.g. 'Approved', 'Denied', 'Closed', 'Open - Under Investigation')"),
      note: z.string().optional().describe("Optional note to add to the claim"),
    },
    async (args): Promise<CallToolResult> => {
      const claim = claims.find(c => c.id === args.claimId || c.claimNumber === args.claimId);
      if (!claim) return { content: [{ type: "text", text: `Claim '${args.claimId}' not found.` }], isError: true };
      const oldStatus = claim.status;
      claim.status = args.status;
      if (args.note) claim.notes.push(args.note);
      claim.notes.push(`Status changed from '${oldStatus}' to '${args.status}'`);
      return { content: [{ type: "text", text: `Claim ${claim.claimNumber} status updated from '${oldStatus}' to '${args.status}'.` }] };
    },
  );

  server.tool(
    "update_inspection",
    "Updates an inspection record — status, findings, recommended actions, property, or inspector assignment.",
    {
      inspectionId: z.string().describe("The inspection ID (e.g. 'insp-001')"),
      status: z.string().optional().describe("New status (e.g. 'completed', 'scheduled', 'in-progress', 'cancelled')"),
      findings: z.string().optional().describe("Updated findings text"),
      recommendedActions: z.array(z.string()).optional().describe("Updated recommended actions"),
      property: z.string().optional().describe("Updated property address"),
      inspectorId: z.string().optional().describe("Inspector ID to assign (e.g. 'inspector-003')"),
    },
    async (args): Promise<CallToolResult> => {
      const insp = inspections.find(i => i.id === args.inspectionId);
      if (!insp) return { content: [{ type: "text", text: `Inspection '${args.inspectionId}' not found.` }], isError: true };
      if (args.status) insp.status = args.status;
      if (args.findings) insp.findings = args.findings;
      if (args.recommendedActions) insp.recommendedActions = args.recommendedActions;
      if (args.property) insp.property = args.property;
      if (args.inspectorId) insp.inspectorId = args.inspectorId;
      return { content: [{ type: "text", text: `Inspection ${insp.id} updated successfully.` }] };
    },
  );

  server.tool(
    "update_purchase_order",
    "Updates a purchase order status (e.g. approve, reject, complete).",
    {
      purchaseOrderId: z.string().describe("The purchase order ID (e.g. 'po-001')"),
      status: z.string().describe("New status (e.g. 'approved', 'rejected', 'completed', 'in-progress')"),
      note: z.string().optional().describe("Optional note to add"),
    },
    async (args): Promise<CallToolResult> => {
      const po = purchaseOrders.find(p => p.id === args.purchaseOrderId);
      if (!po) return { content: [{ type: "text", text: `Purchase order '${args.purchaseOrderId}' not found.` }], isError: true };
      const oldStatus = po.status;
      po.status = args.status;
      if (args.note) po.note = args.note;
      return { content: [{ type: "text", text: `Purchase order ${po.id} status updated from '${oldStatus}' to '${args.status}'.` }] };
    },
  );

  server.tool(
    "get_claim_summary",
    "Returns a text summary for a specific claim with key details. Use claim ID or claim number.",
    {
      claimId: z.string().describe("Claim ID or claim number"),
    },
    async (args): Promise<CallToolResult> => {
      const claim = claims.find(c => c.id === args.claimId || c.claimNumber === args.claimId);
      if (!claim) return { content: [{ type: "text", text: `Claim '${args.claimId}' not found.` }], isError: true };
      const claimInspections = inspections.filter(i => i.claimId === claim.id);
      const claimPOs = purchaseOrders.filter(p => p.claimId === claim.id);
      const summary = [
        `**Claim ${claim.claimNumber}** — ${claim.type}`,
        `Status: ${claim.status} | Filed: ${claim.dateFiled} | Loss Date: ${claim.dateOfLoss}`,
        `Policy Holder: ${claim.policyHolderName}`,
        `Property: ${claim.propertyAddress}`,
        `Description: ${claim.description}`,
        `Estimated: $${claim.estimatedAmount.toLocaleString()}${claim.approvedAmount !== null ? ` | Approved: $${claim.approvedAmount.toLocaleString()}` : ""}`,
        `Adjuster: ${claim.adjuster}`,
        `Inspections: ${claimInspections.length} | Purchase Orders: ${claimPOs.length}`,
        `Notes: ${claim.notes.join("; ")}`,
      ].join("\n");
      return { content: [{ type: "text", text: summary }] };
    },
  );

  server.tool(
    "create_inspection",
    "Creates a new inspection record. Only claimNumber is required. ID is auto-generated, status defaults to 'open'.",
    {
      claimNumber: z.string().describe("The claim number (e.g. 'CN202504990')"),
      claimId: z.string().optional().describe("Optional claim ID"),
      taskType: z.string().optional().describe("Type of inspection: 'initial', 're-inspection', 'final'. Defaults to 'initial'"),
      priority: z.string().optional().describe("Priority: 'low', 'medium', 'high'. Defaults to 'medium'"),
      scheduledDate: z.string().optional().describe("Scheduled date (ISO string)"),
      inspectorId: z.string().optional().describe("Inspector ID to assign"),
      property: z.string().optional().describe("Property address"),
      instructions: z.string().optional().describe("Inspection instructions"),
    },
    async (args): Promise<CallToolResult> => {
      const claim = claims.find(c => c.claimNumber === args.claimNumber);
      const newId = `insp-${String(inspections.length + 1).padStart(3, "0")}`;
      const newInspection: Inspection = {
        id: newId,
        claimId: args.claimId || claim?.id || "",
        claimNumber: args.claimNumber,
        status: "open",
        taskType: args.taskType || "initial",
        priority: args.priority || "medium",
        scheduledDate: args.scheduledDate || "",
        inspectorId: args.inspectorId || "",
        property: args.property || claim?.propertyAddress || "",
        findings: "",
        recommendedActions: [],
        instructions: args.instructions || "",
      };
      inspections.push(newInspection);
      return { content: [{ type: "text", text: `Inspection ${newId} created for claim ${args.claimNumber}.` }] };
    },
  );

  server.tool(
    "list_inspectors",
    "Lists all available inspectors with their specializations.",
    {},
    async (): Promise<CallToolResult> => {
      const text = inspectors.map(i => `${i.name} (${i.id}) — ${i.specialization} — ${i.activeInspections} active`).join("\n");
      return { content: [{ type: "text", text }] };
    },
  );

  return server;
}
