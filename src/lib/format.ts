export function formatCurrency(amount: number) {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? "-" : "";
  return sign + Math.abs(rounded).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
