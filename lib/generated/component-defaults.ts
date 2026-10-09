// Generated from registry contracts. Do not edit.
export type ComponentDefaults = {
"button": { "variant": "primary" | "secondary" | "ghost" | "destructive"; "size": "small" | "medium" | "large"; "type": "button" | "submit" | "reset"; "disabled": boolean; "loading": boolean };
"spinner": { "size": "small" | "medium" | "large" };
"link": { "variant": "default" | "subtle" };
"card": { "variant": "default" | "outlined" };
"badge": { "tone": "neutral" | "primary" | "success" | "warning" | "destructive" };
"separator": { "orientation": "horizontal" | "vertical"; "decorative": boolean };
"avatar": { "size": "small" | "medium" | "large" };
"alert": { "tone": "info" | "success" | "warning" | "destructive" };
"progress": { "max": number };
"skeleton": { "shape": "text" | "rect" | "circle" };
"input": { "type": string; "size": "small" | "medium" | "large" };
"textarea": { "size": "small" | "medium" | "large"; "rows": number };
"select": { "size": "small" | "medium" | "large" };
"checkbox": { "size": "small" | "medium" | "large" };
"radio-group": { "orientation": "horizontal" | "vertical" };
"switch": { "size": "small" | "medium" | "large" };
"label": { "required": boolean };
"form-field": { "required": boolean };
"dialog": { "size": "small" | "medium" | "large"; "dismissOnOutsidePress": boolean; "closeOnEscape": boolean; "closeLabel": string };
"dropdown-menu": {  };
"tabs": { "orientation": "horizontal" | "vertical"; "activation": "automatic" | "manual" };
"tooltip": { "placement": "top" | "bottom" | "left" | "right"; "delay": number };
"table": { "emptyMessage": string };
"navigation": { "triggerLabel": string; "showSkipLink": boolean };
"loading-state": { "variant": "spinner" | "skeleton" };
"empty-state": {  };
"error-state": { "title": string; "retryLabel": string };
"not-found": { "title": string; "description": string; "homeHref": string; "homeLabel": string };
"copy-button": { "successMessage": string; "failureMessage": string }
};
export const contractDefaults: ComponentDefaults = {
  "button": {
    "variant": "primary",
    "size": "medium",
    "type": "button",
    "disabled": false,
    "loading": false
  },
  "spinner": {
    "size": "medium"
  },
  "link": {
    "variant": "default"
  },
  "card": {
    "variant": "default"
  },
  "badge": {
    "tone": "neutral"
  },
  "separator": {
    "orientation": "horizontal",
    "decorative": true
  },
  "avatar": {
    "size": "medium"
  },
  "alert": {
    "tone": "info"
  },
  "progress": {
    "max": 100
  },
  "skeleton": {
    "shape": "text"
  },
  "input": {
    "type": "text",
    "size": "medium"
  },
  "textarea": {
    "size": "medium",
    "rows": 3
  },
  "select": {
    "size": "medium"
  },
  "checkbox": {
    "size": "medium"
  },
  "radio-group": {
    "orientation": "vertical"
  },
  "switch": {
    "size": "medium"
  },
  "label": {
    "required": false
  },
  "form-field": {
    "required": false
  },
  "dialog": {
    "size": "medium",
    "dismissOnOutsidePress": false,
    "closeOnEscape": true,
    "closeLabel": "Close"
  },
  "dropdown-menu": {},
  "tabs": {
    "orientation": "horizontal",
    "activation": "automatic"
  },
  "tooltip": {
    "placement": "top",
    "delay": 600
  },
  "table": {
    "emptyMessage": "No rows to show."
  },
  "navigation": {
    "triggerLabel": "Open navigation",
    "showSkipLink": true
  },
  "loading-state": {
    "variant": "spinner"
  },
  "empty-state": {},
  "error-state": {
    "title": "Could not load this content",
    "retryLabel": "Retry"
  },
  "not-found": {
    "title": "We could not find that page",
    "description": "It may have moved or the address may be incorrect.",
    "homeHref": "/",
    "homeLabel": "Return to overview"
  },
  "copy-button": {
    "successMessage": "Copied to clipboard.",
    "failureMessage": "Could not copy. Check clipboard access and try again."
  }
};
