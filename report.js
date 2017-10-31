[
  "js_errors",
  "deprecations",
  "credentials",
  "logs_run",
  "logs_rerun"
].forEach(name =>
  $(document.body).on("click", `.${name}-btn`, () =>
    $(`#${name}`).html(window[name])
  )
);

function normaliseStatus(status) {
  const statesMap = {
    success: "passed",
    failure: "failed",
    error: "failed",
    skipped: "skipped"
  };
  return statesMap[status];
}

function getResultTestRailCasesHtml(result) {
  if (!result.testrail_cases || !result.testrail_cases.length) {
    return "";
  }
  return `
  <pre><b>Case Source: </b>${result.testrail_cases
    .map(
      tr_case =>
        `<a class="link testrail" target="_blank" href="${tr_case}">C${tr_case
          .split("/")
          .pop()}</a>`
    )
    .join(" ")}</pre>
  `;
}

function getResultScreenShotHtml(result) {
  if (!result.screenshot) {
    return "";
  }
  return `<pre><b>Screenshot: </b><a class="fancybox"><img class="image" alt="" src="data:image/jpeg;base64,${result.screenshot}"></img></a></pre>`;
}

function getResultErrorHtml(result) {
  if (!result.tb) {
    return "";
  }
  return `
    <pre><b>Error Message: </b></pre>
        <pre>${result.tb}</pre>
  `;
}

function getResultHtml(result, index) {
  const state = normaliseStatus(result.status);
  return `
  <div class="case-wrap ${state}">
      <span class="sh-link show-link">${result.description}</span>
      <span class="sh-link hide-link">${result.description}</span>
      <div class="info-box">
          <pre><b>Test Name: </b>${result.tc_name}</pre>
          <pre><b>Source: </b><a class="link github" target="_blank" href="${result.github}">github</a></pre>
          ${getResultTestRailCasesHtml(result)}
          <pre><b>Running Time: </b>${result.time}s</pre>
          <pre><b>State: </b><a>${state}</a></pre>
          ${getResultScreenShotHtml(result)}
          ${getResultErrorHtml(result)}
      </div>
 </div>
  `;
}

function drawFilteredResults() {
  const stateForFilter = $("#filter").val();
  const filteredResults =
    stateForFilter === `all`
      ? [...resultsData]
      : resultsData.filter(
          report => normaliseStatus(report.status) === stateForFilter
        );

  const filteredResultsHtml = filteredResults.map(getResultHtml).join("");
  $(".testcases").html(filteredResultsHtml);
}

$(document.body).on("click", ".show-link", function() {
  $(this).hide();
  $(this)
    .closest(".case-wrap")
    .find(".hide-link")
    .show();
  $(this)
    .closest(".case-wrap")
    .find(".info-box")
    .stop()
    .slideDown(200);
});
$(document.body).on("click", ".hide-link", function() {
  $(this).hide();
  $(this)
    .closest(".case-wrap")
    .find(".show-link")
    .show();
  $(this)
    .closest(".case-wrap")
    .find(".info-box")
    .stop()
    .slideUp(200);
});

$("b.date").each(function() {
  var x = new Date($(this).text());
  $(this).text(x);
});

$("#filter")
  .on("change", drawFilteredResults)
  .on("change", () =>
    $(".failed").each((index, el) =>
      $(el)
        .find(".show-link")
        .click()
    )
  )
  .change();

$(".fancybox").fancybox();

$(".fancybox").each(function() {
  $(this).attr(
    "href",
    $(this)
      .find("img")
      .attr("src")
  );
});
