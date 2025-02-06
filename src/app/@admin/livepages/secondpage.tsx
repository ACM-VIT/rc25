export default function SecondPage(){
    return(
        <div className="grid grid-cols-2 gap-2 m-3 text-white">
            <div className="flex flex-col justify-center items-center bg-[#606060]/80 p-6 rounded-lg h-[90vh] text-center">
                <h1 className="text-5xl m-2">SPONSORED BY</h1>
                <img src="https://rc25-assets.acmvit.in/sponsor.svg" alt="Sponsor Logo"/>
            </div>            
            <div className="flex flex-col justify-center items-center bg-[#606060]/80 p-6 rounded-lg h-[90vh] text-center">
                <h1 className="text-5xl m-2">EXECUTED BY</h1>
                <h1 className="text-9xl">JUDGE0</h1>
            </div>
        </div>
    )
}