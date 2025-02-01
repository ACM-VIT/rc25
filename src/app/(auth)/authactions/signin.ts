"use server";

import {auth, signIn} from "../auth";

export default async function Signin() {
    console.log("Signing in")
    const session = await auth();
    if (session?.user) {
        return;
    }
    await signIn("google");
}