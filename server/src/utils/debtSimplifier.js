/**
 * Greedy minimum-transaction debt simplification algorithm.
 */
export function simplifyDebts(splits) {
  const netBalance = {}

  splits.forEach(({ userId, amount, paidById }) => {
    const uid = userId.toString()
    const pid = paidById.toString()
    if (uid !== pid) {
      netBalance[uid] = (netBalance[uid] || 0) - amount
      netBalance[pid] = (netBalance[pid] || 0) + amount
    }
  })

  const creditors = []
  const debtors   = []

  Object.entries(netBalance).forEach(([userId, balance]) => {
    if (balance > 0.01)  creditors.push({ userId, amount: balance })
    if (balance < -0.01) debtors.push({ userId, amount: Math.abs(balance) })
  })

  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  const transactions = []
  let ci = 0, di = 0

  while (ci < creditors.length && di < debtors.length) {
    const pay = Math.min(creditors[ci].amount, debtors[di].amount)
    if (pay > 0.01) {
      transactions.push({
        from:   debtors[di].userId,
        to:     creditors[ci].userId,
        amount: Math.round(pay * 100) / 100
      })
    }
    creditors[ci].amount -= pay
    debtors[di].amount   -= pay
    if (creditors[ci].amount < 0.01) ci++
    if (debtors[di].amount   < 0.01) di++
  }

  return transactions
}
