"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

interface ProfileSettingsProps {
    initialName: string
    userId: string
}

export function ProfileSettings({ initialName, userId }: ProfileSettingsProps) {
    const [name, setName] = useState(initialName)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSave = async () => {
        if (name.length < 2) {
            alert("Name must be at least 2 characters")
            return
        }
        setIsLoading(true)

        try {
            const res = await fetch("/api/profiles", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to update profile")
            }

            router.refresh()
        } catch (error) {
            console.error("Error updating profile:", error)
            alert("Failed to update profile. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
            <CardHeader>
                <CardTitle className="text-white">Profile Settings</CardTitle>
                <CardDescription className="text-slate-400">Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <Label htmlFor="name" className="text-slate-200">Display Name</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your name"
                    />
                </div>

                {name !== initialName && (
                    <div className="pt-4 border-t border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <Button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200"
                        >
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
