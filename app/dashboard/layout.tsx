// app/dashboard/layout.tsx
import Header from "../components/dashboard/Header"
import Sidebar from "../components/dashboard/Sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header /> 
      <div className="flex flex-1 pt-16 md:pt-0">
        <Sidebar />
        <div className="flex-1">
          <main className="p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}