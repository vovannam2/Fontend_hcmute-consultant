import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import DialogAnswerQuestion from '@/pages/Manage/ManageQuestion/components/DialogAnswerQuestion'
import { Question } from '@/types/question.type'
import { ColumnDef } from '@tanstack/react-table'
import { EllipsisIcon } from 'lucide-react'

export const colums: ColumnDef<Question>[] = [
  {
    accessorKey: 'id',
    header: 'Id',
    cell: ({ row }) => <div className='capitalize font-semibold'>{row.getValue('id')}</div>
  },
  {
    accessorKey: 'department',
    header: 'Khoa',
    cell: ({ row }) => {
      const department = row.getValue('department') as { id: number; name: string }
      const originalDepartment = row.getValue('originalDepartment') as { id: number; name: string } | undefined
      
      return (
        <div className='capitalize font-semibold'>
          {department?.name}
          {originalDepartment && (
            <div className='text-xs text-gray-500 mt-1'>
              Chuyển từ: {originalDepartment.name}
            </div>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: 'field',
    header: 'Lĩnh vực',
    cell: ({ row }) => (
      <div className='capitalize font-semibold'>{(row.getValue('field') as { id: number; name: string })?.name}</div>
    )
  },
  {
    accessorKey: 'title',
    header: 'Tiêu đề',
    cell: ({ row }) => <div className='capitalize font-semibold'>{row.getValue('title')}</div>
  },
  {
    accessorKey: 'createdAt',
    header: 'Ngày hỏi',
    cell: ({ row }) => <div className='capitalize font-semibold'>{row.getValue('createdAt')}</div>
  },
  {
    accessorKey: 'questionFilterStatus',
    header: 'Trạng thái',
    cell: ({ row }) => <div className='capitalize font-semibold'>{row.getValue('questionFilterStatus')}</div>
  },
  {
    accessorKey: 'action',
    header: 'Hành động',
    cell: ({ row }) => {
      const question = row.original as Question

      return (
        <div className='capitalize font-semibold'>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <EllipsisIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DialogAnswerQuestion question={question} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  }
]
