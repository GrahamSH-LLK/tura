export function setup(helper) {
  if (!helper.markdownIt) {
    return;
  }
  let words = {};
  helper.registerOptions((opts, siteSettings) => {
    opts.features["tura"] =
      !!siteSettings.discourse_tura_enabled;
    for (let line of siteSettings.discourse_tura_list.split("|")) {
      let split = line.split("==");
      if (line.length) {
        words[split[0]] = split[1];
      }
    }
  });

  helper.allowList(["span.abbreviation", "template.tooltiptext"]);

  helper.registerPlugin((md) => {
    console.log("md", md);

    // const ruleRegex = new RegExp(Object.keys(words).join("|"), "gi");
    // regex that makes sure that the abbreviation is not in a word
    const ruleRegex = new RegExp(
      `\\b(${Object.keys(words).join("|")})\\b`,
      "gi"
    );

    md.core.ruler.push("replace", (state) => {
      state.tokens.forEach((token) => {
        if (token.type !== "inline") {
          return;
        }

        token.children.forEach((child) => {
          if (child.type === "text") {
            // replace with element with tooltip attribute
            if (child.content.match(ruleRegex)) {
              child.type = "html_inline";
              child.content = child.content.replace(ruleRegex, (match) => {
                console.log("match", match);
                return `<span id="abbreviation" class="abbreviation" >${match}<template class="tooltiptext">${
                  words[match.toLowerCase()]
                }</template></span>`;
              });
            }
          }
        });
      });
    });
  });
}
