import { z } from "zod";

const serverSchema = z.object({
  STRIPE_SECRET_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  PRICELABS_API_KEY: z.string().min(1),
  STUDIO_ICAL_URL: z.string().url(),
  ONEBR_ICAL_URL: z.string().url(),
  HOST_EMAIL: z.string().email(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_GOOGLE_VOICE_NUMBER: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

const isServer = typeof window === "undefined";
const isBuildPhase =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.npm_lifecycle_event === "build" ||
  process.argv.includes("build");
const buildServerStubs = {
  STRIPE_SECRET_KEY: "build_stub_stripe_secret_key",
  RESEND_API_KEY: "build_stub_resend_api_key",
  PRICELABS_API_KEY: "build_stub_pricelabs_api_key",
  STUDIO_ICAL_URL: "https://example.invalid/studio.ics",
  ONEBR_ICAL_URL: "https://example.invalid/one-bedroom.ics",
  HOST_EMAIL: "build-stub@example.invalid",
} as const;

const clientValues = {
  NEXT_PUBLIC_GOOGLE_VOICE_NUMBER: process.env.NEXT_PUBLIC_GOOGLE_VOICE_NUMBER,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
};

function withBuildStub(value: string | undefined, stub: string) {
  return typeof value === "string" && value.trim().length > 0 ? value : stub;
}

function getBuildServerValues() {
  return {
    STRIPE_SECRET_KEY: withBuildStub(
      process.env.STRIPE_SECRET_KEY,
      buildServerStubs.STRIPE_SECRET_KEY
    ),
    RESEND_API_KEY: withBuildStub(process.env.RESEND_API_KEY, buildServerStubs.RESEND_API_KEY),
    PRICELABS_API_KEY: withBuildStub(
      process.env.PRICELABS_API_KEY,
      buildServerStubs.PRICELABS_API_KEY
    ),
    STUDIO_ICAL_URL: withBuildStub(process.env.STUDIO_ICAL_URL, buildServerStubs.STUDIO_ICAL_URL),
    ONEBR_ICAL_URL: withBuildStub(process.env.ONEBR_ICAL_URL, buildServerStubs.ONEBR_ICAL_URL),
    HOST_EMAIL: withBuildStub(process.env.HOST_EMAIL, buildServerStubs.HOST_EMAIL),
  };
}

function parse() {
  const clientParsed = clientSchema.safeParse(clientValues);
  if (!clientParsed.success) {
    console.error(
      "❌ Invalid public env vars:",
      JSON.stringify(z.treeifyError(clientParsed.error), null, 2)
    );
    throw new Error("Invalid public environment variables");
  }

  if (!isServer) {
    return { ...clientParsed.data } as z.infer<typeof serverSchema> & z.infer<typeof clientSchema>;
  }

  let serverValues: NodeJS.ProcessEnv | ReturnType<typeof getBuildServerValues> = process.env;
  if (isBuildPhase) {
    serverValues = getBuildServerValues();
    Object.assign(process.env, serverValues);
  }
  const serverParsed = serverSchema.safeParse(serverValues);
  if (!serverParsed.success) {
    console.error(
      "❌ Invalid server env vars:",
      JSON.stringify(z.treeifyError(serverParsed.error), null, 2)
    );
    throw new Error("Invalid server environment variables");
  }

  return { ...serverParsed.data, ...clientParsed.data };
}

export const env = parse();
