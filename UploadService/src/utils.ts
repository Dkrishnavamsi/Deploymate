const MAX_LEN = 5;

export function generateId() {
  let ans = "";
  const subset = "12345678qwertyuiopasdfghjklzxcvbnm";
  for (let i = 0; i < MAX_LEN; i++) {
    ans += subset[Math.floor(Math.random() * subset.length)];
  }
  return ans;
}
