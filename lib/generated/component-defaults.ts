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
"label": {  };
"form-field": {  }
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
  "label": {},
  "form-field": {}
};
