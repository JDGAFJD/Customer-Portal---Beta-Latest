import { motion } from 'framer-motion'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[42%] bg-gradient-to-br from-nomad-primary via-nomad-primary to-nomad-accent relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-40 right-20 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center w-full px-10 lg:px-14 py-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white max-w-sm"
          >
            <div className="mb-10">
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-1">
                Nomad Internet
              </h1>
              <div className="flex items-center gap-3 mt-3">
                <div className="w-8 h-0.5 bg-white/60 rounded-full" />
                <h2 className="text-xl lg:text-2xl font-medium text-white/90">
                  Stay Connected Anywhere
                </h2>
              </div>
            </div>
            
            <p className="text-white/75 text-base lg:text-lg leading-relaxed mb-16">
              Reliable internet service for the modern nomad. Access your account to manage your service, view usage, and more.
            </p>
            
            <div className="flex items-start">
              <div className="pr-6">
                <div className="text-2xl lg:text-3xl font-bold">24/7</div>
                <div className="text-white/60 text-xs uppercase tracking-wider mt-1">Support</div>
              </div>
              <div className="px-6 border-l-2 border-white/30">
                <div className="text-2xl lg:text-3xl font-bold">99.9%</div>
                <div className="text-white/60 text-xs uppercase tracking-wider mt-1">Uptime</div>
              </div>
              <div className="pl-6 border-l-2 border-white/30">
                <div className="text-2xl lg:text-3xl font-bold">50+</div>
                <div className="text-white/60 text-xs uppercase tracking-wider mt-1">States</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center bg-gradient-to-br from-gray-50 via-white to-gray-50 px-6 py-12 lg:px-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 lg:p-10">
            <div className="flex justify-center mb-8">
              <img 
                src="/logo.svg" 
                alt="Nomad Internet" 
                className="h-12"
              />
            </div>
            
            {children}
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center text-gray-400 text-sm"
          >
            &copy; {new Date().getFullYear()} Nomad Internet. All rights reserved.
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
