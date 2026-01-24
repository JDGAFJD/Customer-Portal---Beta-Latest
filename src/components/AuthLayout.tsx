import { motion } from 'framer-motion'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[44%_56%]" style={{ background: '#f7faf9' }}>
      <div 
        className="hidden lg:flex relative overflow-hidden"
        style={{
          background: `
            radial-gradient(1200px 900px at 20% 20%, rgba(255,255,255,0.18), transparent 60%),
            radial-gradient(900px 700px at 70% 70%, rgba(0,0,0,0.12), transparent 55%),
            linear-gradient(135deg, #10a37f, #0b8a67 55%, #0a7e60)
          `
        }}
      >
        <div className="relative z-10 flex flex-col justify-center w-full" style={{ padding: 'clamp(32px, 5vw, 64px)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-white max-w-[520px]"
          >
            <h1 
              className="font-extrabold mb-4 tracking-tight"
              style={{ fontSize: 'clamp(40px, 4vw, 56px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
            >
              Nomad Internet
            </h1>
            
            <h2 
              className="font-bold mb-6 opacity-95"
              style={{ fontSize: 'clamp(22px, 2.3vw, 32px)', lineHeight: 1.15 }}
            >
              Stay Connected Anywhere
            </h2>
            
            <p className="text-base leading-relaxed mb-10 opacity-90 max-w-[46ch]" style={{ lineHeight: 1.7 }}>
              Reliable internet service for the modern nomad. Access your account to manage your service, view usage, and more.
            </p>
            
            <div className="grid grid-cols-3 gap-6 mt-8">
              <div className="pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.25)' }}>
                <div className="text-[34px] font-extrabold leading-tight" style={{ letterSpacing: '-0.02em' }}>24/7</div>
                <div className="mt-1.5 text-xs uppercase tracking-widest opacity-90">Support</div>
              </div>
              <div className="pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.25)' }}>
                <div className="text-[34px] font-extrabold leading-tight" style={{ letterSpacing: '-0.02em' }}>99.9%</div>
                <div className="mt-1.5 text-xs uppercase tracking-widest opacity-90">Uptime</div>
              </div>
              <div className="pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.25)' }}>
                <div className="text-[34px] font-extrabold leading-tight" style={{ letterSpacing: '-0.02em' }}>50+</div>
                <div className="mt-1.5 text-xs uppercase tracking-widest opacity-90">States</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div 
        className="flex items-center justify-center"
        style={{
          padding: 'clamp(24px, 4vw, 64px)',
          background: `
            radial-gradient(900px 600px at 80% 30%, rgba(16, 163, 127, 0.10), transparent 55%),
            radial-gradient(700px 500px at 20% 80%, rgba(15, 23, 42, 0.06), transparent 55%),
            #f7faf9
          `
        }}
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[520px] glass-card rounded-2xl"
          style={{ padding: 'clamp(28px, 3vw, 44px)' }}
        >
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.svg" 
              alt="Nomad Internet" 
              className="h-12"
            />
          </div>
          
          {children}
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center text-xs"
            style={{ color: 'rgba(100, 116, 139, 0.9)' }}
          >
            &copy; {new Date().getFullYear()} Nomad Internet. All rights reserved.
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
