export function setup(helper) {
  if (!helper.markdownIt) {
    return;
  }
  let words = {};
  helper.registerOptions((opts, siteSettings) => {
    
    opts.features["discourse_tura_enabled"] =
      !!siteSettings.discourse_tura_enabled;
    
    for (let line of siteSettings.discourse_tura_list.split("|")) {
      let split = line.split("==");
      if (line.length) {
        words[split[0]] = split[1];
      }
    }
  });

  helper.allowList(["span.abbreviation", "span.abbreviation span.tooltiptext"]);


  helper.registerPlugin((md) => {
    console.log("md", md);

    const ruleRegex = new RegExp(Object.keys(words).join("|"), "gi");
    // add rule to detect matches and then replace them with the appropriate html

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
                return `<span id="abbreviation" class="abbreviation" >${match}<span class="tooltiptext">${
                  words[match.toLowerCase()]
                }</span></span>`;
              });
            }
          }
        });
      });
    });
  });
}
