import LogoHCMUTE from '@/assets/images/logos/logo_hcmute.png'

interface Props {
  readonly children: React.ReactNode
}

// Simple AuthHeader component using only UI components
function AuthHeader() {
  return (
    <header className='w-full shadow-lg py-2 px-12 flex items-center justify-between fixed top-0 left-0 z-30 bg-white h-header-height'>
      <div className='flex items-center'>
        <img src={LogoHCMUTE} alt='logo-hcmute' className='size-16' />
        <div className='font-bold text-primary ml-6'>
          TƯ VẤN VÀ HỖ TRỢ SINH VIÊN TRƯỜNG ĐẠI HỌC SƯ PHẠM KỸ THUẬT THÀNH PHỐ HỒ CHÍ MINH
        </div>
      </div>
    </header>
  )
}

// Simple Footer component using only UI components
function Footer() {
  return (
    <footer className='bg-background border-t py-8 mt-auto'>
      <div className='container mx-auto px-4'>
        <div className='text-center text-muted-foreground'>
          <p>&copy; 2024 HCMUTE - Hệ thống tư vấn sinh viên</p>
        </div>
      </div>
    </footer>
  )
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className='min-h-screen flex flex-col'>
      <AuthHeader />
      <div className='mt-[var(--header-height)] flex-1'>{children}</div>
      <Footer />
    </div>
  )
}
