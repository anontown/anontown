const ref = process.env["REF"];

const tagSuffix = (() => {
  if (ref === "refs/heads/master") {
    return "";
  }

  if (ref == "refs/heads/develop") {
    return "-dev";
  }

  const branchName = startsWithTail(ref, "refs/heads/");
  if (branchName !== null) {
    return `-branch--${branchName.replace(/\W/g, "-")}`;
  }

  const tagName = startsWithTail(ref, "refs/tags/");
  if (tagName !== null) {
    return `-tag--${tagName.replace(/\W/g, "-")}`;
  }

  throw new Error(`unknown ref: ${ref}`);
})();

console.log(tagSuffix);

function startsWithTail(s, searchString) {
  if (s.startsWith(searchString)) {
    return s.substring(searchString.length);
  } else {
    return null;
  }
}
