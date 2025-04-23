import { MainNav } from "@/components/main-nav"
import { Sidebar } from "@/components/sidebar"
import { AUsersGrid } from "@/components/a-users-grid"

export default function AUsersPage() {
  return (
    <div className="min-h-screen">
      <MainNav />
      <div className="container grid grid-cols-1 md:grid-cols-12 gap-6 py-6">
        <aside className="hidden md:block md:col-span-3">
          <Sidebar className="sticky top-20" />
        </aside>

        <main className="md:col-span-9 space-y-6">
          <AUsersGrid />
        </main>
      </div>
    </div>
  )
}
