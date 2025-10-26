import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { questionStatus } from '@/constants/questionStatus'
import { Question as QuestionType } from '@/types/question.type'
import { formatDate } from '@/utils/utils'
import { Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  readonly question: QuestionType
  readonly openDialog: (type: string) => void
  readonly setQuestionActive: React.Dispatch<React.SetStateAction<QuestionType | undefined>>
}

export default function QuestionCard({ question, openDialog, setQuestionActive, className }: Props) {
  const handleOpenDialog = (type: string) => {
    setQuestionActive(question)
    openDialog(type)
  }

  return (
    <Card className={cn('hover:shadow-md transition-shadow duration-200', className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={question.askerAvatarUrl} alt="avatar" />
              <AvatarFallback>
                {question.askerFullName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-sm text-foreground truncate">
                  {question.askerFullName}
                </h4>
                <span className="text-xs text-muted-foreground">
                  {formatDate(question.createdAt)}
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="bg-blue-50 text-blue-600 text-xs">
                  {question.department.name}
                </Badge>
                <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 text-xs">
                  {question.field.name}
                </Badge>
                {question.questionFilterStatus === questionStatus.deleted && (
                  <Badge variant="destructive" className="text-xs">
                    Đã xóa
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleOpenDialog('detail')}>
                <Eye className="mr-2 h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleOpenDialog('update-question')}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleOpenDialog('delete-confirm')}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mt-3">
          <h3 className="font-semibold text-base text-foreground mb-2 line-clamp-2">
            🎯 {question.title}
          </h3>
          <div className="text-sm text-muted-foreground line-clamp-3" 
               dangerouslySetInnerHTML={{ __html: question.content }}>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
