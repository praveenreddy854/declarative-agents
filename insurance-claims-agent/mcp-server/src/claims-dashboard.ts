import { App, applyDocumentTheme, applyHostFonts, applyHostStyleVariables, type McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import "./global.css";

interface ClaimData {
  id: string; claimNumber: string; policyHolderName: string; status: string;
  type: string; dateFiled: string; estimatedAmount: number; adjuster: string;
}

interface DashboardData {
  claims: ClaimData[];
  summary: { total: number; open: number; approved: number; pending: number; denied: number; closed: number; totalEstimated: number };
  filters: { status: string | null; policyHolderName: string | null };
}

const mockData: DashboardData = {
  claims: [
    { id: "1", claimNumber: "CN202504990", policyHolderName: "Sarah Johnson", status: "Open", type: "Water Damage", dateFiled: "2025-03-16", estimatedAmount: 45000, adjuster: "Mike Rivera" },
    { id: "2", claimNumber: "CN202504991", policyHolderName: "Robert Chen", status: "Approved", type: "Fire Damage", dateFiled: "2025-03-11", estimatedAmount: 120000, adjuster: "Lisa Park" },
  ],
  summary: { total: 2, open: 1, approved: 1, pending: 0, denied: 0, closed: 0, totalEstimated: 165000 },
  filters: { status: null, policyHolderName: null },
};

function statusBadge(status: string): string {
  const cls = status.toLowerCase().replace(/\s.*/,"");
  return `<span class="badge badge-${cls}">${status}</span>`;
}

function formatCurrency(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

function render(data: DashboardData) {
  const filterInfo = document.getElementById("filter-info")!;
  const parts: string[] = [];
  if (data.filters.status) parts.push(`Status: ${data.filters.status}`);
  if (data.filters.policyHolderName) parts.push(`Name: ${data.filters.policyHolderName}`);
  filterInfo.textContent = parts.length ? parts.join(" | ") : "All Claims";

  document.getElementById("metrics")!.innerHTML = `
    <div class="metric"><div class="metric-value">${data.summary.total}</div><div class="metric-label">Total</div></div>
    <div class="metric"><div class="metric-value" style="color:var(--color-info)">${data.summary.open}</div><div class="metric-label">Open</div></div>
    <div class="metric"><div class="metric-value" style="color:var(--color-success)">${data.summary.approved}</div><div class="metric-label">Approved</div></div>
    <div class="metric"><div class="metric-value" style="color:var(--color-warning)">${data.summary.pending}</div><div class="metric-label">Pending</div></div>
    <div class="metric"><div class="metric-value" style="color:var(--color-danger)">${data.summary.denied}</div><div class="metric-label">Denied</div></div>
    <div class="metric"><div class="metric-value">${formatCurrency(data.summary.totalEstimated)}</div><div class="metric-label">Est. Total</div></div>
  `;

  document.getElementById("claims-table")!.innerHTML = `
    <table>
      <thead><tr><th>Claim #</th><th>Policy Holder</th><th>Type</th><th>Status</th><th>Filed</th><th>Estimated</th><th>Adjuster</th></tr></thead>
      <tbody>
        ${data.claims.map(c => `
          <tr>
            <td><strong>${c.claimNumber}</strong></td>
            <td>${c.policyHolderName}</td>
            <td><span class="tag">${c.type}</span></td>
            <td>${statusBadge(c.status)}</td>
            <td>${c.dateFiled}</td>
            <td class="amount">${formatCurrency(c.estimatedAmount)}</td>
            <td>${c.adjuster}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function extractData(result: CallToolResult): DashboardData {
  return (result.structuredContent as DashboardData) ?? mockData;
}

function handleHostContext(ctx: McpUiHostContext) {
  if (ctx.theme) applyDocumentTheme(ctx.theme);
  if (ctx.styles?.variables) applyHostStyleVariables(ctx.styles.variables);
  if (ctx.styles?.css?.fonts) applyHostFonts(ctx.styles.css.fonts);
}

const app = new App({ name: "Claims Dashboard", version: "1.0.0" });

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
