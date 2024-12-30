
import Signin  from "../../app/(auth)/authactions/signin"

export default function SignInButton() {
  return (
     <button onClick={async () => {
        "use server"
        await Signin()}} type="submit">
          Signin with Google
      </button>
  )
}