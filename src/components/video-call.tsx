"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Users, Copy } from "lucide-react";

interface VideoCallProps {
  teacherId: string;
  subjectId: string;
  classCode: string;
}

export function VideoCall({ teacherId, subjectId, classCode }: VideoCallProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [roomId, setRoomId] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "active" | "ended">("idle");
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Generate room ID when component mounts
  useEffect(() => {
    const newRoomId = `${classCode}-${Date.now()}`;
    setRoomId(newRoomId);
  }, [classCode]);

  const startCall = async () => {
    setCallStatus("connecting");
    
    try {
      // Simulate connecting to a video call service
      // In a real implementation, you would use WebRTC and a signaling server
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled,
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setIsCallActive(true);
      setCallStatus("active");
      
      // Simulate students joining
      setTimeout(() => {
        setParticipants(["Student 1", "Student 2", "Student 3"]);
      }, 3000);
      
    } catch (error) {
      console.error("Error starting call:", error);
      setCallStatus("idle");
      alert("Failed to start video call. Please check your camera and microphone permissions.");
    }
  };

  const endCall = () => {
    // Stop local stream
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }
    
    setIsCallActive(false);
    setCallStatus("ended");
    setParticipants([]);
    
    // Reset after a delay
    setTimeout(() => {
      setCallStatus("idle");
    }, 2000);
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    // In a real implementation, you would toggle the video track
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    // In a real implementation, you would toggle the audio track
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert("Room ID copied to clipboard!");
  };

  if (callStatus === "idle") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Start Video Call
          </CardTitle>
          <CardDescription>
            Start a video call for your class: {classCode}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Room ID</Label>
            <div className="flex gap-2">
              <Input value={roomId} readOnly />
              <Button variant="outline" size="sm" onClick={copyRoomId}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Share this Room ID with your students to join the call
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={startCall} 
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Video className="h-4 w-4 mr-2" />
              Start Call
            </Button>
          </div>
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
            <h3 className="text-lg font-medium">Connecting to video call...</h3>
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
            <p className="text-gray-600 mt-2">The video call has been ended</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Local Video */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">You (Teacher)</CardTitle>
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
                <Badge variant="secondary">Teacher</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Remote Video / Participants */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Students</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative bg-gray-900 aspect-video">
              {participants.length > 0 ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-white text-center">
                    <Users className="h-12 w-12 mx-auto mb-2" />
                    <p>{participants.length} students joined</p>
                    <div className="mt-2 space-y-1">
                      {participants.map((participant, index) => (
                        <div key={index} className="text-sm bg-black bg-opacity-50 rounded px-2 py-1">
                          {participant}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-white text-center">
                    <Users className="h-12 w-12 mx-auto mb-2" />
                    <p>Waiting for students to join...</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
              onClick={endCall}
              className="rounded-full h-12 w-12"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Room ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{roomId}</span>
            </p>
            <Button
              variant="link"
              size="sm"
              onClick={copyRoomId}
              className="text-blue-600"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy Room ID
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}