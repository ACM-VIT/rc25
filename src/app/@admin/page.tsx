const Page = () =>  {
  return (
    <div className="min-h-screen flex">
      <main className="flex-1 p-6">
        <h2 className="text-3xl font-bold mb-4">Live Info</h2>
        <div className="min-w-full bg-white rounded-lg text-gray-900">
          <div className="p-4 bg-white rounded-md shadow-md"> 
            <h3 className="text-xl font-semibold">Random info</h3>
            <p>Something useful during the live thing</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Page;