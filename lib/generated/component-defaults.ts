// Generated from component contracts. Do not edit.
export type ComponentDefaults = {
"button": { "variant": "primary" | "secondary" | "ghost" | "destructive" | "outline" | "soft" | "muted" | "solid" | "danger"; "size": "small" | "medium" | "large"; "type": "button" | "submit" | "reset"; "disabled": boolean; "loading": boolean };
"spinner": { "size": "small" | "medium" | "large" };
"link": { "variant": "default" | "subtle" | "button-primary" | "button-secondary" };
"card": { "variant": "default" | "outlined" | "elevated" };
"badge": { "tone": "neutral" | "primary" | "success" | "warning" | "destructive" };
"separator": { "orientation": "horizontal" | "vertical"; "decorative": boolean };
"avatar": { "size": "small" | "medium" | "large"; "ring": boolean };
"alert": { "tone": "info" | "success" | "warning" | "destructive"; "variant": "solid" | "outline" | "text" };
"progress": { "max": number; "tone": "primary" | "neutral" };
"skeleton": { "shape": "text" | "rect" | "circle" };
"backdrop": { "variant": "tint" | "faded" };
"theme-switcher": { "variant": "icon" | "labeled"; "size": "medium" | "small" | "large"; "label": string };
"input": { "type": string; "size": "small" | "medium" | "large" };
"textarea": { "size": "small" | "medium" | "large"; "rows": number; "autoGrow": boolean; "maxRows": number };
"select": { "size": "small" | "medium" | "large" };
"checkbox": { "size": "small" | "medium" | "large"; "tone": "primary" | "neutral"; "indeterminate": boolean };
"radio-group": { "orientation": "horizontal" | "vertical" };
"switch": { "size": "small" | "medium" | "large"; "tone": "primary" | "neutral" };
"label": { "required": boolean };
"form-field": { "required": boolean };
"fieldset": { "required": boolean };
"dialog": { "size": "small" | "medium" | "large"; "dismissOnOutsidePress": boolean; "closeOnEscape": boolean; "closeLabel": string };
"dropdown-menu": {  };
"tabs": { "orientation": "horizontal" | "vertical"; "activation": "automatic" | "manual"; "variant": "boxed" | "line" };
"tooltip": { "placement": "top" | "bottom" | "left" | "right"; "delay": number };
"popover": { "placement": "bottom" | "top" | "left" | "right" };
"drawer": { "side": "right" | "left" | "top" | "bottom"; "size": "small" | "medium" | "large"; "dismissOnOutsidePress": boolean; "closeOnEscape": boolean; "closeLabel": string };
"table": { "emptyMessage": string; "header": "muted" | "plain"; "rowHover": boolean };
"navigation": { "triggerLabel": string; "showSkipLink": boolean; "collapsed": boolean };
"loading-state": { "variant": "spinner" | "skeleton" };
"empty-state": {  };
"error-state": { "title": string; "retryLabel": string };
"not-found": { "title": string; "description": string; "homeHref": string; "homeLabel": string; "headingLevel": number };
"copy-button": { "successMessage": string; "failureMessage": string };
"highlight": {  };
"level": { "tone": "neutral" | "success" | "warning" | "destructive" | "info" };
"live-dot": { "status": "live" | "inactive"; "size": "small" | "medium"; "animated": boolean };
"kbd": { "size": "small" | "medium" };
"avatar-group": { "max": number; "size": "medium" | "small" | "large" };
"icon-button": { "variant": "ghost" | "outline" | "soft" | "muted" | "primary" | "secondary" | "destructive"; "size": "small" | "medium" | "large"; "loading": boolean };
"search-input": { "defaultValue": string; "clearLabel": string; "searching": boolean; "searchingLabel": string; "size": "small" | "medium" | "large" };
"segmented": { "size": "small" | "medium" | "large" };
"chip": { "tone": "neutral" | "primary" | "success" | "warning" | "destructive" | "info"; "size": "medium" | "small"; "defaultSelected": boolean; "removing": boolean };
"checkbox-group": { "orientation": "vertical" | "horizontal"; "size": "small" | "medium" | "large"; "required": boolean };
"disclosure": { "defaultOpen": boolean; "openOnHover": boolean };
"accordion": { "mode": "single" | "multiple"; "collapsible": boolean; "headingLevel": 2 | 3 | 4 | 5 | 6 };
"pagination": { "defaultPage": number; "label": string; "size": "small" | "medium" | "large"; "siblings": number; "previousLabel": string; "nextLabel": string };
"breadcrumbs": { "label": string; "separator": "slash" | "chevron" }
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
    "size": "medium",
    "ring": false
  },
  "alert": {
    "tone": "info",
    "variant": "solid"
  },
  "progress": {
    "max": 100,
    "tone": "primary"
  },
  "skeleton": {
    "shape": "text"
  },
  "backdrop": {
    "variant": "tint"
  },
  "theme-switcher": {
    "variant": "icon",
    "size": "medium",
    "label": "Theme"
  },
  "input": {
    "type": "text",
    "size": "medium"
  },
  "textarea": {
    "size": "medium",
    "rows": 3,
    "autoGrow": false,
    "maxRows": 10
  },
  "select": {
    "size": "medium"
  },
  "checkbox": {
    "size": "medium",
    "tone": "primary",
    "indeterminate": false
  },
  "radio-group": {
    "orientation": "vertical"
  },
  "switch": {
    "size": "medium",
    "tone": "primary"
  },
  "label": {
    "required": false
  },
  "form-field": {
    "required": false
  },
  "fieldset": {
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
    "activation": "automatic",
    "variant": "boxed"
  },
  "tooltip": {
    "placement": "top",
    "delay": 600
  },
  "popover": {
    "placement": "bottom"
  },
  "drawer": {
    "side": "right",
    "size": "medium",
    "dismissOnOutsidePress": true,
    "closeOnEscape": true,
    "closeLabel": "Close"
  },
  "table": {
    "emptyMessage": "No rows to show.",
    "header": "muted",
    "rowHover": false
  },
  "navigation": {
    "triggerLabel": "Open navigation",
    "showSkipLink": true,
    "collapsed": false
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
    "homeLabel": "Return to overview",
    "headingLevel": 1
  },
  "copy-button": {
    "successMessage": "Copied to clipboard.",
    "failureMessage": "Could not copy. Check clipboard access and try again."
  },
  "highlight": {},
  "level": {
    "tone": "neutral"
  },
  "live-dot": {
    "status": "live",
    "size": "small",
    "animated": false
  },
  "kbd": {
    "size": "small"
  },
  "avatar-group": {
    "max": 4,
    "size": "medium"
  },
  "icon-button": {
    "variant": "ghost",
    "size": "medium",
    "loading": false
  },
  "search-input": {
    "defaultValue": "",
    "clearLabel": "Clear search",
    "searching": false,
    "searchingLabel": "Searching…",
    "size": "medium"
  },
  "segmented": {
    "size": "medium"
  },
  "chip": {
    "tone": "neutral",
    "size": "medium",
    "defaultSelected": false,
    "removing": false
  },
  "checkbox-group": {
    "orientation": "vertical",
    "size": "medium",
    "required": false
  },
  "disclosure": {
    "defaultOpen": false,
    "openOnHover": false
  },
  "accordion": {
    "mode": "single",
    "collapsible": true,
    "headingLevel": 3
  },
  "pagination": {
    "defaultPage": 1,
    "label": "Pagination",
    "size": "medium",
    "siblings": 1,
    "previousLabel": "Previous",
    "nextLabel": "Next"
  },
  "breadcrumbs": {
    "label": "Breadcrumbs",
    "separator": "slash"
  }
};
