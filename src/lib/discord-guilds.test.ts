import { test } from "node:test";
import assert from "node:assert/strict";
import { canManageGuild, filterManageable } from "./discord-guilds.ts";

test("canManageGuild recognizes MANAGE_GUILD bit", () => {
  assert.equal(canManageGuild(String(0x20)), true);
});

test("canManageGuild recognizes ADMINISTRATOR bit", () => {
  assert.equal(canManageGuild(String(0x8)), true);
});

test("canManageGuild rejects unrelated permissions", () => {
  assert.equal(canManageGuild(String(0x400)), false); // VIEW_CHANNEL only
});

test("canManageGuild handles permission values beyond 32 bits", () => {
  const huge = (1n << 40n) | BigInt(0x20);
  assert.equal(canManageGuild(huge.toString()), true);
});

test("filterManageable keeps only guilds the user can manage", () => {
  const guilds = [
    { id: "1", name: "A", icon: null, permissions: String(0x20) },
    { id: "2", name: "B", icon: null, permissions: String(0x400) },
  ];
  assert.deepEqual(
    filterManageable(guilds).map((g) => g.id),
    ["1"],
  );
});
