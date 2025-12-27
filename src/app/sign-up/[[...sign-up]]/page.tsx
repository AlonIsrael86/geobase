"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">GEOBase</h1>
          <p className="text-muted-foreground mt-2">הרשמה למערכת</p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              rootBox: "w-full flex justify-center",
              card: "w-full",
            }
          }}
        />
      </div>
    </div>
  );
}



