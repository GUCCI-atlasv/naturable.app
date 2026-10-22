// Token-level diff (LCS). Returns ops; rendering is left to the caller.

function tokens(text) {
  return text.match(/[㐀-鿿]|[A-Za-z0-9_]+|\s+|[^\s\w㐀-鿿]/g) || [];
}

export function diff(a, b) {
  const A = tokens(a), B = tokens(b), n = A.length, m = B.length;
  if (n * m > 250000) {
    return { ops: [{ type: "del", text: a }, { type: "add", text: b }], added: m, removed: n, changes: 1 };
  }
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const ops = [];
  let i = 0, j = 0, added = 0, removed = 0, changes = 0, last = "same";
  const push = (type, text) => {
    const prev = ops[ops.length - 1];
    if (prev && prev.type === type) prev.text += text;
    else ops.push({ type, text });
  };
  while (i < n || j < m) {
    let type, val;
    if (i < n && j < m && A[i] === B[j]) { type = "same"; val = A[i++]; j++; }
    else if (j < m && (i === n || dp[i][j + 1] >= dp[i + 1][j])) { type = "add"; val = B[j++]; added++; }
    else { type = "del"; val = A[i++]; removed++; }
    if (type !== "same" && last !== type) changes++;
    push(type, val);
    last = type;
  }
  return { ops, added, removed, changes };
}
