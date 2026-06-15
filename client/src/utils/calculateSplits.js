export function calculateEqualSplits(amount, userIds) {
  const share = Math.round((amount / userIds.length) * 100) / 100
  const splits = userIds.map(uid => ({ userId: uid, amount: share }))
  const diff = amount - splits.reduce((s, x) => s + x.amount, 0)
  if (diff !== 0 && splits.length) splits[0].amount += diff
  return splits
}

export function calculatePercentageSplits(amount, entries) {
  return entries.map(e => ({
    userId: e.userId,
    amount: Math.round((amount * e.percent / 100) * 100) / 100,
    percent: e.percent,
  }))
}
