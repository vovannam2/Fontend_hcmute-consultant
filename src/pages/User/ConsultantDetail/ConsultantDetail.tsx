import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getConsultantById } from '@/apis/consultant.api'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building2, 
  GraduationCap,
  User,
  MessageCircle
} from 'lucide-react'
import path from '@/constants/path'

export default function ConsultantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Get consultant detail
  const { data: consultantResponse, isLoading } = useQuery({
    queryKey: ['consultant-detail', id],
    queryFn: () => getConsultantById(id as string),
    enabled: !!id
  })
  const consultant = consultantResponse?.data.data

  if (isLoading) {
    return (
      <div className='min-h-screen bg-background pt-20 pb-12 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!consultant) {
    return (
      <div className='min-h-screen bg-background pt-20 pb-12 flex items-center justify-center'>
        <div className='text-center'>
          <GraduationCap className='w-20 h-20 text-gray-300 mx-auto mb-4' strokeWidth={1.5} />
          <p className='text-lg font-semibold text-gray-700 mb-2'>Không tìm thấy tư vấn viên</p>
          <Button onClick={() => navigate(path.consultants)}>Quay lại</Button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background pt-20 pb-12'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Back Button */}
        <Button
          variant='ghost'
          onClick={() => navigate(path.consultants)}
          className='mb-6'
        >
          <ArrowLeft className='w-4 h-4 mr-2' />
          Quay lại
        </Button>

        {/* Profile Card */}
        <Card className='overflow-hidden border-2 border-gray-200 shadow-xl'>
          {/* Header with gradient */}
          <div className='bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 p-8'>
            <div className='flex items-center gap-6'>
              <Avatar className='h-24 w-24 ring-4 ring-white shadow-xl'>
                <AvatarImage src={consultant.avatarUrl} alt={consultant.fullName} />
                <AvatarFallback className='bg-gradient-to-br from-white to-blue-100 text-blue-600 font-bold text-2xl'>
                  {consultant.fullName[0]}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1 text-white'>
                <div className='flex items-center gap-3 mb-2'>
                  <Badge className='bg-green-500 text-white border-0'>✓ Tư vấn viên</Badge>
                  {consultant.isOnline && (
                    <Badge className='bg-emerald-500 text-white border-0 flex items-center gap-1'>
                      <div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
                      Đang online
                    </Badge>
                  )}
                </div>
                <h1 className='text-3xl font-bold mb-2'>{consultant.fullName}</h1>
                {consultant.department && (
                  <div className='flex items-center gap-2 text-blue-100'>
                    <Building2 className='w-5 h-5' />
                    <p className='text-lg'>{consultant.department.name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <CardContent className='p-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Contact Information */}
              <div className='space-y-4'>
                <h2 className='text-xl font-semibold text-foreground mb-4'>Thông tin liên hệ</h2>
                
                <div className='flex items-center gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100'>
                  <div className='p-3 rounded-lg bg-blue-500 text-white'>
                    <Mail className='w-5 h-5' />
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground mb-1'>Email</p>
                    <p className='font-medium text-foreground'>{consultant.email || 'Chưa cập nhật'}</p>
                  </div>
                </div>

                <div className='flex items-center gap-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100'>
                  <div className='p-3 rounded-lg bg-indigo-500 text-white'>
                    <Phone className='w-5 h-5' />
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground mb-1'>Số điện thoại</p>
                    <p className='font-medium text-foreground'>{consultant.phone || 'Chưa cập nhật'}</p>
                  </div>
                </div>
              </div>

              {/* Department Information */}
              <div className='space-y-4'>
                <h2 className='text-xl font-semibold text-foreground mb-4'>Phòng ban</h2>
                
                <div className='flex items-center gap-4 p-4 rounded-xl bg-purple-50 border border-purple-100'>
                  <div className='p-3 rounded-lg bg-purple-500 text-white'>
                    <Building2 className='w-5 h-5' />
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground mb-1'>Thuộc khoa</p>
                    <p className='font-medium text-foreground'>
                      {consultant.department?.name || 'Chưa có phòng ban'}
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-4 p-4 rounded-xl bg-green-50 border border-green-100'>
                  <div className='p-3 rounded-lg bg-green-500 text-white'>
                    <User className='w-5 h-5' />
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground mb-1'>Vai trò</p>
                    <p className='font-medium text-foreground'>Tư vấn viên</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200'>
              <Button
                className='flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300'
                onClick={() => navigate(path.createQuestion)}
              >
                <GraduationCap className='w-5 h-5 mr-2' />
                Đặt câu hỏi cho tư vấn viên
              </Button>
              <Button
                variant='outline'
                className='flex-1 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl transition-all duration-300'
                onClick={() => navigate(path.messages)}
              >
                <MessageCircle className='w-5 h-5 mr-2' />
                Nhắn tin
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

