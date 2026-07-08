import { describe, expect, it } from "vitest";
import { DomainError, err, ok } from "./result";

describe("Result", () => {
  it("wraps a success value", () => {
    const result = ok(42);
    expect(result).toEqual({ ok: true, value: 42 });
  });

  it("wraps a failure value", () => {
    const error = new DomainError("not found", "NOT_FOUND");
    const result = err(error);
    expect(result).toEqual({ ok: false, error });
  });

  it("DomainError carries a machine-readable code", () => {
    const error = new DomainError("invalid state", "INVALID_STATE");
    expect(error.code).toBe("INVALID_STATE");
    expect(error.message).toBe("invalid state");
  });
});
