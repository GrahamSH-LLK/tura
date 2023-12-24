import { createPopper } from "@popperjs/core";
import { withPluginApi } from "discourse/lib/plugin-api";
import { iconHTML } from "discourse-common/lib/icon-library";
let inlineabbreviationPopper;
function buildTooltip() {
  let html = `
    <div id="abbreviation-tooltip" role="tooltip">
      <div class="abbreviation-tooltip-content"></div>
      <div id="arrow" data-popper-arrow></div>
    </div>
  `;

  let template = document.createElement("template");
  html = html.trim();
  template.innerHTML = html;
  return template.content.firstChild;
}
function applyInlineabbreviations(elem) {
  const abbreviationRefs = elem.querySelectorAll(".abbreviation");

  abbreviationRefs.forEach((abbreviationRef) => {
    abbreviationRef.addEventListener("mouseover", abbreviationEventHandler);
    abbreviationRef.addEventListener("mouseout", () => {
      inlineabbreviationPopper?.destroy();
      document
        .getElementById("abbreviation-tooltip")
        ?.removeAttribute("data-show");
    });
    abbreviationRef.classList.add("abbreviation-enabled");
  });
}

function abbreviationEventHandler(event) {
  inlineabbreviationPopper?.destroy();

  const tooltip = document.getElementById("abbreviation-tooltip");

  // reset state by hidding tooltip, it handles "click outside"
  // allowing to hide the tooltip when you click anywhere else
  tooltip?.removeAttribute("data-show");

  event.preventDefault();
  event.stopPropagation();

  // append abbreviation to tooltip body
  const expandableabbreviation = event.target;
  const abbreviationContent = tooltip.querySelector(
    ".abbreviation-tooltip-content"
  );
  let newContent = event.target.querySelector(".tooltiptext");
  if (!newContent.getAttribute("data-text")) {
    abbreviationContent.innerHTML = newContent.innerHTML;
  } else {
    abbreviationContent.innerHTML = newContent.getAttribute("data-text");
  }

  // display tooltip
  tooltip.dataset.show = "";

  // setup popper
  inlineabbreviationPopper?.destroy();
  inlineabbreviationPopper = createPopper(expandableabbreviation, tooltip, {
    modifiers: [
      {
        name: "arrow",
        options: { element: tooltip.querySelector("#arrow") },
      },
      {
        name: "preventOverflow",
        options: {
          altAxis: true,
          padding: 5,
        },
      },
      {
        name: "offset",
        options: {
          offset: [0, 12],
        },
      },
    ],
  });
}
function addSetting(api) {
  api.modifyClass("controller:preferences/profile", {
    pluginId: "tura",

    actions: {
      save() {
        this.set(
          "model.custom_fields.see_abbreviations",
          this.get("model.see_abbreviations")
        );
        this.get("saveAttrNames").push("custom_fields");
        this._super();
      },
    },
  });
}

export default {
  name: "tura",

  initialize(container) {
    const siteSettings = container.lookup("site-settings:main");

    document.documentElement.append(buildTooltip());

    withPluginApi("0.1", (api) => addSetting(api, siteSettings));
    withPluginApi("0.8.9", (api) => {
      const currentUser = api.getCurrentUser();
      let enabled;

      if (currentUser) {
        enabled = currentUser.get("custom_fields.see_abbreviations") ?? true;
      } else {
        enabled = true;
      }
      if (!enabled) {
        return;
      }

      api.decorateCookedElement((elem) => applyInlineabbreviations(elem), {
        onlyStream: true,
        id: "abbreviation",
      });

      api.onPageChange(() => {
        document
          .getElementById("abbreviation-tooltip")
          ?.removeAttribute("data-show");
      });
    });
  },
};
