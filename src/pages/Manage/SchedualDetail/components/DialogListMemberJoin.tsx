import { listMemberJoin } from '@/apis/consultant.api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { SchedualConsultant } from '@/types/consultant.type'
import { useQuery } from '@tanstack/react-query'

interface Props {
  readonly children: React.ReactNode
  readonly schedule?: SchedualConsultant
}

export interface MemberJoin {
  registeredAt: string
  status: boolean
  userName: string
  avatarUrl: string
}

export default function DialogListMemberJoin({ children, schedule }: Props) {
  const idSchedule = schedule?.id
  const { data: members } = useQuery({
    queryKey: ['members-join', idSchedule],
    queryFn: () => listMemberJoin(String(idSchedule)),
    enabled: !!idSchedule
  })
  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Người dùng tham gia</DialogTitle>
        </DialogHeader>
        <div className='space-y-2'>
          {members?.data.data.content.map((member) => (
            <div key={member.userName} className='flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                <Avatar>
                  <AvatarImage src={member.avatarUrl} alt={member.userName} />
                  <AvatarFallback>{member.userName?.charAt(0)?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <p className='text-sm font-semibold'>{member.userName}</p>
              </div>
              <p className='text-muted-foreground text-xs font-medium'>{member.registeredAt}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
