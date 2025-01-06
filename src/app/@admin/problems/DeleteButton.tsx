'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DeleteQuestionDialog from './DeleteQuestionDialog'
import { deleteQuestion } from '@/app/actions/delete-question'

interface DeleteButtonProps {
  problemId: string
  title: string
}

export default function DeleteButton({ problemId, title }: DeleteButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    try {
      await deleteQuestion(problemId)
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error deleting question:', error)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
      >
        Delete
      </button>
      <DeleteQuestionDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title={title}
      />
    </>
  )
}