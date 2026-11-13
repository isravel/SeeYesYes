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
"confirm-dialog": { "confirmLabel": string; "cancelLabel": string; "destructive": boolean; "errorMessage": string; "pendingLabel": string; "size": "small" | "medium" | "large" };
"dropdown-menu": {  };
"tabs": { "orientation": "horizontal" | "vertical"; "activation": "automatic" | "manual"; "variant": "boxed" | "line" };
"tooltip": { "placement": "top" | "bottom" | "left" | "right"; "delay": number };
"popover": { "placement": "bottom" | "top" | "left" | "right" };
"drawer": { "side": "right" | "left" | "top" | "bottom"; "size": "small" | "medium" | "large"; "dismissOnOutsidePress": boolean; "closeOnEscape": boolean; "closeLabel": string };
"toast": { "tone": "info" | "success" | "warning" | "destructive"; "position": "bottom-center" | "bottom-end" | "top-center" | "top-end"; "actionErrorMessage": string; "timeout": number };
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
"input-otp": { "length": number; "masked": boolean; "defaultValue": string; "size": "small" | "medium" | "large"; "required": boolean };
"combobox": { "filter": boolean; "loading": boolean; "loadingLabel": string; "emptyLabel": string; "size": "small" | "medium" | "large"; "required": boolean };
"disclosure": { "defaultOpen": boolean; "openOnHover": boolean };
"accordion": { "mode": "single" | "multiple"; "collapsible": boolean; "headingLevel": 2 | 3 | 4 | 5 | 6 };
"pagination": { "defaultPage": number; "label": string; "size": "small" | "medium" | "large"; "siblings": number; "previousLabel": string; "nextLabel": string };
"breadcrumbs": { "label": string; "separator": "slash" | "chevron" };
"animated-badge": { "animated": boolean };
"shiny-text": { "animated": boolean };
"rotating-word": { "animated": boolean; "interval": number; "paused": boolean };
"menu-toggle": { "defaultExpanded": boolean; "size": "medium" | "small" | "large"; "animated": boolean };
"logo": { "size": "medium" | "small" | "large"; "animated": boolean };
"fancy-arrow": { "placement": "inline" | "top-start" | "top-end" | "bottom-start" | "bottom-end"; "direction": "right" | "down" | "left" | "up" };
"tilt-card": { "tilt": boolean; "maxTilt": number; "depth": boolean };
"card-swap": { "defaultIndex": number; "autoplay": boolean; "interval": number };
"carousel": { "autoplay": boolean; "interval": number; "edgeFade": boolean; "peek": boolean };
"media-frame": { "kind": "image" | "video"; "ratio": "16:9" | "4:3" | "1:1" | "3:2" | "21:9"; "fit": "cover" | "contain"; "hover": "none" | "zoom" | "color"; "vignette": boolean };
"share-buttons": { "label": string; "copyLink": boolean; "attribution": boolean; "size": "medium" | "small" | "large"; "copiedMessage": string; "copyFailedMessage": string };
"footer": { "label": string };
"section-head": { "level": 2 | 3 | 4; "viewAllLabel": string };
"stat-strip": { "missingLabel": string };
"cta-panel": { "level": 2 | 3 | 4; "texture": boolean };
"navbar": { "label": string; "sticky": boolean; "menuLabel": string; "defaultMenuOpen": boolean };
"hero": { "level": 1 | 2; "layout": "auto" | "centered" | "split" };
"feature-bento": { "layout": "grid" | "three-over-four"; "level": 3 | 2 | 4 };
"testimonials": { "label": string; "unavailableLabel": string };
"app-badges": { "label": string; "size": "medium" | "small" | "large" };
"instructor": { "level": 3 | 2 | 4 };
"listing-head": { "level": 2 | 1 | 3 | 4; "loading": boolean; "loadingLabel": string };
"toolbar": { "label": string; "pending": boolean; "pendingLabel": string };
"card-grid": { "view": "grid" | "list"; "columns": "auto" | "two"; "status": "ready" | "loading" | "error"; "label": string; "loadingLabel": string; "retryLabel": string; "filtered": boolean };
"list-card": { "level": 3 | 2 | 4; "linkLabel": string };
"clear-filters": { "label": string; "appearance": "text" | "button" };
"course-card": { "level": 3 | 2 | 4; "linkLabel": string; "layout": "grid" | "list"; "priceLabel": string; "originalPriceLabel": string };
"event-card": { "level": 3 | 2 | 4; "linkLabel": string };
"cohort-card": { "level": 3 | 2 | 4; "statusTone": "neutral" | "primary" | "success" | "warning" | "destructive"; "toolsLabel": string; "linkLabel": string; "tilt": boolean; "texture": boolean }
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
  "confirm-dialog": {
    "confirmLabel": "Confirm",
    "cancelLabel": "Cancel",
    "destructive": false,
    "errorMessage": "Could not finish. Try again.",
    "pendingLabel": "Working…",
    "size": "medium"
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
  "toast": {
    "tone": "info",
    "position": "bottom-center",
    "actionErrorMessage": "That did not work. Try again.",
    "timeout": 5000
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
  "input-otp": {
    "length": 6,
    "masked": false,
    "defaultValue": "",
    "size": "medium",
    "required": false
  },
  "combobox": {
    "filter": true,
    "loading": false,
    "loadingLabel": "Loading…",
    "emptyLabel": "No results",
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
  },
  "animated-badge": {
    "animated": false
  },
  "shiny-text": {
    "animated": false
  },
  "rotating-word": {
    "animated": false,
    "interval": 3000,
    "paused": false
  },
  "menu-toggle": {
    "defaultExpanded": false,
    "size": "medium",
    "animated": true
  },
  "logo": {
    "size": "medium",
    "animated": false
  },
  "fancy-arrow": {
    "placement": "inline",
    "direction": "right"
  },
  "tilt-card": {
    "tilt": false,
    "maxTilt": 8,
    "depth": false
  },
  "card-swap": {
    "defaultIndex": 0,
    "autoplay": false,
    "interval": 5000
  },
  "carousel": {
    "autoplay": false,
    "interval": 3000,
    "edgeFade": false,
    "peek": false
  },
  "media-frame": {
    "kind": "image",
    "ratio": "16:9",
    "fit": "cover",
    "hover": "none",
    "vignette": false
  },
  "share-buttons": {
    "label": "Share",
    "copyLink": true,
    "attribution": true,
    "size": "medium",
    "copiedMessage": "Link copied.",
    "copyFailedMessage": "Could not copy the link. Select the address and copy it by hand."
  },
  "footer": {
    "label": "Footer"
  },
  "section-head": {
    "level": 2,
    "viewAllLabel": "View all"
  },
  "stat-strip": {
    "missingLabel": "Not provided"
  },
  "cta-panel": {
    "level": 2,
    "texture": false
  },
  "navbar": {
    "label": "Main",
    "sticky": true,
    "menuLabel": "Menu",
    "defaultMenuOpen": false
  },
  "hero": {
    "level": 1,
    "layout": "auto"
  },
  "feature-bento": {
    "layout": "grid",
    "level": 3
  },
  "testimonials": {
    "label": "Testimonials",
    "unavailableLabel": "This video could not be loaded."
  },
  "app-badges": {
    "label": "Get the app",
    "size": "medium"
  },
  "instructor": {
    "level": 3
  },
  "listing-head": {
    "level": 2,
    "loading": false,
    "loadingLabel": "Loading results…"
  },
  "toolbar": {
    "label": "Filter and sort",
    "pending": false,
    "pendingLabel": "Updating results…"
  },
  "card-grid": {
    "view": "grid",
    "columns": "auto",
    "status": "ready",
    "label": "Results",
    "loadingLabel": "Loading results…",
    "retryLabel": "Retry",
    "filtered": false
  },
  "list-card": {
    "level": 3,
    "linkLabel": "View details"
  },
  "clear-filters": {
    "label": "Clear filters",
    "appearance": "text"
  },
  "course-card": {
    "level": 3,
    "linkLabel": "View course",
    "layout": "grid",
    "priceLabel": "Price",
    "originalPriceLabel": "Original price"
  },
  "event-card": {
    "level": 3,
    "linkLabel": "View event"
  },
  "cohort-card": {
    "level": 3,
    "statusTone": "neutral",
    "toolsLabel": "Tools",
    "linkLabel": "View cohort",
    "tilt": false,
    "texture": false
  }
};
