"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInSchema } from "@/schemas/signInSchema";
import { signIn } from "next-auth/react";
const page = () => {
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  //zod implementation
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsFormSubmitting(true);
    const response = await signIn("credentials", {
      identifier: data.identifier,
      password: data.password,
      redirect: false,
    });
    if (response?.error) {
      if (response.error === "CredentialsSignin") {
        toast({
          title: "Login failed",
          description: "Please enter valid credentials",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login failed",
          description: response.error,
          variant: "destructive",
        });
      }
      setIsFormSubmitting(false);
    } else {
      toast({
        title: "Success",
        description: "You have successfully signed in",
      });
      router.push("/dashboard");
      setIsFormSubmitting(false);
    }
  };
  return (
    <div className="flex min-h-screen justify-center items-center bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 rounded-xl bg-white shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            {" "}
            Join Mystery Message
          </h1>
          <p className="text-gray-600  mb-6">
            Sign in to start your annonymous conversation
          </p>
        </div>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Email/Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email or username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Password</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="true"
                      type="password"
                      placeholder="Enter your Password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isFormSubmitting}>
              {isFormSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please Wait
                </>
              ) : (
                "SignIn"
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4 font-semibold">
          <p>
            Do not have an account?{" "}
            <Link className="text-blue-500 hover:underline" href="/sign-up">
              {" "}
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default page;
