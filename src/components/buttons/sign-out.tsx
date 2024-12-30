import SignOut from "@/app/(auth)/authactions/signout"

export default function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server"
        await SignOut()
      }}
    >
      <button type="submit">SignOut</button>
    </form>
  )
}