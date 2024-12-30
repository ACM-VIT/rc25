import SignOut from "@/app/(auth)/authactions/signout"

export default function SignOutButton() {
  return (
    
      <button onClick={async()=>{
        "use server"
        await SignOut()
      }} type="submit">SignOut</button>

  )
}