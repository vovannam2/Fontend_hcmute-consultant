import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import DialogDeleteForwardQuestion from '@/pages/Manage/ManageForwardQuestion/components/DialogDeleteForwardQuestion'
import DialogForwardQuestion from '@/pages/Manage/ManageForwardQuestion/components/DialogForwardQuestion'
import { ForwardQuestion } from '@/types/question.type'
import { TrashIcon } from '@radix-ui/react-icons'
import { Edit2Icon } from 'lucide-react'

interface Props {
  readonly forwardQuestions?: ForwardQuestion[]
}

export default function ForwardQuestionTable({ forwardQuestions }: Props) {
  return (
    <Table className='bg-background font-semibold'>
      <TableHeader>
        <TableRow className='bg-primary !text-primary-foreground'>
          <TableHead className='!text-primary-foreground'>Chuyển đến</TableHead>
          <TableHead className='!text-primary-foreground'>Tiêu đề</TableHead>
          <TableHead className='!text-primary-foreground'>Thời gian</TableHead>
          <TableHead className='!text-primary-foreground'>Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {forwardQuestions?.map((question) => (
          <TableRow key={question.id} className='hover:bg-gray-50'>
            <TableCell className='font-medium'>{question.toDepartment.name}</TableCell>
            <TableCell className='max-w-md truncate'>{question.title}</TableCell>
            <TableCell>{new Date(question.createdAt).toLocaleDateString('vi-VN')}</TableCell>
            <TableCell>
              <div className='flex items-center space-x-2'>
                <DialogForwardQuestion forwardQuestion={question}>
                  <Edit2Icon className='size-4 cursor-pointer text-blue-600 hover:text-blue-800' strokeWidth={1.5} />
                </DialogForwardQuestion>
                <DialogDeleteForwardQuestion forwardQuestion={question}>
                  <TrashIcon className='size-5 text-destructive cursor-pointer hover:text-red-700' />
                </DialogDeleteForwardQuestion>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
