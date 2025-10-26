import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getAllConsultant } from '@/apis/consultant.api'
import { getAllDepartments } from '@/apis/department.api'
import useConsultantQueryConfig, { ConsultantQueryConfig } from '@/hooks/useConsultantQueryConfig'
import type { Consultant } from '@/types/consultant.type'
import type { Department } from '@/types/department.type'
import { useQuery } from '@tanstack/react-query'
import { createSearchParams, useNavigate } from 'react-router-dom'
import { Search, GraduationCap, Building2, ChevronRight } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import path from '@/constants/path'

export default function Consultant() {
  const queryConfig: ConsultantQueryConfig = useConsultantQueryConfig()
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState(queryConfig.name || '')
  const [selectedDepartment, setSelectedDepartment] = useState(queryConfig.departmentId || '')

  // Get all departments for filter
  const { data: departmentsResponse } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getAllDepartments()
  })
  const departments = departmentsResponse?.data.data || []

  // Get consultants
  const { data: consultantsResponse, isLoading } = useQuery({
    queryKey: ['consultants', queryConfig],
    queryFn: () => getAllConsultant(queryConfig)
  })
  const consultants = consultantsResponse?.data.data?.content || []
  const totalElements = consultantsResponse?.data.data?.totalElements || 0

  // Update URL when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      const params: any = { ...queryConfig }
      
      if (searchValue.trim()) {
        params.name = searchValue.trim()
      } else {
        delete params.name
      }
      
      if (selectedDepartment) {
        params.departmentId = selectedDepartment
      } else {
        delete params.departmentId
      }
      
      navigate({
        pathname: path.consultants,
        search: createSearchParams(params).toString()
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [searchValue, selectedDepartment])

  const displayDepartment = useMemo(() => {
    return departments.find((d: Department) => d.id.toString() === selectedDepartment)
  }, [departments, selectedDepartment])

  return (
    <div className='min-h-screen bg-background pt-20 pb-12'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg'>
              <GraduationCap className='w-8 h-8 text-white' strokeWidth={2} />
            </div>
            <div>
              <h1 className='text-3xl font-bold text-foreground'>Tư vấn viên</h1>
              <p className='text-muted-foreground'>Khám phá các chuyên gia tư vấn của chúng tôi</p>
            </div>
          </div>

          {/* Filter Section */}
          <div className='flex flex-col md:flex-row gap-4 mt-6'>
            {/* Search */}
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' strokeWidth={1.5} />
              <input
                type='text'
                placeholder='Tìm kiếm tư vấn viên...'
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className='w-full pl-10 pr-4 py-3 rounded-xl bg-white border-2 border-gray-200 focus:border-primary focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200'
              />
            </div>

            {/* Department Filter */}
            <div className='relative'>
              <Building2 className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' strokeWidth={1.5} />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className='w-full md:w-64 pl-10 pr-8 py-3 rounded-xl bg-white border-2 border-gray-200 focus:border-primary focus:ring-0 text-sm text-foreground cursor-pointer appearance-none'
              >
                <option value=''>Tất cả phòng ban</option>
                {departments.map((dept: Department) => (
                  <option key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <ChevronRight className='absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none rotate-90' />
            </div>
          </div>

          {/* Results count */}
          <div className='mt-4 text-sm text-muted-foreground'>
            {totalElements > 0 ? (
              <>
                Tìm thấy <span className='font-semibold text-primary'>{totalElements}</span> tư vấn viên
                {displayDepartment && ` - ${displayDepartment.name}`}
              </>
            ) : (
              'Không có tư vấn viên nào'
            )}
          </div>
        </div>

        {/* Consultants Grid */}
        {isLoading ? (
          <div className='flex items-center justify-center py-20'>
            <div className='text-center'>
              <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
              <p className='text-muted-foreground'>Đang tải...</p>
            </div>
          </div>
        ) : consultants.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {consultants.map((consultant: Consultant) => (
              <Card
                key={consultant.id}
                className='group relative overflow-hidden border border-gray-200 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 cursor-pointer'
              >
                <div className='p-6'>
                  {/* Consultant Header */}
                  <div className='flex items-start gap-4 mb-4'>
                    <Avatar className='h-16 w-16 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300'>
                      <AvatarImage src={consultant.avatarUrl} alt={consultant.fullName} />
                      <AvatarFallback className='bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold text-lg'>
                        {consultant.fullName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1 min-w-0'>
                      <h3 className='text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors truncate'>
                        {consultant.fullName}
                      </h3>
                      <div className='flex items-center gap-2'>
                        <Building2 className='w-4 h-4 text-primary' strokeWidth={2} />
                        <p className='text-sm text-muted-foreground truncate'>
                          {consultant.department?.name || 'Chưa có phòng ban'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Department Badge */}
                  {consultant.department && (
                    <div className='mb-4'>
                      <Badge variant='secondary' className='bg-blue-50 text-blue-700 border-blue-200'>
                        {consultant.department.name}
                      </Badge>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    className='w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group/btn'
                    onClick={() => navigate(`/consultants/${consultant.id}`)}
                  >
                    <span className='flex items-center gap-2'>
                      Xem chi tiết
                      <ChevronRight className='w-4 h-4 group-hover/btn:translate-x-1 transition-transform' />
                    </span>
                  </Button>
                </div>

                {/* Decorative gradient overlay */}
                <div className='absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300 pointer-events-none'></div>
              </Card>
            ))}
          </div>
        ) : (
          <div className='flex items-center justify-center py-20 bg-gray-50 rounded-2xl border border-gray-200'>
            <div className='text-center'>
              <GraduationCap className='w-20 h-20 text-gray-300 mx-auto mb-4' strokeWidth={1.5} />
              <p className='text-lg font-semibold text-gray-700 mb-2'>Không tìm thấy tư vấn viên</p>
              <p className='text-sm text-gray-500'>Thử thay đổi bộ lọc của bạn</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

