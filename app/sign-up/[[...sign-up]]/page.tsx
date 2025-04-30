import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
            GlamStore
          </h1>
          <p className="text-muted-foreground mt-2">Create your account</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary: "bg-pink-600 hover:bg-pink-700",
              footerActionLink: "text-pink-600 hover:text-pink-700",
            },
          }}
          redirectUrl="/store"
        />
      </div>
    </div>
  );
}
