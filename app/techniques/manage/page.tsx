'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Loader2, Save } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useQueryClient } from '@tanstack/react-query'
import {
    useCreateReviewTechnique,
    useUpdateReviewTechnique,
    useReviewTechnique,
    useDeleteReviewTechnique,
    reviewTechniqueKeys
} from '@/lib/hooks/use-review-techniques'
import { PageHeader } from '@/components/page-header'
import { SidebarNav } from '@/components/navigation/sidebar-nav'
import { MobileBottomNav } from '@/components/navigation/mobile-bottom-nav'
import { PageSkeleton } from '@/components/loading/page-skeleton'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Dynamic import of markdown editor to avoid SSR issues
const MDEditor = dynamic(
    () => import('@uiw/react-md-editor').then((mod) => mod.default),
    { ssr: false }
)

interface Video {
    youtubeUrl: string
    title?: string
}

function TechniqueManageForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const techniqueId = searchParams.get('id')
    const queryClient = useQueryClient()

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [notes, setNotes] = useState('')
    const [category, setCategory] = useState('')
    const [beltLevel, setBeltLevel] = useState('')
    const [difficulty, setDifficulty] = useState('')
    const [trainingType, setTrainingType] = useState('')
    const [videos, setVideos] = useState<Video[]>([{ youtubeUrl: '' }])
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    // Fetch technique if in edit mode
    const { data: technique, isLoading: isFetching } = useReviewTechnique(techniqueId || '')

    const createTechnique = useCreateReviewTechnique({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reviewTechniqueKeys.all })
            router.push('/techniques')
        },
    })

    const updateTechnique = useUpdateReviewTechnique({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reviewTechniqueKeys.all })
            router.push('/techniques')
        },
    })

    const deleteTechnique = useDeleteReviewTechnique({
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reviewTechniqueKeys.all })
            router.push('/techniques')
        },
    })

    useEffect(() => {
        if (technique && techniqueId) {
            setName(technique.name || '')
            setDescription(technique.description || '')
            setNotes(technique.notes || '')
            setCategory(technique.category || '')
            setBeltLevel(technique.beltLevel || '')
            setDifficulty(technique.difficulty || '')
            setTrainingType(technique.trainingType || '')
            setVideos(
                technique.videos?.length > 0
                    ? technique.videos.map((v) => ({ youtubeUrl: v.youtubeUrl, title: v.title || '' }))
                    : [{ youtubeUrl: '' }]
            )
        }
    }, [technique, techniqueId])

    const addVideo = () => {
        setVideos([...videos, { youtubeUrl: '' }])
    }

    const removeVideo = (index: number) => {
        if (videos.length > 1) {
            setVideos(videos.filter((_, i) => i !== index))
        }
    }

    const updateVideo = (index: number, field: keyof Video, value: string) => {
        const newVideos = [...videos]
        newVideos[index] = { ...newVideos[index], [field]: value }
        setVideos(newVideos)
    }

    const handleSubmit = () => {
        if (!name.trim()) return

        const validVideos = videos.filter((v) => v.youtubeUrl.trim() !== '')

        const data = {
            name: name.trim(),
            description: description.trim() || undefined,
            notes: notes.trim() || undefined,
            category: (category || undefined) as any, // Cast to match stricter type
            beltLevel: (beltLevel || undefined) as any,
            difficulty: (difficulty || undefined) as any,
            trainingType: (trainingType || undefined) as any,
            videos: validVideos.length > 0 ? validVideos : undefined,
        }

        if (techniqueId) {
            updateTechnique.mutate({ id: techniqueId, data })
        } else {
            createTechnique.mutate(data)
        }
    }

    const handleDelete = async () => {
        if (!techniqueId) return
        deleteTechnique.mutate(techniqueId)
    }

    const isPending = createTechnique.isPending || updateTechnique.isPending || deleteTechnique.isPending

    if (techniqueId && isFetching) {
        return <div className="text-center py-20 text-muted-foreground">Loading technique...</div>
    }

    return (
        <>
            <PageHeader
                title={techniqueId ? 'Edit Technique' : 'Add New Technique'}
                subtitle={techniqueId ? 'Update your technique details' : 'Add a new technique to your library'}
                backButton={true}
                actions={
                    techniqueId && (
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => setIsDeleteDialogOpen(true)}
                            disabled={isPending}
                        >
                            <Trash2 className="w-4 h-4" />
                            <span className="sr-only">Delete</span>
                        </Button>
                    )
                }
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Technique?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this technique from your library.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
                <div className="space-y-8">
                    {/* Main Info Card */}
                    <section className="p-6 rounded-3xl bg-card border border-border/50 space-y-6">
                        <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>

                        <div className="grid gap-6">
                            <div>
                                <Label htmlFor="name" className="text-muted-foreground">
                                    Technique Name <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Butterfly Guard Sweep"
                                    className="bg-background/50 border-input mt-2"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description" className="text-muted-foreground">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief description of the technique..."
                                    rows={3}
                                    className="bg-background/50 border-input mt-2 resize-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Classification Card */}
                    <section className="p-6 rounded-3xl bg-card border border-border/50 space-y-6">
                        <h3 className="text-lg font-semibold text-foreground">Classification</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="category" className="text-muted-foreground">Category</Label>
                                <select
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-background/50 border border-input rounded-md px-3 py-2 text-foreground mt-2"
                                >
                                    <option value="">Select category</option>
                                    <option value="guard">Guard</option>
                                    <option value="submissions">Submissions</option>
                                    <option value="sweeps">Sweeps</option>
                                    <option value="takedowns">Takedowns</option>
                                    <option value="transitions">Transitions</option>
                                    <option value="escapes">Escapes</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="trainingType" className="text-muted-foreground">Training Type</Label>
                                <select
                                    id="trainingType"
                                    value={trainingType}
                                    onChange={(e) => setTrainingType(e.target.value)}
                                    className="w-full bg-background/50 border border-input rounded-md px-3 py-2 text-foreground mt-2"
                                >
                                    <option value="">Select type</option>
                                    <option value="gi">Gi</option>
                                    <option value="no-gi">No-Gi</option>
                                    <option value="both">Both</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="beltLevel" className="text-muted-foreground">Belt Level</Label>
                                <select
                                    id="beltLevel"
                                    value={beltLevel}
                                    onChange={(e) => setBeltLevel(e.target.value)}
                                    className="w-full bg-background/50 border border-input rounded-md px-3 py-2 text-foreground mt-2"
                                >
                                    <option value="">Select level</option>
                                    <option value="white">White Belt</option>
                                    <option value="blue">Blue Belt</option>
                                    <option value="purple">Purple Belt</option>
                                    <option value="brown">Brown Belt</option>
                                    <option value="black">Black Belt</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="difficulty" className="text-muted-foreground">Difficulty</Label>
                                <select
                                    id="difficulty"
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    className="w-full bg-background/50 border border-input rounded-md px-3 py-2 text-foreground mt-2"
                                >
                                    <option value="">Select difficulty</option>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                    <option value="expert">Expert</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Videos Card */}
                    <section className="p-6 rounded-3xl bg-card border border-border/50 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">Video Resources</h3>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={addVideo}
                                className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Video
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {videos.map((video, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            value={video.youtubeUrl}
                                            onChange={(e) => updateVideo(index, 'youtubeUrl', e.target.value)}
                                            placeholder="YouTube URL (e.g. https://youtube.com/watch?v=...)"
                                            className="bg-background/50 border-input"
                                        />
                                        <Input
                                            value={video.title || ''}
                                            onChange={(e) => updateVideo(index, 'title', e.target.value)}
                                            placeholder="Video title (optional)"
                                            className="bg-background/50 border-input"
                                        />
                                    </div>
                                    {videos.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeVideo(index)}
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 mt-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Notes Card */}
                    <section className="p-6 rounded-3xl bg-card border border-border/50 space-y-6">
                        <h3 className="text-lg font-semibold text-foreground">Detailed Notes</h3>
                        <div data-color-mode="dark" className="w-full">
                            <MDEditor
                                value={notes}
                                onChange={(val) => setNotes(val || '')}
                                height={300}
                                preview="edit"
                                textareaProps={{
                                    placeholder: 'Add detailed technical notes, steps, or observations...',
                                }}
                                className="bg-background/50 border-input rounded-md overflow-hidden"
                            />
                        </div>
                    </section>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button
                            onClick={handleSubmit}
                            disabled={isPending || !name.trim()}
                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-8 rounded-2xl shadow-lg shadow-primary/10 transition-all"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Technique
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="px-8 py-4 rounded-2xl font-semibold border-border hover:bg-card"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default function TechniqueManagePage() {
    return (
        <div className="min-h-screen bg-background">
            <SidebarNav />
            <MobileBottomNav />
            <main className="lg:ml-64 pb-20 lg:pb-8">
                <Suspense fallback={<PageSkeleton />}>
                    <TechniqueManageForm />
                </Suspense>
            </main>
        </div>
    )
}
