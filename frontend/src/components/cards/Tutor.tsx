import { TablerMicrophone, TablerSend2 } from "@/icons";

export default function Tutor() {
    return (
        <div className="mx-auto my-8 bg-white rounded-3xl shadow-lg p-4 w-[90vw]">
            <textarea
                className="w-full min-h-[60px] rounded-md font-semibold focus:outline-none focus:border-transparent text-secondary resize-none"
                placeholder="Message to Tutor..."
            />
            <div className="flex justify-between mt-2">
                <button className="text-gray-700 rounded-full p-3 ring-2 ring-gray-300 cursor-pointer flex items-center justify-center">
                    <TablerMicrophone className="w-5 h-5" />
                </button>
                <button className="bg-background-secondary text-white border-none rounded-md px-4 py-2 cursor-pointer">
                    Send <TablerSend2 className="w-5 h-5 inline-block ml-1 pb-1" />
                </button>
            </div>
        </div>
    );
}
