import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";

const page = () => {
  return (
    <div className="landing-body h-screen flex justify-center items-center text-white">
      <Card className="bg-transparent shadow-none border-none">
        <CardHeader>
          <CardTitle className="text-9xl text-violet-500 text-center">
            BAGH CHAL
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 items-center justify-center">
          <Link href="/offline">
            <div className="w-fit h-32 text-3xl bg-violet-600 flex justify-between items-center p-4 rounded-lg text-white hover:bg-violet-700 cursor-pointer">
              <Icon
                icon="solar:cloud-cross-bold"
                fontSize={60}
                width={60}
                height={60}
              />
              Play Offline
            </div>
          </Link>

          <div className="w-fit h-32 text-3xl bg-orange-400 flex flex-col justify-between items-center p-4 rounded-lg text-white hover:bg-orange-500 cursor-pointer">
            <div className="flex items-center">
              <Icon
                icon="solar:cloud-check-bold"
                fontSize={60}
                width={60}
                height={60}
              />
              Play Offline
            </div>
            <div className="text-[20px] font-bold">Coming soon...</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default page;
