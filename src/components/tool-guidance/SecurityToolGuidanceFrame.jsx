"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { getSecurityToolGuidance, getTroubleshootingMatches } from "@/lib/tool-guidance/registry";
import {
  getFieldValueFromElement,
  validateGuidanceField,
} from "@/lib/tool-guidance/validators";

import GuidanceTooltip from "./GuidanceTooltip";
import ToolHelpPanel from "./ToolHelpPanel";

function elementMatchesSelectorList(root, selectors = []) {
  for (const selector of selectors) {
    try {
      const node = root.querySelector(selector);
      if (node) return node;
    } catch {}
  }
  return null;
}

function findFieldElement(root, fieldKey, field) {
  const direct = elementMatchesSelectorList(root, field.selectors || []);
  if (direct) return direct;

  const labels = Array.from(root.querySelectorAll("label"));
  const normalizedLabel = String(field.label || "").toLowerCase();
  const matchedLabel = labels.find((label) =>
    label.textContent?.toLowerCase().includes(normalizedLabel)
  );
  if (matchedLabel && matchedLabel.htmlFor) {
    const escapedId =
      typeof CSS !== "undefined" && typeof CSS.escape === "function"
        ? CSS.escape(matchedLabel.htmlFor)
        : matchedLabel.htmlFor;
    return root.querySelector(`#${escapedId}`);
  }

  if (matchedLabel) {
    const scope = matchedLabel.parentElement || root;
    const candidate = scope.querySelector("input, textarea, select");
    if (candidate) return candidate;
  }

  if (fieldKey === "url") {
    return root.querySelector('input[type="url"], input[placeholder*="https://"], input[placeholder*="http://"]');
  }
  if (fieldKey === "domain") {
    return root.querySelector('input[placeholder*="example.com"], input[placeholder*="domain"]');
  }
  if (fieldKey === "code") {
    return root.querySelector("textarea");
  }
  if (fieldKey === "file") {
    return root.querySelector('input[type="file"]');
  }

  return null;
}

function findLabelElement(root, fieldElement) {
  if (!fieldElement) return null;
  if (fieldElement.labels?.length) return fieldElement.labels[0];
  const id = fieldElement.getAttribute("id");
  if (id) {
    const escapedId =
      typeof CSS !== "undefined" && typeof CSS.escape === "function"
        ? CSS.escape(id)
        : id;
    const direct = root.querySelector(`label[for="${escapedId}"]`);
    if (direct) return direct;
  }
  return fieldElement.parentElement?.querySelector("label") || null;
}

function createInlineMessageNode(afterElement) {
  const node = document.createElement("div");
  node.className = "tool-guidance-inline-message";
  afterElement.insertAdjacentElement("afterend", node);
  return node;
}

function extractToolErrors(root) {
  const selectors = [
    ".text-red-400",
    ".text-red-500",
    "[id$='error']",
    "[aria-invalid='true']",
  ];

  const values = new Set();
  selectors.forEach((selector) => {
    root.querySelectorAll(selector).forEach((element) => {
      const text = element.textContent?.trim();
      if (text && text.length > 4 && text.length < 240) {
        values.add(text);
      }
    });
  });
  return Array.from(values);
}

function renderInlineMessage(node, validation) {
  if (!node) return;
  if (!validation?.message && !validation?.fixHint) {
    node.innerHTML = "";
    node.dataset.status = "idle";
    return;
  }

  node.dataset.status = validation.status || "info";
  const shouldShowExample =
    validation.status === "success" || validation.status === "warning";
  const example = shouldShowExample && validation.example
    ? `<div class="tool-guidance-inline-example">Example: ${validation.example}</div>`
    : "";
  const fixHint = validation.fixHint
    ? `<div class="tool-guidance-inline-fix">${validation.fixHint}</div>`
    : "";
  node.innerHTML = `
    <div class="tool-guidance-inline-body">
      <div>${validation.message || ""}</div>
      ${fixHint}
      ${example}
    </div>
  `;
}

