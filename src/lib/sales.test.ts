import { describe, expect, it } from "vitest";
import { saleTotals, validateSaleTotals } from "./sales";

describe("saleTotals", () => {
  it("mandatory example: R$ 4.000 sale with R$ 1.500 trade-in and R$ 2.500 Pix", () => {
    const t = saleTotals([400000], 0, 150000, [250000]);
    expect(t.totalCents).toBe(400000); // faturamento R$ 4.000
    expect(t.receivedCents).toBe(250000); // entrada de dinheiro R$ 2.500
    expect(t.tradeInCents).toBe(150000); // aquisição do usado R$ 1.500
    expect(t.balanceCents).toBe(0);
    expect(validateSaleTotals(t)).toBeNull();
  });

  it("trade-in is not a discount and not cash", () => {
    const t = saleTotals([400000], 0, 150000, [250000]);
    expect(t.totalCents).toBe(t.itemsCents); // trade-in did not reduce revenue
    expect(t.receivedCents).toBe(250000); // only Pix counts as money in
  });

  it("applies discount to revenue", () => {
    const t = saleTotals([300000, 100000], 50000, 0, [350000]);
    expect(t.itemsCents).toBe(400000);
    expect(t.totalCents).toBe(350000);
    expect(t.balanceCents).toBe(0);
  });

  it("computes pending balance when payments are partial", () => {
    const t = saleTotals([400000], 0, 0, [100000]);
    expect(t.balanceCents).toBe(300000);
  });

  it("rejects overpayment (payments + trade-in above total)", () => {
    const t = saleTotals([400000], 0, 150000, [250001]);
    expect(t.balanceCents).toBe(-1);
    expect(validateSaleTotals(t)).toMatch(/excedem/);
  });

  it("rejects discount larger than the total", () => {
    const t = saleTotals([100000], 100001, 0, []);
    expect(validateSaleTotals(t)).toMatch(/desconto/i);
  });

  it("sums combined payments in cents without drift", () => {
    const t = saleTotals([99999], 0, 0, [33333, 33333, 33333]);
    expect(t.receivedCents).toBe(99999);
    expect(t.balanceCents).toBe(0);
  });
});
