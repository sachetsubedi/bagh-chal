"use client";
import CustomRadioButton from "@/components/CustomRadioButtons/CustomRadioButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BACKEND_API } from "@/config/env";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const Page = () => {
  const [joinRoom, setJoinRoom] = useState(false);
  const [roomToSearch, setRoomToSearch] = useState("");
  const [roomId, setRoomId] = useState("");
  const router = useRouter();
  const [waitingDialogOpen, setWaitingDFialogOpen] = useState(false);

  const [choosenCharacter, setChoosenCharacter] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Fetch room data, polling every 5 seconds
  const query = useQuery({
    queryKey: ["rooms", roomToSearch], // Added roomToSearch to the queryKey for proper invalidation and refetching
    queryFn: async () => {
      const response = await axios.get(`${BACKEND_API}/rooms/${roomToSearch}`);
      return response.data;
    },
    enabled: !!roomToSearch, // Fetch only when roomToSearch is not empty
    refetchInterval: 5000, // Poll every 5 seconds
  });

  if (query.isSuccess) {
    setTimeout(() => {
      router.push(`/online/${roomToSearch}/create/${choosenCharacter}`);
    }, 0);
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${BACKEND_API}/rooms/create-and-join`,
        { character: choosenCharacter }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setRoomToSearch(data.data.roomId); // Set roomId for the query to trigger refetch
    },
  });

  const joinRoomMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`${BACKEND_API}/rooms/join`, {
        roomId,
      });
      return response.data;
    },
    onSuccess: (data) => {
      router.push(`/online/${roomId}/join/${data.data.user2Character}`);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message);
    },
  });

  return (
    <div>
      <Card className="w-full h-screen bg-slate-700 p-0 mt-0 rounded-none border-none shadow-none flex flex-col justify-center items-center">
        <CardTitle className="text-white text-3xl pb-10">
          Create or Join a room
        </CardTitle>
        <CardContent className="text-white font-bold flex flex-col gap-5">
          <div
            className="rounded-sm p-3 flex  gap-3 items-center bg-violet-500 hover:bg-violet-600 cursor-pointer"
            onClick={() => {
              setCreateDialogOpen(true);
            }}
          >
            <Icon icon="basil:add-outline" width="24" height="24" />
            <div>Create a room</div>
          </div>

          <div
            className="rounded-sm p-3 flex  gap-3 items-center bg-violet-500 hover:bg-violet-600 cursor-pointer"
            onClick={() => {
              setJoinRoom(true);
            }}
          >
            <Icon icon="iconamoon:enter-duotone" width="24" height="24" />
            <div>Join a room</div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={joinRoom}
        onOpenChange={() => {
          setJoinRoom(false);
        }}
      >
        <DialogContent>
          <DialogTitle className="text-center text-2xl">
            Join a room
          </DialogTitle>
          <Label>Room ID</Label>
          <Input
            className="border border-black"
            onChange={(e) => {
              setRoomId(e.target.value);
            }}
          />
          <Button
            onClick={() => {
              joinRoomMutation.mutate();
              // router.push(`/online/${roomId}`); // Redirect to the room
            }}
          >
            Enter
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog
        open={waitingDialogOpen}
        onOpenChange={() => {
          setWaitingDFialogOpen(false);
        }}
      >
        <DialogContent>
          <DialogTitle className="text-center text-2xl">
            Waiting for another player...
          </DialogTitle>
          <div className="text-center flex gap-2 items-center justify-center">
            Room Id: <span className="font-bold">{roomToSearch}</span>{" "}
            {mutation.isPending && (
              <Icon
                icon="svg-spinners:blocks-shuffle-3"
                width="15"
                height="15"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={createDialogOpen}
        onOpenChange={() => setCreateDialogOpen(false)}
      >
        <DialogTitle></DialogTitle>
        <DialogContent className="  font-extrabold">
          <h1 className="text-2xl text-center text-black">
            Choose your character
          </h1>
          <CustomRadioButton
            buttons={[
              { icon: "openmoji:tiger", label: "Tiger", value: "tiger" },
              { icon: "openmoji:goat", label: "Goat", value: "goat" },
            ]}
            setValue={setChoosenCharacter}
          ></CustomRadioButton>
          <Button
            onClick={() => {
              setWaitingDFialogOpen(true);
              mutation.mutate();
            }}
          >
            Start
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;
