import { Input, Button } from "@nextui-org/react";
import type { DataFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { z } from "zod";
import { UserLogin } from "~/models/User";
import { createUserSession } from "~/lib/server";

const schema = z.object({
  username: z.string({ required_error: "Username is required" }),
  password: z.string({ required_error: "Password is required" }),
});

export const action = async ({ request }: DataFunctionArgs) => {
  try {
    const formData = await request.formData();
    const submission = parse(formData, { schema });
    if (!submission.value || submission.intent !== "submit") {
      return json({ _ok: false, ...submission });
    }
    const { username, password } = submission.value;
    const user = await UserLogin(username, password);
    console.log({ user });
    if (!user) {
      return json({
        _ok: false,
        message: "Invalid username or password",
        ...submission,
      });
    }
    return createUserSession({
      request,
      userId: user?.id,
    });
  } catch (e) {
    console.error(e);
  }
};

export default function Login() {
  const lastSubmission: any = useActionData<typeof action>();
  const [form, { username, password }] = useForm({
    lastSubmission,
    onValidate({ formData }) {
      return parse(formData, { schema });
    },
    shouldRevalidate: "onInput",
  });
  const { message } = lastSubmission ?? {};
  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm space-y-10">
        <div>
          <img
            className="mx-auto h-10 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
            alt="Logo"
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <Form method="post" {...form.props} className="space-y-6">
          <Input
            type="text"
            label="Username"
            name={username.name}
            radius="none"
            isInvalid={!!username.error}
            errorMessage={username.error}
          />
          <Input
            type="password"
            label="Password"
            name={password.name}
            radius="none"
            isInvalid={!!password.error}
            errorMessage={password.error}
          />
          <Button
            color="primary"
            type="submit"
            size="lg"
            radius="none"
            fullWidth
            isLoading={false}
          >
            LOGIN
          </Button>
          <p className="mt-8 text-center text-sm text-gray-500">
            <span className="font-semibold leading-6 text-red-600 hover:text-red-500">
              {message}
            </span>
          </p>
        </Form>
      </div>
    </div>
  );
}
