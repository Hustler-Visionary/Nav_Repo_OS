import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { BadRequestException } from "@nestjs/common";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe.js";

const schema = z.object({ title: z.string().min(1, "title is required") });

test("passes valid input through unchanged", () => {
  const pipe = new ZodValidationPipe(schema);
  assert.deepEqual(pipe.transform({ title: "hello" }), { title: "hello" });
});

test("rejects invalid input with a BadRequestException carrying issue details", () => {
  const pipe = new ZodValidationPipe(schema);
  assert.throws(
    () => pipe.transform({ title: "" }),
    (error: unknown) => {
      assert.ok(error instanceof BadRequestException);
      const response = error.getResponse() as { message: { path: string; message: string }[] };
      assert.equal(response.message[0]?.path, "title");
      return true;
    }
  );
});
