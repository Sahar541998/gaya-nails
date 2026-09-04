"use client";

import { useActionState } from "react";

import {
  loginAdminAction,
  type AdminLoginState,
} from "@/app/admin/login/actions";

const initial: AdminLoginState = { error: "" };

type AdminLoginFormProps = {
  configured: boolean;
};

export function AdminLoginForm({ configured }: AdminLoginFormProps) {
  const [state, action, pending] = useActionState(loginAdminAction, initial);

  if (!configured) {
    return (
      <div className="border border-rose-line bg-white p-6">
        <h1 className="font-display text-3xl text-ink">Admin sign-in</h1>
        <p className="mt-4 text-sm leading-6 text-ink/70">
          Admin is locked until authentication is configured. Set{" "}
          <code className="text-ink">ADMIN_USERNAME</code>,{" "}
          <code className="text-ink">ADMIN_PASSWORD</code>, and{" "}
          <code className="text-ink">ADMIN_JWT_SECRET</code> in the server
          environment. Never prefix those with NEXT_PUBLIC_.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="border border-rose-line bg-white p-6">
      <h1 className="font-display text-3xl text-ink">Admin sign-in</h1>
      <p className="mt-2 text-sm text-ink/65">
        Sign in with the studio admin username and password. A secure session
        cookie is set after a successful login.
      </p>
      <label className="mt-6 block text-xs tracking-[0.16em] text-ink/55 uppercase">
        Username
        <input
          className="field-input mt-2"
          type="text"
          name="username"
          autoComplete="username"
          required
        />
      </label>
      <label className="mt-4 block text-xs tracking-[0.16em] text-ink/55 uppercase">
        Password
        <input
          className="field-input mt-2"
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
      </label>
      {state.error.length > 0 ? (
        <p className="mt-3 text-sm text-ink" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        className="btn-primary mt-6 min-h-11"
        type="submit"
        disabled={pending}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
