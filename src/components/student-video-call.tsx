"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Users } from "lucide-react";

interface StudentVideoCallProps {
  studentId: string;
}

export function StudentVideoCall({ studentId }: StudentVideoCallProps) {
  const [roomId, setRoomId] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "active" | "ended">("idle");
  const [teacherName, setTeacherName] = useState("");
  const [otherParticipants, setOtherParticipants] = useState<string[]>([]);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const joinCall = async () => {
    if (!roomId.trim()) {
      alert("Please enter a valid Room ID");
      return;
    }

    setCallStatus("connecting");
    
    try {
      // Simulate connecting to a video call service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled,
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setIsJoined(true);
      setCallStatus("active");
      setTeacherName("Dr. Smith"); // Simulated teacher name
      
      // Simulate other students joining
      setTimeout(() => {
        setOtherParticipants(["Student 2", "Student 3"]);
      }, 3000);
      
    } catch (error) {
      console.error("Error joining call:", error);
      setCallStatus("idle");
      alert("Failed to join video call. Please check your camera and microphone permissions.");
    }
  };

  const leaveCall = () => {
    // Stop local stream
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }
    
    setIsJoined(false);
    setCallStatus("ended");
    setTeacherName("");
    setOtherParticipants([]);
    
    // Reset after a delay
    setTimeout(() => {
      setCallStatus("idle");
    }, 2000);
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  if (callStatus === "idle") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Join Video Call
          </CardTitle>
          <CardDescription>
            Enter the Room ID provided by your teacher to join the video call
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roomId">Room ID</Label>
            <Input
              id="roomId"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={joinCall} 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!roomId.trim()}
          >
            <Video className="h-4 w-4 mr-2" />
            Join Call
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (callStatus === "connecting") {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium">Joining video call...</h3>
            <p className="text-gray-600 mt-2">Please allow camera and microphone access when prompted</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (callStatus === "ended") {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <PhoneOff className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Call Ended</h3>
            <p className="text-gray-600 mt-2">You have left the video call</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Teacher Video */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{teacherName || "Teacher"}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative bg-gray-900 aspect-video">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-white text-center">
                  <Users className="h-12 w-12 mx-auto mb-2" />
                  <p>{teacherName || "Teacher"}</p>
                  <Badge variant="secondary" className="mt-2">Teacher</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Local Video */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">You</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative bg-gray-900 aspect-video">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {!isVideoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="text-white text-center">
                    <VideoOff className="h-12 w-12 mx-auto mb-2" />
                    <p>Camera Off</p>
                  </div>
                </div>
              )}
              <div className="absolute top-2 left-2">
                <Badge variant="outline">You</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Other Participants */}
      {otherParticipants.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Other Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {otherParticipants.map((participant, index) => (
                <Badge key={index} variant="secondary">
                  {participant}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={isVideoEnabled ? "default" : "destructive"}
              size="lg"
              onClick={toggleVideo}
              className="rounded-full h-12 w-12"
            >
              {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
            
            <Button
              variant={isAudioEnabled ? "default" : "destructive"}
              size="lg"
              onClick={toggleAudio}
              className="rounded-full h-12 w-12"
            >
              {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="destructive"
              size="lg"
              onClick={leaveCall}
              className="rounded-full h-12 w-12"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Room ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{roomId}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}