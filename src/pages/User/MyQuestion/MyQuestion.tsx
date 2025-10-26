import { deleteUserQuestion, getMyQuestions } from '@/apis/question.api'
import { getProfile } from '@/apis/user.api'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import path from '@/constants/path'
import useQuestionQueryConfig, { QuestionQueryConfig } from '@/hooks/useQuestionQueryConfig'
import { Question as QuestionType } from '@/types/question.type'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import QuestionFilter from '@/components/ui/question-filter'
import QuestionCard from '@/components/ui/question-card'
import QuestionPagination from '@/components/ui/question-pagination'
import QuestionDetail from '@/components/ui/question-detail'
import QuestionForm from '@/components/ui/question-form'
import { AlertTriangle, FileText, X } from 'lucide-react'

export const dialogViewType = {
  detail: 'detail',
  deleteConfirm: 'delete-confirm',
  updateQuestion: 'update-question'
} as const

export default function MyQuestion() {
  const queryConfig: QuestionQueryConfig = useQuestionQueryConfig()

  // dialog
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [dialogView, setDialogView] = useState<string>('')
  const [questionActive, setQuestionActive] = useState<QuestionType>()

  const closeDialog = useCallback(() => {
    setIsOpen(false)
    setDialogView('')
    setQuestionActive(undefined)
  }, [])

  const openDialog = useCallback((type: string) => {
    setIsOpen(true)
    setDialogView(type)
  }, [])

  // Reset dialog state when component unmounts
  useEffect(() => {
    return () => {
      setIsOpen(false)
      setDialogView('')
      setQuestionActive(undefined)
    }
  }, [])

  const { data: questionsOfUser, refetch } = useQuery({
    queryKey: ['questions', queryConfig],
    queryFn: () => getMyQuestions(queryConfig),
    retry: 1,
    retryDelay: 1000
  })

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile
  })

  const deleteQuestionMutation = useMutation({
    mutationFn: (id: string) => deleteUserQuestion(id)
  })

  const handleDeleteQuestion = () => {
    if (!questionActive?.id) return
    deleteQuestionMutation.mutate(questionActive?.id, {
      onSuccess: (res) => {
        toast.success(res.data.message)
        refetch()
      }
    })
    closeDialog()
  }

  const renderConfirmDeleteQuestion = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Thông tin câu hỏi sẽ bị xóa:</p>
        </div>
      </div>
      
      <Separator />
      
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Đơn vị:</span>
              <span className="text-sm font-semibold text-blue-600">#{questionActive?.department.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Lĩnh vực:</span>
              <span className="text-sm font-semibold text-blue-600">#{questionActive?.field.name}</span>
            </div>
            <div className="pt-2">
              <span className="text-sm font-medium text-muted-foreground">Tiêu đề:</span>
              <p className="text-sm font-semibold text-foreground mt-1 break-words">
                🎯 {questionActive?.title}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => setIsOpen(false)}>
          Hủy
        </Button>
        <Button
          disabled={deleteQuestionMutation.isPending}
          variant="destructive"
          onClick={handleDeleteQuestion}
          className="px-6"
        >
          {deleteQuestionMutation.isPending ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang xóa...
            </div>
          ) : (
            'Xóa câu hỏi'
          )}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="bg-background rounded-lg border p-6">
        <QuestionFilter queryConfig={queryConfig} path={path.myQuestions} />
      </div>
      <Separator />

      {/* Questions List */}
      <div className="space-y-4">
        {!questionsOfUser && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Chưa có câu hỏi nào</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Bạn chưa tạo câu hỏi nào. Hãy tạo câu hỏi đầu tiên để bắt đầu nhận hỗ trợ từ các chuyên gia.
            </p>
          </div>
        )}
        
        {questionsOfUser?.data.data.content.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            openDialog={openDialog}
            setQuestionActive={setQuestionActive}
          />
        ))}
      </div>

      {/* Pagination */}
      {questionsOfUser && questionsOfUser.data.data.totalPages > 1 && (
        <div className="flex justify-center">
          <QuestionPagination
            path={path.myQuestions}
            queryConfig={queryConfig}
            pageSize={questionsOfUser.data.data.totalPages}
          />
        </div>
      )}

      {/* Custom Modal for question actions */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeDialog}
          />
          
          {/* Modal Content */}
          <div className="relative bg-background rounded-lg border shadow-lg w-full lg:w-[800px] max-w-full max-h-[80vh] overflow-y-auto m-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-lg font-semibold">
                  {dialogView === dialogViewType.detail && 'Chi tiết câu hỏi'}
                  {dialogView === dialogViewType.updateQuestion && 'Chỉnh sửa câu hỏi'}
                  {dialogView === dialogViewType.deleteConfirm && 'Xác nhận xóa câu hỏi'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {dialogView === dialogViewType.detail && 'Xem thông tin chi tiết về câu hỏi của bạn'}
                  {dialogView === dialogViewType.updateQuestion && 'Cập nhật thông tin câu hỏi của bạn'}
                  {dialogView === dialogViewType.deleteConfirm && 'Bạn chắc chắn muốn xóa câu hỏi này chứ?'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeDialog}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {dialogView === dialogViewType.detail && questionActive && (
                <QuestionDetail question={questionActive as QuestionType} />
              )}
              {dialogView === dialogViewType.updateQuestion && (
                <QuestionForm 
                  question={questionActive} 
                  profileData={profileData?.data.data}
                  onUpdateSuccess={closeDialog} 
                />
              )}
              {dialogView === dialogViewType.deleteConfirm && (
                renderConfirmDeleteQuestion()
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
