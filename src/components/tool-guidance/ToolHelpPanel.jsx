"use client";

import { CheckCircle2, HelpCircle, LifeBuoy, ShieldCheck, ShieldX, Wrench } from "lucide-react";

import InlineValidationMessage from "./InlineValidationMessage";
import PreScanChecklist from "./PreScanChecklist";
import TroubleshootingAccordion from "./TroubleshootingAccordion";

function FieldStatusPill({ status }) {
  const tone =
    status === "success"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
      : status === "warning"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
        : status === "error"
          ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
          : "border-white/10 bg-white/5 text-white/55";
  const label =
    status === "success"
      ? "Looks good"
      : status === "warning"
        ? "Check"
        : status === "error"
          ? "Needs fix"
          : "Help";

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[0.68rem] font-medium ${tone}`}>
      {label}
    </span>
  );
}

export default function ToolHelpPanel({
  open,
  onToggle,
  tool,
  fieldStates,
  activeFieldKey,
  setActiveFieldKey,
  troubleshootingItems,
  activeErrors,
}) {
  if (!tool) return null;

  const activeField = activeFieldKey ? tool.fields?.[activeFieldKey] : null;
  const activeFieldState = activeFieldKey ? fieldStates?.[activeFieldKey] : null;
  const fields = Object.entries(tool.fields || {});
  const issueFields = fields.filter(
    ([fieldKey]) =>
      fieldStates?.[fieldKey]?.status === "error" ||
      fieldStates?.[fieldKey]?.status === "warning"
  );
  const readyFields = fields.filter(
    ([fieldKey]) => fieldStates?.[fieldKey]?.status === "success"
  );

  return (
    <aside className={`tool-guidance-panel ${open ? "tool-guidance-panel-open" : "tool-guidance-panel-closed"}`}>
      <button type="button" onClick={onToggle} className="tool-guidance-toggle">
        <HelpCircle className="h-4 w-4" />
        <span>{open ? "Close help" : "Need help?"}</span>
      </button>

      {open ? (
        <div className="tool-guidance-shell">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="eyebrow">Tool Help</p>
              <h3 className="font-mono text-lg font-semibold text-white">{tool.title}</h3>
              <p className="text-sm leading-6 text-white/70">{tool.summary}</p>
            </div>
            <button
              type="button"
              onClick={onToggle}
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/55 transition hover:border-white/20 hover:text-white"
            >
              Close
            </button>
          </div>

          {activeField ? (
            <section className="space-y-3 rounded-lg border border-white/10 bg-black/25 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">{activeField.label}</p>
                  <p className="text-xs text-white/45">Current input</p>
                </div>
                <FieldStatusPill status={activeFieldState?.status || "info"} />
              </div>
              <p className="text-sm leading-7 text-white/72">{activeField.description}</p>
              <InlineValidationMessage {...activeFieldState} example="" />
              {activeField.examples?.length ? (
                <div className="rounded-lg border border-white/8 bg-black/20 px-3 py-2">
                  <p className="text-xs text-white/45">Example</p>
                  <code className="mt-1 block break-all text-sm text-white/78">
                    {activeField.examples[0]}
                  </code>
                </div>
              ) : null}
              {activeField.commonMistakes?.length ? (
                <div>
                  <p className="mb-2 text-xs font-medium text-white/55">Avoid</p>
                  <ul className="space-y-2 text-sm text-white/68">
                    {activeField.commonMistakes.map((item) => (
                      <li key={item} className="rounded-lg border border-white/8 bg-black/20 px-3 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : null}

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              <h4 className="font-medium text-white">Inputs</h4>
            </div>
            <div className="grid gap-2">
              {fields.map(([fieldKey, field]) => (
                <button
                  type="button"
                  key={fieldKey}
                  onClick={() => setActiveFieldKey(fieldKey)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-3 text-left transition ${activeFieldKey === fieldKey
                      ? "border-[var(--gold)]/35 bg-[var(--gold)]/10"
                      : "border-white/8 bg-black/20 hover:border-white/16"
                    }`}
                >
                  <div>
                    <p className="text-sm font-medium text-white">{field.label}</p>
                    <p className="text-xs text-white/45">
                      {fieldStates?.[fieldKey]?.message || field.examples?.[0] || "Help available"}
                    </p>
                  </div>
                  <FieldStatusPill status={fieldStates?.[fieldKey]?.status || "info"} />
                </button>
              ))}
            </div>
          </section>

          {issueFields.length ? (
            <section className="space-y-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
              <div className="flex items-center gap-2">
                <LifeBuoy className="h-4 w-4 text-amber-10" />
                <h4 className="font-medium text-amber-100">Fix before scanning</h4>
              </div>
              <div className="space-y-2">
                {issueFields.map(([fieldKey, field]) => (
                  <button
                    type="button"
                    key={`issue-${fieldKey}`}
                    onClick={() => setActiveFieldKey(fieldKey)}
                    className="w-full rounded-lg border border-amber-200/15 bg-black/20 px-3 py-2 text-left text-sm text-amber-50/85"
                  >
                    <span className="font-medium">{field.label}: </span>
                    {fieldStates[fieldKey]?.message}
                  </button>
                ))}
              </div>
            </section>
          ) : readyFields.length ? (
            <section className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100/85">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-200" />
                <p>
                  {readyFields.length === fields.length
                    ? "All guided inputs look ready."
                    : `${readyFields.length} guided input${readyFields.length === 1 ? "" : "s"} look ready.`}
                </p>
              </div>
            </section>
          ) : null}

          {tool.checklist?.length ? (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--gold)]" />
                <h4 className="font-medium text-white">Pre-scan checklist</h4>
              </div>
              <PreScanChecklist items={tool.checklist} fieldStates={fieldStates} />
            </section>
          ) : null}

          {tool.bestPractices?.length ? (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-10" />
                <h4 className="font-medium text-white">Good practice</h4>
              </div>
              <ul className="space-y-2 text-sm text-white/20">
                {tool.bestPractices.map((item) => (
                  <li key={item} className="rounded-lg border border-white/8 bg-black/20 px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {(activeErrors.length || troubleshootingItems.length) ? (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-amber-300" />
                <h4 className="font-medium text-white">Troubleshooting</h4>
              </div>
              {activeErrors.length ? (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldX className="mt-0.5 h-4 w-4 text-rose-300" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-rose-100">Current tool error</p>
                      {activeErrors.slice(0, 2).map((item) => (
                        <p key={item} className="text-sm leading-6 text-rose-100/85">
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
              <TroubleshootingAccordion items={troubleshootingItems} />
            </section>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
