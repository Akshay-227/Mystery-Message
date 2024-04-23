"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
 import {useDebounceValue} from 'usehooks-ts'
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/router";
import { signUpSchema } from "@/schemas/signupSchema";
const page = () => {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const useDebouncedUsername=useDebounceValue(username,300)
  const {toast} =useToast()
  const router=useRouter

  //zod implementation
  const form=useForm({
    resolver:zodResolver(signUpSchema),
    defaultValues:{
      username:"",
      email:"",
      password:""
    }
  })
  

  return <div>Akshay</div>;
};

export default page;
