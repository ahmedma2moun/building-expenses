import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const error = params.error === "1";
  const from = typeof params.from === "string" ? params.from : "/";

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-center text-xl font-semibold text-neutral-900">
          ميزانية فيلا 113
        </h1>
        <p className="mt-1 text-center text-sm text-neutral-500">
          أدخل كلمة المرور للدخول
        </p>

        <form action={login} className="mt-6 space-y-4">
          <input type="hidden" name="from" value={from} />
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-neutral-700"
            >
              كلمة المرور
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">كلمة المرور غير صحيحة</p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-base font-medium text-white active:bg-neutral-700"
          >
            دخول
          </button>
        </form>
      </div>
    </main>
  );
}
