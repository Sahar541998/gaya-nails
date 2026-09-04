import "server-only";

import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  value === "" || value === undefined ? undefined : value;

function firstNonEmpty(
  ...values: readonly (string | undefined)[]
): string | undefined {
  for (const value of values) {
    if (value !== undefined && value !== "") {
      return value;
    }
  }
  return undefined;
}

const smsDriverSchema = z.preprocess(
  emptyToUndefined,
  z.enum(["docker", "twilio"]).default("docker"),
);

const baseSchema = z.object({
  SMS_DRIVER: smsDriverSchema,
  DATABASE_URL: z.string().min(1),
});

const twilioSchema = z.object({
  TWILIO_ACCOUNT_SID: z.string().min(1),
  TWILIO_AUTH_TOKEN: z.string().min(1),
  TWILIO_VERIFY_SERVICE_SID: z.string().min(1),
});

const dockerSmsSchema = z.object({
  SMS_MOCK_URL: z.string().url(),
});

const supabaseSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

export type SmsDriver = z.infer<typeof smsDriverSchema>;

export type ServerEnv = z.infer<typeof baseSchema> &
  Partial<z.infer<typeof twilioSchema>> &
  Partial<z.infer<typeof dockerSmsSchema>> &
  Partial<z.infer<typeof supabaseSchema>>;

export function getServerEnv(): ServerEnv {
  const base = baseSchema.safeParse({
    SMS_DRIVER: process.env.SMS_DRIVER,
    DATABASE_URL: firstNonEmpty(
      process.env.DATABASE_URL,
      process.env.POSTGRES_URL,
    ),
  });

  if (!base.success) {
    throw new Error("Missing or invalid DATABASE_URL.");
  }

  const smsDriver = base.data.SMS_DRIVER;
  let twilio: z.infer<typeof twilioSchema> | undefined;
  let dockerSms: z.infer<typeof dockerSmsSchema> | undefined;

  if (smsDriver === "twilio") {
    const parsed = twilioSchema.safeParse({
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
      TWILIO_VERIFY_SERVICE_SID: process.env.TWILIO_VERIFY_SERVICE_SID,
    });
    if (!parsed.success) {
      throw new Error("Missing or invalid Twilio environment variables.");
    }
    twilio = parsed.data;
  } else {
    const parsed = dockerSmsSchema.safeParse({
      SMS_MOCK_URL: process.env.SMS_MOCK_URL,
    });
    if (parsed.success) {
      dockerSms = parsed.data;
    }
  }

  const supabase = supabaseSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: firstNonEmpty(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_URL,
    ),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: firstNonEmpty(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      process.env.SUPABASE_ANON_KEY,
    ),
    SUPABASE_SERVICE_ROLE_KEY: firstNonEmpty(
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      process.env.SUPABASE_SECRET_KEY,
    ),
  });

  return {
    ...base.data,
    ...twilio,
    ...dockerSms,
    ...(supabase.success ? supabase.data : {}),
  };
}

export function getTwilioEnv(): z.infer<typeof twilioSchema> {
  const env = getServerEnv();
  if (
    env.TWILIO_ACCOUNT_SID === undefined ||
    env.TWILIO_AUTH_TOKEN === undefined ||
    env.TWILIO_VERIFY_SERVICE_SID === undefined
  ) {
    throw new Error("Twilio is not configured.");
  }

  return {
    TWILIO_ACCOUNT_SID: env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: env.TWILIO_AUTH_TOKEN,
    TWILIO_VERIFY_SERVICE_SID: env.TWILIO_VERIFY_SERVICE_SID,
  };
}

export function getSmsMockUrl(): string {
  const env = getServerEnv();
  if (env.SMS_MOCK_URL === undefined) {
    throw new Error("SMS mock is not configured.");
  }
  return env.SMS_MOCK_URL;
}

export function getSupabaseServerEnv(): z.infer<typeof supabaseSchema> {
  const env = getServerEnv();
  if (
    env.NEXT_PUBLIC_SUPABASE_URL === undefined ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY === undefined ||
    env.SUPABASE_SERVICE_ROLE_KEY === undefined
  ) {
    throw new Error("Supabase is not configured.");
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
  };
}
