'use client'
import { SetStateAction, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

interface AIProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (description: string) => Promise<void>
}

export function AIProjectModal({ isOpen, onClose, onGenerate }: AIProjectModalProps) {
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!description.trim()) return
    setIsGenerating(true)
    try {
      await onGenerate(description)
      onClose()
    } catch (error) {
      console.error('Error generating contract:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">AI-Powered Smart Contract Generation</DialogTitle>
          <DialogDescription className="text-gray-400">
            Describe your smart contract requirements and let AI generate the code for you.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <Textarea
            placeholder="Describe your smart contract (e.g., 'Create a token with max supply of 1000000 and ability to mint and burn')"
            value={description}
            onChange={(e: { target: { value: SetStateAction<string> } }) => setDescription(e.target.value)}
            className="h-32 bg-zinc-800 border-zinc-700 text-white"
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !description.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Contract'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}