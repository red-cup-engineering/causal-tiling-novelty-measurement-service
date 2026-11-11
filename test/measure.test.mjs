import assert from "node:assert/strict";
import test from "node:test";
import { measureCausalPatchNovelty } from "@red-cup-engineering/causal-tiling-novelty-measurement-service";

test("counts only prior windows that end before the current patch", () => {
  const result = measureCausalPatchNovelty({ tokens: ["a", "a", "a", "a", "a"], patchSize: 2 });
  assert.equal(result.eligiblePriorPatches, 2);
  assert.equal(result.recurrenceCount, 2);
  assert.equal(result.empiricalFrequency, 1);
  assert.equal(result.novelty, 1 / 3);
  assert.equal(result.effect, "measurement-only");
  assert.equal(result.infiniteTilingEquivalenceEstablished, false);
});

test("symbols containing null characters keep their boundaries", () => {
  const result = measureCausalPatchNovelty({ tokens: ["a", "b\u0000c", "a\u0000b", "c"], patchSize: 2 });
  assert.equal(result.eligiblePriorPatches, 1);
  assert.equal(result.recurrenceCount, 0);
  assert.equal(result.empiricalFrequency, 0);
  assert.equal(result.novelty, 1);
});

test("requires two complete patches of string tokens and an integer patch size", () => {
  const sparse = ["a", "b", "c", "d"];
  delete sparse[1];
  for (const input of [
    { tokens: ["a", "b", "c"], patchSize: 2 },
    { tokens: ["a", 1, "c", "d"], patchSize: 2 },
    { tokens: sparse, patchSize: 2 },
    { tokens: ["a", "b", "c", "d"], patchSize: 1.5 },
  ]) {
    assert.throws(() => measureCausalPatchNovelty(input), /finite-causal-patch-input-invalid/u);
  }
});