export default function SecurityToolGuidanceFrame({ toolSlug, children }) {
  const tool = getSecurityToolGuidance(toolSlug);
  const rootRef = useRef(null);
  const fieldBindingsRef = useRef({});
  const fieldStatesRef = useRef({});
  const [open, setOpen] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  const [fieldStates, setFieldStates] = useState({});
  const [activeFieldKey, setActiveFieldKey] = useState(
    Object.keys(tool?.fields || {})[0] || null
  );
  const [activeErrors, setActiveErrors] = useState([]);

  const allValues = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(fieldStates).map(([key, value]) => [key, value?.value ?? ""])
      ),
    [fieldStates]
  );

  useEffect(() => {
    fieldStatesRef.current = fieldStates;
  }, [fieldStates]);

  useEffect(() => {
    if (!tool || !rootRef.current) return undefined;

    const root = rootRef.current;
    const listeners = [];
    const bindings = {};

    const syncField = (fieldKey, fieldElement, inlineNode, touched = false) => {
      const field = tool.fields[fieldKey];
      const nextValue = getFieldValueFromElement(fieldElement);
      const validation = validateGuidanceField(field, nextValue, {
        ...Object.fromEntries(
          Object.entries(fieldStatesRef.current).map(([key, value]) => [
            key,
            value?.value ?? "",
          ])
        ),
        [fieldKey]: nextValue,
      });

      const hasValue =
        Array.isArray(nextValue) ? nextValue.length > 0 : String(nextValue || "").trim().length > 0;
      const shouldShowInline =
        touched || hasValue || validation.status === "success" || validation.status === "warning";

      setFieldStates((previous) => ({
        ...previous,
        [fieldKey]: {
          ...validation,
          touched: touched || previous[fieldKey]?.touched || false,
          value: nextValue,
        },
      }));
      renderInlineMessage(inlineNode, shouldShowInline ? validation : null);
    };

    const attachField = (fieldKey, field) => {
      const fieldElement = findFieldElement(root, fieldKey, field);
      if (!fieldElement) return;

      if (field.placeholder) {
        fieldElement.placeholder = field.placeholder;
      }

      const labelElement = findLabelElement(root, fieldElement);
      const inlineNode = createInlineMessageNode(fieldElement);

      if (labelElement && !labelElement.querySelector(`[data-guidance-key="${fieldKey}"]`)) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "tool-guidance-label-button";
        button.dataset.guidanceKey = fieldKey;
        button.setAttribute("aria-label", `Open help for ${field.label}`);
        button.textContent = "?";
        labelElement.appendChild(button);
        button.addEventListener("click", () => {
          const rect = button.getBoundingClientRect();
          setActiveFieldKey(fieldKey);
          setTooltip({
            rect,
            field,
            anchorEl: button,
            validation:
              fieldStatesRef.current[fieldKey] ||
              validateGuidanceField(
                field,
                getFieldValueFromElement(fieldElement),
                Object.fromEntries(
                  Object.entries(fieldStatesRef.current).map(([key, value]) => [
                    key,
                    value?.value ?? "",
                  ])
                )
              ),
          });
        });
      }

      const markTouchedAndSync = () => syncField(fieldKey, fieldElement, inlineNode, true);
      const setFocused = () => {
        setActiveFieldKey(fieldKey);
        syncField(fieldKey, fieldElement, inlineNode, false);
      };
      const onInput = () => syncField(fieldKey, fieldElement, inlineNode, false);

      fieldElement.addEventListener("focus", setFocused);
      fieldElement.addEventListener("blur", markTouchedAndSync);
      fieldElement.addEventListener("input", onInput);
      fieldElement.addEventListener("change", onInput);

      listeners.push(() =>
        fieldElement.removeEventListener("focus", setFocused)
      );
      listeners.push(() =>
        fieldElement.removeEventListener("blur", markTouchedAndSync)
      );
      listeners.push(() =>
        fieldElement.removeEventListener("input", onInput)
      );
      listeners.push(() =>
        fieldElement.removeEventListener("change", onInput)
      );

      bindings[fieldKey] = { fieldElement, inlineNode };
      syncField(fieldKey, fieldElement, inlineNode, false);
    };

    Object.entries(tool.fields || {}).forEach(([fieldKey, field]) =>
      attachField(fieldKey, field)
    );

    fieldBindingsRef.current = bindings;

    const mutationObserver = new MutationObserver(() => {
      setActiveErrors(extractToolErrors(root));
    });
    mutationObserver.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    setActiveErrors(extractToolErrors(root));

    const clickHandler = (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.closest("button")) return;

      const text = target.textContent?.toLowerCase() || "";
      if (
        /(scan|test|run|check|analy|lookup|monitor|validate)/.test(text)
      ) {
        let hasBlockingGuidance = false;
        Object.entries(bindings).forEach(([fieldKey, binding]) => {
          syncField(fieldKey, binding.fieldElement, binding.inlineNode, true);
          const currentValidation = validateGuidanceField(
            tool.fields[fieldKey],
            getFieldValueFromElement(binding.fieldElement),
            Object.fromEntries(
              Object.entries(fieldStatesRef.current).map(([key, value]) => [
                key,
                value?.value ?? "",
              ])
            )
          );
          if (currentValidation && (currentValidation.status === "error" || currentValidation.status === "warning")) {
            hasBlockingGuidance = true;
          }
        });
        if (hasBlockingGuidance) setOpen(true);
      }
    };
    root.addEventListener("click", clickHandler, true);

    return () => {
      mutationObserver.disconnect();
      root.removeEventListener("click", clickHandler, true);
      listeners.forEach((dispose) => dispose());
      Object.values(bindings).forEach((binding) => binding.inlineNode?.remove());
      root.querySelectorAll(".tool-guidance-label-button").forEach((button) => button.remove());
    };
  }, [tool, toolSlug]);

  const troubleshootingItems = useMemo(() => {
    if (!tool) return [];
    return getTroubleshootingMatches(tool, activeErrors.join(" "));
  }, [activeErrors, tool]);

  if (!tool) {
    return children;
  }

  return (
    <div ref={rootRef} className="tool-guidance-root relative">
      {children}
      <ToolHelpPanel
        open={open}
        onToggle={() => setOpen((value) => !value)}
        tool={tool}
        fieldStates={fieldStates}
        activeFieldKey={activeFieldKey}
        setActiveFieldKey={(fieldKey) => {
          setActiveFieldKey(fieldKey);
          setOpen(true);
          const binding = fieldBindingsRef.current[fieldKey];
          if (binding?.fieldElement) {
            binding.fieldElement.focus();
            binding.fieldElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }}
        troubleshootingItems={troubleshootingItems}
        activeErrors={activeErrors}
      />
      <GuidanceTooltip
        tooltip={tooltip}
        onClose={() => setTooltip(null)}
      />
    </div>
  );
}
