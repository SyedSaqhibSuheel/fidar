import React, { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:8080/iam/accounts/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`, // store token in localStorage/session
          },
        })

        if (!response.ok) throw new Error("Failed to fetch profile")

        const data = await response.json()
        setProfile(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="ml-6">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-60" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Failed to load profile.
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md p-6 shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatarUrl || ""} />
              <AvatarFallback>
                {profile.firstName?.[0]}
                {profile.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>
                {profile.firstName} {profile.lastName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>
        </CardHeader>

        <Separator className="my-4" />

        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">Username</Label>
            <p className="text-base">{profile.username}</p>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Role</Label>
            <p className="text-base">{profile.role}</p>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Joined</Label>
            <p className="text-base">
              {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>

          <Button className="w-full mt-4">Edit Profile</Button>
        </CardContent>
      </Card>
    </div>
  )
}
