import { getAllDepartments } from '@/apis/department.api'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import path from '@/constants/path'
import ConsultantWorking from '@/pages/User/Home/components/ConsultantWorking'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { Link, createSearchParams, useSearchParams } from 'react-router-dom'

export default function AsideNav() {
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: getAllDepartments
  })

  // Lấy id phòng ban đang chọn từ URL (string)
  const [params] = useSearchParams()
  const activeId = (params.get('departmentId') ?? '').trim()

  const itemClasses = (active: boolean) =>
    clsx(
      'text-left text-sm rounded-md transition-colors select-none',
      active
        ? 'bg-primary text-primary-foreground font-semibold shadow-sm ring-1 ring-primary/30'
        : 'hover:bg-accent hover:text-accent-foreground'
    )

  return (
    <aside>
      <div className="h-remain-screen">
        <ScrollArea className="h-1/2">
          <div className="px-4 py-2 h-1/2">
            <div className="mb-2 pt-2 rounded-sm font-bold text-lg px-2 text-gray-500">
              Câu hỏi theo đơn vị
            </div>

            <ul className="space-y-1">
              {/* Tất cả phòng ban (active khi không có departmentId trên URL) */}
              <li className={itemClasses(activeId === '')}>
                <Link
                  to={{ pathname: path.home }}
                  className="block px-3 py-3 font-semibold"
                  aria-current={activeId === '' ? 'page' : undefined}
                >
                  Tất cả phòng ban
                </Link>
              </li>

              {/* Danh sách phòng ban */}
              {departments?.data.data?.map((d: { id: number | string; name: string }) => {
                const idStr = String(d.id).trim()
                const isActive = idStr === activeId && activeId !== ''
                return (
                  <li key={idStr} className={itemClasses(isActive)}>
                    <Link
                      to={{
                        pathname: path.home,
                        search: createSearchParams({ departmentId: idStr }).toString()
                      }}
                      className="block px-3 py-3 font-semibold"
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {d.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </ScrollArea>

        <Separator className="my-2" />

        <div className="px-4 h-1/2">
          <ConsultantWorking />
        </div>
      </div>
    </aside>
  )
}
