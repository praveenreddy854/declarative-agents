import { App, applyDocumentTheme, applyHostFonts, applyHostStyleVariables, type McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import "./global.css";

interface DetailData {
  claim: {
    id: string; claimNumber: string; policyHolderName: string; status: string;
    type: string; dateOfLoss: string; dateFiled: string; description: string;
    propertyAddress: string; estimatedAmount: number; approvedAmount: number | null;
    adjuster: string; notes: string[];
  };
  inspections: { id: string; status: string; taskType: string; priority: string; scheduledDate: string; inspectorId: string; findings: string; }[];
  purchaseOrders: { id: string; contractorName: string; description: string; amount: number; status: string; }[];
  contractors: { name: string; specialty: string; rating: number; phone: string; }[];
}

const mockData: DetailData = {
  claim: { id: "1", claimNumber: "CN202504990", policyHolderName: "Sarah Johnson", status: "Open", type: "Water Damage", dateOfLoss: "2025-03-15", dateFiled: "2025-03-16", description: "Burst pipe in basement", propertyAddress: "1234 Oak Street", estimatedAmount: 45000, approvedAmount: null, adjuster: "Mike Rivera", notes: ["Initial report filed"] },
  inspections: [{ id: "insp-001", status: "completed", taskType: "initial", priority: "high", scheduledDate: "2025-03-18", inspectorId: "inspector-001", findings: "Significant water damage" }],
  purchaseOrders: [{ id: "po-003", contractorName: "WaterPro Restoration", description: "Basement restoration", amount: 42000, status: "pending" }],
  contractors: [{ name: "WaterPro Restoration", specialty: "Water Damage", rating: 4.9, phone: "555-0102" }],
};

function statusBadge(status: string): string {
  const cls = status.toLowerCase().replace(/\s.*/,"");
  return `<span class="badge badge-${cls}">${status}</span>`;
}

function fmt(n: number): string { return "$" + n.toLocaleString("en-US"); }

function stars(r: number): string { return "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r)); }

function render(data: DetailData) {
  const c = data.claim;
  document.getElementById("claim-header")!.innerHTML = `
    <h2>${c.claimNumber} — ${c.type}</h2>
    ${statusBadge(c.status)}
  `;

  document.getElementById("claim-info")!.innerHTML = `
    <div class="detail-row"><span class="detail-label">Policy Holder</span><span class="detail-value">${c.policyHolderName}</span></div>
    <div class="detail-row"><span class="detail-label">Property</span><span class="detail-value">${c.propertyAddress}</span></div>
    <div class="detail-row"><span class="detail-label">Date of Loss</span><span class="detail-value">${c.dateOfLoss}</span></div>
    <div class="detail-row"><span class="detail-label">Date Filed</span><span class="detail-value">${c.dateFiled}</span></div>
    <div class="detail-row"><span class="detail-label">Description</span><span class="detail-value">${c.description}</span></div>
    <div class="detail-row"><span class="detail-label">Estimated Amount</span><span class="detail-value amount amount-large">${fmt(c.estimatedAmount)}</span></div>
    ${c.approvedAmount !== null ? `<div class="detail-row"><span class="detail-label">Approved Amount</span><span class="detail-value amount" style="color:var(--color-success)">${fmt(c.approvedAmount)}</span></div>` : ""}
    <div class="detail-row"><span class="detail-label">Adjuster</span><span class="detail-value">${c.adjuster}</span></div>
    ${c.notes.length ? `<div class="detail-row"><span class="detail-label">Notes</span><span class="detail-value">${c.notes.join("; ")}</span></div>` : ""}
  `;

  if (data.inspections.length) {
    document.getElementById("inspections-section")!.innerHTML = `
      <div class="section-title">Inspections (${data.inspections.length})</div>
      ${data.inspections.map(i => `
        <div class="card">
          <div class="detail-row"><span class="detail-label">ID</span><span class="detail-value">${i.id}</span></div>
          <div class="detail-row"><span class="detail-label">Type / Priority</span><span class="detail-value"><span class="tag">${i.taskType}</span> <span class="tag">${i.priority}</span></span></div>
          <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">${statusBadge(i.status)}</span></div>
          <div class="detail-row"><span class="detail-label">Scheduled</span><span class="detail-value">${i.scheduledDate || "TBD"}</span></div>
          ${i.findings ? `<div class="detail-row"><span class="detail-label">Findings</span><span class="detail-value">${i.findings}</span></div>` : ""}
        </div>
      `).join("")}
    `;
  }

  if (data.purchaseOrders.length) {
    document.getElementById("purchase-orders-section")!.innerHTML = `
      <div class="section-title">Purchase Orders (${data.purchaseOrders.length})</div>
      <table>
        <thead><tr><th>PO ID</th><th>Contractor</th><th>Description</th><th>Amount</th><th>Status</th></tr></thead>
        <tbody>${data.purchaseOrders.map(p => `
          <tr><td>${p.id}</td><td>${p.contractorName}</td><td>${p.description}</td><td class="amount">${fmt(p.amount)}</td><td>${statusBadge(p.status)}</td></tr>
        `).join("")}</tbody>
      </table>
    `;
  }

  if (data.contractors.length) {
    document.getElementById("contractors-section")!.innerHTML = `
      <div class="section-title">Assigned Contractors (${data.contractors.length})</div>
      ${data.contractors.map(ct => `
        <div class="card">
          <div class="detail-row"><span class="detail-label">${ct.name}</span><span class="detail-value"><span class="star">${stars(ct.rating)}</span> ${ct.rating}</span></div>
          <div class="detail-row"><span class="detail-label">Specialty</span><span class="detail-value"><span class="tag">${ct.specialty}</span></span></div>
          <div class="detail-row"><span class="detail-label">Phone</span><span class="detail-value">${ct.phone}</span></div>
        </div>
      `).join("")}
    `;
  }
}

function extractData(result: CallToolResult): DetailData {
  return (result.structuredContent as DetailData) ?? mockData;
}

function handleHostContext(ctx: McpUiHostContext) {
  if (ctx.theme) applyDocumentTheme(ctx.theme);
  if (ctx.styles?.variables) applyHostStyleVariables(ctx.styles.variables);
  if (ctx.styles?.css?.fonts) applyHostFonts(ctx.styles.css.fonts);
}

const app = new App({ name: "Claim Detail", version: "1.0.0" });
app.onteardown = async () => ({});
app.ontoolinput = () => {};
app.ontoolresult = (result) => render(extractData(result));
app.onerror = console.error;
app.onhostcontextchanged = handleHostContext;

app.connect().then(() => {
  const ctx = app.getHostContext();
  if (ctx) handleHostContext(ctx);
  render(mockData);
});
