import { App, applyDocumentTheme, applyHostFonts, applyHostStyleVariables, type McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import "./global.css";

interface ContractorData {
  id: string; name: string; specialty: string; rating: number; preferred: boolean;
  phone: string; email: string; completedJobs: number; availability: string;
}

interface ContractorsPayload {
  contractors: ContractorData[];
  filters: { specialty: string | null; preferredOnly: boolean };
}

const mockData: ContractorsPayload = {
  contractors: [
    { id: "cont-001", name: "ABC Roofing Co.", specialty: "Roofing", rating: 4.8, preferred: true, phone: "555-0101", email: "info@abcroofing.com", completedJobs: 145, availability: "Available" },
    { id: "cont-002", name: "WaterPro Restoration", specialty: "Water Damage", rating: 4.9, preferred: true, phone: "555-0102", email: "jobs@waterpro.com", completedJobs: 210, availability: "Available" },
  ],
  filters: { specialty: null, preferredOnly: false },
};

function stars(r: number): string { return "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r)); }

function render(data: ContractorsPayload) {
  const filterInfo = document.getElementById("filter-info")!;
  const parts: string[] = [];
  if (data.filters.specialty) parts.push(data.filters.specialty);
  if (data.filters.preferredOnly) parts.push("Preferred Only");
  filterInfo.textContent = parts.length ? parts.join(" | ") : `${data.contractors.length} contractors`;

  document.getElementById("contractors-grid")!.innerHTML = data.contractors.map(c => `
    <div class="card" style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div>
          <strong style="font-size:1.1rem">${c.name}</strong>
          ${c.preferred ? '<span class="badge badge-approved" style="margin-left:8px">Preferred</span>' : ""}
        </div>
        <span class="badge ${c.availability === "Available" ? "badge-approved" : "badge-pending"}">${c.availability}</span>
      </div>
      <div class="detail-row"><span class="detail-label">Specialty</span><span class="detail-value"><span class="tag">${c.specialty}</span></span></div>
      <div class="detail-row"><span class="detail-label">Rating</span><span class="detail-value"><span class="star">${stars(c.rating)}</span> ${c.rating}</span></div>
      <div class="detail-row"><span class="detail-label">Completed Jobs</span><span class="detail-value">${c.completedJobs}</span></div>
      <div class="detail-row"><span class="detail-label">Phone</span><span class="detail-value">${c.phone}</span></div>
      <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">${c.email}</span></div>
    </div>
  `).join("");
}

function extractData(result: CallToolResult): ContractorsPayload {
  return (result.structuredContent as ContractorsPayload) ?? mockData;
}

function handleHostContext(ctx: McpUiHostContext) {
  if (ctx.theme) applyDocumentTheme(ctx.theme);
  if (ctx.styles?.variables) applyHostStyleVariables(ctx.styles.variables);
  if (ctx.styles?.css?.fonts) applyHostFonts(ctx.styles.css.fonts);
}

const app = new App({ name: "Contractors List", version: "1.0.0" });
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
