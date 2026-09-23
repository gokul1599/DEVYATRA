import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  createUser,
  login,
  createSession,
  destroySession,
  getUserByToken,
  updateUserPreferences,
  toggleFollowTemple,
  normalizeEmail,
  emailHash,
  publicUser,
} from "../src/lib/auth";

describe("Durable Authentication & Session Integrity", () => {
  test("normalizes email addresses consistently", () => {
    assert.equal(normalizeEmail("  Pilgrim.Gokul@EXAMPLE.Com  "), "pilgrim.gokul@example.com");
    assert.equal(normalizeEmail("USER@domain.in"), "user@domain.in");
    assert.equal(emailHash("Test@Domain.com"), emailHash("  test@domain.com  "));
  });

  test("registers a new user and denies duplicate email registrations", async () => {
    const uniqueEmail = `pilgrim-${Date.now()}@devyatra.test`;
    const user = await createUser("Aditi Sharma", uniqueEmail, "SacredYatra#2026");

    assert.ok(user.id);
    assert.equal(user.name, "Aditi Sharma");
    assert.equal(user.email, uniqueEmail.toLowerCase());
    assert.equal(user.role, "user");
    assert.ok(user.passwordHash?.includes(":"), "Password hash must contain salt delimiter");

    // Duplicate registration attempt with different casing/spacing must throw
    await assert.rejects(
      async () => {
        await createUser("Aditi Duplicate", `  ${uniqueEmail.toUpperCase()}  `, "DifferentPassword99");
      },
      {
        name: "Error",
        message: "EMAIL_EXISTS",
      }
    );
  });

  test("authenticates user with correct credentials and rejects incorrect passwords", async () => {
    const email = `bhakt-${Date.now()}@devyatra.test`;
    const password = "OmNamahShivaya#108";
    await createUser("Shiv Bhakt", email, password);

    // Case-insensitive login
    const loggedIn = await login(email.toUpperCase(), password);
    assert.ok(loggedIn, "User must log in successfully with valid credentials");
    assert.equal(loggedIn?.name, "Shiv Bhakt");

    // Invalid password must return null
    const failedLogin = await login(email, "WrongPassword123");
    assert.equal(failedLogin, null);

    // Non-existent user must return null
    const nonExistent = await login("unknown@devyatra.test", password);
    assert.equal(nonExistent, null);
  });

  test("creates, validates, and destroys durable session tokens", async () => {
    const email = `session-${Date.now()}@devyatra.test`;
    const user = await createUser("Kashi Yatri", email, "KashiVishwanath#2026");

    const token = await createSession(user.id);
    assert.ok(token && token.length > 20, "Session token must be non-empty UUID string");

    // Retrieve user by valid session token
    const sessionUser = await getUserByToken(token);
    assert.ok(sessionUser, "Must resolve user from active session token");
    assert.equal(sessionUser?.id, user.id);
    assert.equal(sessionUser?.email, email.toLowerCase());

    // Invalid or revoked token returns null
    const invalidUser = await getUserByToken("invalid-token-12345");
    assert.equal(invalidUser, null);

    const nullUser = await getUserByToken(null);
    assert.equal(nullUser, null);

    // Destroy session
    await destroySession(token);
    const postDestroyUser = await getUserByToken(token);
    assert.equal(postDestroyUser, null, "Destroyed session must return null");
  });

  test("updates user preferences and isolates across users", async () => {
    const user1 = await createUser("User One", `user1-${Date.now()}@devyatra.test`, "Password#1");
    const user2 = await createUser("User Two", `user2-${Date.now()}@devyatra.test`, "Password#2");

    const updatedPrefs1 = await updateUserPreferences(user1.id, {
      travelStyle: "elderly",
      accessibilityNeeds: true,
      budgetTier: "premium",
      deities: ["Shiva"],
    });

    assert.equal(updatedPrefs1.travelStyle, "elderly");
    assert.equal(updatedPrefs1.accessibilityNeeds, true);
    assert.equal(updatedPrefs1.budgetTier, "premium");
    assert.deepEqual(updatedPrefs1.deities, ["Shiva"]);

    // Verify user2 preferences remain default (strict isolation)
    const user2Token = await createSession(user2.id);
    const loadedUser2 = await getUserByToken(user2Token);
    assert.equal(loadedUser2?.preferences?.travelStyle, "family");
    assert.equal(loadedUser2?.preferences?.accessibilityNeeds, false);
  });

  test("toggles followed temples correctly", async () => {
    const user = await createUser("Temple Follower", `follower-${Date.now()}@devyatra.test`, "Password#123");
    
    // Follow temple
    let followed = await toggleFollowTemple(user.id, "kashi-vishwanath-temple");
    assert.deepEqual(followed, ["kashi-vishwanath-temple"]);

    // Follow another temple
    followed = await toggleFollowTemple(user.id, "somnath-temple");
    assert.deepEqual(followed, ["kashi-vishwanath-temple", "somnath-temple"]);

    // Unfollow first temple
    followed = await toggleFollowTemple(user.id, "kashi-vishwanath-temple");
    assert.deepEqual(followed, ["somnath-temple"]);
  });

  test("publicUser sanitizes sensitive fields like password hashes", async () => {
    const user = await createUser("Private Pilgrim", `safe-${Date.now()}@devyatra.test`, "SecretPass#123");
    const pub = publicUser(user);

    assert.equal(pub.id, user.id);
    assert.equal(pub.email, user.email);
    assert.equal((pub as Record<string, unknown>).passwordHash, undefined);
    assert.equal((pub as Record<string, unknown>).password, undefined);
  });
});
