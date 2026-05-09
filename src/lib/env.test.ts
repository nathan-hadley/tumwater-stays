// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

const REQUIRED_SERVER_ENV = {
  STRIPE_SECRET_KEY: "sk_test_123",
  RESEND_API_KEY: "re_test_123",
  PRICELABS_API_KEY: "pl_test_123",
  STUDIO_ICAL_URL: "https://example.com/studio.ics",
  ONEBR_ICAL_URL: "https://example.com/one-bedroom.ics",
  HOST_EMAIL: "host@example.com",
} as const;

const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_ARGV = [...process.argv];

function restoreProcessState() {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) {
      delete process.env[key];
    }
  }

  for (const [key, value] of Object.entries(ORIGINAL_ENV)) {
    process.env[key] = value;
  }

  process.argv = [...ORIGINAL_ARGV];
}

function setRequiredServerEnv(
  overrides: Partial<Record<keyof typeof REQUIRED_SERVER_ENV, string | undefined>> = {}
) {
  for (const [key, value] of Object.entries(REQUIRED_SERVER_ENV)) {
    process.env[key] = value;
  }

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete process.env[key];
      continue;
    }

    process.env[key] = value;
  }
}

async function loadEnvModule() {
  vi.resetModules();
  return import("./env");
}

describe("env", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    restoreProcessState();
  });

  it("parses required server env values", async () => {
    process.argv = ["node", "vitest"];
    delete process.env.NEXT_PHASE;
    delete process.env.npm_lifecycle_event;
    setRequiredServerEnv();

    const { env } = await loadEnvModule();

    expect(env.STRIPE_SECRET_KEY).toBe("sk_test_123");
    expect(env.RESEND_API_KEY).toBe("re_test_123");
    expect(env.PRICELABS_API_KEY).toBe("pl_test_123");
    expect(env.STUDIO_ICAL_URL).toBe("https://example.com/studio.ics");
    expect(env.ONEBR_ICAL_URL).toBe("https://example.com/one-bedroom.ics");
    expect(env.HOST_EMAIL).toBe("host@example.com");
  });

  it("throws when required server env values are missing outside build phase", async () => {
    process.argv = ["node", "vitest"];
    delete process.env.NEXT_PHASE;
    delete process.env.npm_lifecycle_event;
    setRequiredServerEnv({ PRICELABS_API_KEY: undefined });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(loadEnvModule()).rejects.toThrow("Invalid server environment variables");
    expect(errorSpy).toHaveBeenCalled();
  });

  it("uses build stubs when running build phase with missing server env", async () => {
    process.argv = ["node", "vitest"];
    process.env.NEXT_PHASE = "phase-production-build";
    delete process.env.npm_lifecycle_event;
    setRequiredServerEnv({
      STRIPE_SECRET_KEY: undefined,
      RESEND_API_KEY: undefined,
      PRICELABS_API_KEY: undefined,
      STUDIO_ICAL_URL: undefined,
      ONEBR_ICAL_URL: undefined,
      HOST_EMAIL: undefined,
    });

    const { env } = await loadEnvModule();

    expect(env.STRIPE_SECRET_KEY).toBe("build_stub_stripe_secret_key");
    expect(env.RESEND_API_KEY).toBe("build_stub_resend_api_key");
    expect(env.PRICELABS_API_KEY).toBe("build_stub_pricelabs_api_key");
    expect(env.STUDIO_ICAL_URL).toBe("https://example.invalid/studio.ics");
    expect(env.ONEBR_ICAL_URL).toBe("https://example.invalid/one-bedroom.ics");
    expect(env.HOST_EMAIL).toBe("build-stub@example.invalid");

    expect(process.env.PRICELABS_API_KEY).toBe("build_stub_pricelabs_api_key");
  });

  it("keeps provided values during build phase and stubs only missing ones", async () => {
    process.argv = ["node", "vitest"];
    process.env.NEXT_PHASE = "phase-production-build";
    delete process.env.npm_lifecycle_event;
    setRequiredServerEnv({
      STRIPE_SECRET_KEY: "sk_live_like_value",
      RESEND_API_KEY: undefined,
      PRICELABS_API_KEY: undefined,
      STUDIO_ICAL_URL: undefined,
      ONEBR_ICAL_URL: undefined,
      HOST_EMAIL: undefined,
    });

    const { env } = await loadEnvModule();

    expect(env.STRIPE_SECRET_KEY).toBe("sk_live_like_value");
    expect(env.RESEND_API_KEY).toBe("build_stub_resend_api_key");
    expect(env.PRICELABS_API_KEY).toBe("build_stub_pricelabs_api_key");
  });
});
